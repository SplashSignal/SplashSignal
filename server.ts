import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Pipeline Imports
import { detectChain, normalizeIdentifier } from './src/services/pipeline/chainDetector';
import { fetchMetadata } from './src/services/pipeline/metadataFetcher';
import { fetchLiquidity } from './src/services/pipeline/liquidityAnalyzer';
import { fetchHolders } from './src/services/pipeline/holderAnalyzer';
import { clusterWallets } from './src/services/pipeline/walletClusterer';
import { scoreRisk } from './src/services/pipeline/riskScorer';
import { temporalAnalysis } from './src/services/pipeline/temporalAnalyzer';
import { generateVerdict } from './src/services/pipeline/verdictGenerator';
import { AnalysisResult } from './src/types/signalos';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'signalos-secret-key';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = new Database('signalos.db');

  // --- Database Initialization ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      chain TEXT NOT NULL,
      identifier TEXT NOT NULL,
      status TEXT NOT NULL,
      results_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS saved_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      analysis_id TEXT NOT NULL,
      label TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );
  `);

  app.use(cors());
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- Analysis Pipeline Execution ---
  async function runFullAnalysis(id: string, input: string, userId?: string) {
    try {
      const chain = detectChain(input);
      const identifier = normalizeIdentifier(input);

      // Step 1: Metadata
      const metadata = await fetchMetadata(chain, identifier);
      
      // Step 2: Holders
      const holders = await fetchHolders(chain, identifier);
      
      // Step 3: Liquidity
      const liquidity = await fetchLiquidity(chain, identifier);
      
      // Step 4: Clusters
      const clusters = await clusterWallets(identifier);
      
      // Step 5: Risk & Signals
      const { risk, signals } = scoreRisk(metadata, holders, liquidity, clusters);
      
      // Step 6: Temporal
      const temporal = await temporalAnalysis(identifier);
      
      // Step 7: Verdict
      const verdict = generateVerdict(risk);

      const result: AnalysisResult = {
        id,
        chain,
        identifier,
        metadata,
        holders,
        liquidity,
        clusters,
        signals,
        risk,
        temporal,
        verdict,
        timestamp: Date.now()
      };

      db.prepare('UPDATE analyses SET status = ?, results_json = ? WHERE id = ?')
        .run('COMPLETED', JSON.stringify(result), id);
        
      console.log(`Analysis ${id} completed for ${metadata.symbol}`);
    } catch (error) {
      console.error(`Analysis ${id} failed:`, error);
      db.prepare('UPDATE analyses SET status = ? WHERE id = ?').run('FAILED', id);
    }
  }

  // --- Auth Routes ---
  app.post('/api/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    try {
      db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
        .run(id, username, hash);
      const token = jwt.sign({ userId: id }, JWT_SECRET);
      res.json({ success: true, token, userId: id, username });
    } catch (e) {
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ success: true, token, userId: user.id, username: user.username });
  });

  // --- Analysis Routes ---
  app.post('/api/analyze/init', async (req, res) => {
    const { input } = req.body;
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {}
    }

    const id = uuidv4();
    const chain = detectChain(input);
    const identifier = normalizeIdentifier(input);

    db.prepare('INSERT INTO analyses (id, user_id, chain, identifier, status) VALUES (?, ?, ?, ?, ?)')
      .run(id, userId || null, chain, identifier, 'PENDING');

    // Run in background
    runFullAnalysis(id, input, userId);
    
    res.json({ analysisId: id, detectedChain: chain, status: 'PENDING' });
  });

  app.get('/api/analysis/:id/summary', (req, res) => {
    const row = db.prepare('SELECT results_json, status FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.status === 'PENDING') return res.json({ status: 'PENDING' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json({
      verdict: results.verdict,
      risk: results.risk.compositeRugLikelihood,
      chain: results.chain,
      timestamp: results.timestamp
    });
  });

  app.get('/api/analysis/:id/metadata', (req, res) => {
    const row = db.prepare('SELECT results_json FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row || !row.results_json) return res.status(404).json({ error: 'Not found' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json(results.metadata);
  });

  app.get('/api/analysis/:id/holders', (req, res) => {
    const row = db.prepare('SELECT results_json FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row || !row.results_json) return res.status(404).json({ error: 'Not found' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json(results.holders);
  });

  app.get('/api/analysis/:id/clusters', (req, res) => {
    const row = db.prepare('SELECT results_json FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row || !row.results_json) return res.status(404).json({ error: 'Not found' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json(results.clusters);
  });

  app.get('/api/analysis/:id/liquidity', (req, res) => {
    const row = db.prepare('SELECT results_json FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row || !row.results_json) return res.status(404).json({ error: 'Not found' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json(results.liquidity);
  });

  app.get('/api/analysis/:id/risk', (req, res) => {
    const row = db.prepare('SELECT results_json FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row || !row.results_json) return res.status(404).json({ error: 'Not found' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json(results.risk);
  });

  app.get('/api/analysis/:id/temporal', (req, res) => {
    const row = db.prepare('SELECT results_json FROM analyses WHERE id = ?').get(req.params.id) as any;
    if (!row || !row.results_json) return res.status(404).json({ error: 'Not found' });
    const results = JSON.parse(row.results_json) as AnalysisResult;
    res.json(results.temporal);
  });

  // --- User Archive Routes ---
  app.get('/api/me/archive', authenticate, (req: any, res) => {
    const items = db.prepare(`
      SELECT a.id, a.chain, a.identifier, a.status, a.created_at, a.results_json
      FROM analyses a
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `).all(req.userId) as any[];
    
    res.json(items.map(item => ({
      id: item.id,
      chain: item.chain,
      identifier: item.identifier,
      status: item.status,
      createdAt: item.created_at,
      symbol: item.results_json ? JSON.parse(item.results_json).metadata.symbol : null
    })));
  });

  app.post('/api/me/archive/save', authenticate, (req: any, res) => {
    const { analysisId, label } = req.body;
    const id = uuidv4();
    try {
      db.prepare('INSERT INTO saved_items (id, user_id, analysis_id, label) VALUES (?, ?, ?, ?)')
        .run(id, req.userId, analysisId, label);
      res.json({ success: true, id });
    } catch (e) {
      res.status(400).json({ error: 'Failed to save' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SignalOS Full-Stack Server running on port ${PORT}`);
  });
}

startServer();

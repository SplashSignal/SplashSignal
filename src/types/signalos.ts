
export type Chain = 'ethereum' | 'base' | 'solana';

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  chain: Chain;
  creationBlock?: number;
  creationSlot?: number;
  deployer: string;
  launchpadType?: 'pumpfun' | 'bonk' | 'standard';
  bondingCurveProgress?: number;
  isGraduated?: boolean;
}

export interface Holder {
  address: string;
  balance: string;
  percentage: number;
  isContract: boolean;
  isCreator: boolean;
}

export interface HolderAnalysis {
  top10Percentage: number;
  giniCoefficient: number;
  singleWalletDominance: boolean;
  creatorShare: number;
  holders: Holder[];
}

export interface LiquidityPool {
  platform: string;
  address: string;
  liquidityUSD: number;
  isLocked: boolean;
  ownershipPercentage: number;
  proximityToDev: number; // 0-100
}

export interface LiquidityAnalysis {
  primaryPools: LiquidityPool[];
  totalLiquidityUSD: number;
  lpOwnershipRisk: number;
  removalRisk: number;
  depthScore: number;
}

export interface WalletCluster {
  type: 'funding' | 'timing' | 'behavioral' | 'insider';
  wallets: string[];
  coordinationScore: number;
  evidence: string[];
}

export interface Signal {
  id: string;
  name: string;
  value: any;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskScore {
  score: number; // 0-100
  label: string;
  evidence: string[];
  confidence: number; // 0-1
}

export interface RiskAssessment {
  ownershipRisk: RiskScore;
  concentrationRisk: RiskScore;
  liquidityRisk: RiskScore;
  insiderCoordinationRisk: RiskScore;
  contractRisk: RiskScore;
  compositeRugLikelihood: RiskScore;
}

export interface TemporalPoint {
  phase: 'launch' | 'early_accumulation' | 'distribution';
  timestamp: number;
  momentum: number;
  dispersion: number;
  velocity: number;
}

export interface TemporalAnalysis {
  currentPhase: string;
  temporalScores: {
    launchMomentum: number;
    participationDispersion: number;
    clusterPersistence: number;
    liquidityVelocity: number;
  };
  temporalEvidence: string[];
}

export interface AnalysisResult {
  id: string;
  chain: Chain;
  identifier: string;
  metadata: TokenMetadata;
  holders: HolderAnalysis;
  liquidity: LiquidityAnalysis;
  clusters: WalletCluster[];
  signals: Signal[];
  risk: RiskAssessment;
  temporal: TemporalAnalysis;
  verdict: {
    summary: string;
    explanation: string;
    confidence: number;
  };
  timestamp: number;
}

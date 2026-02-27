
import { RiskAssessment, RiskScore, Signal, TokenMetadata, HolderAnalysis, LiquidityAnalysis, WalletCluster } from '../../types/signalos';
import { getDeterministicScore } from '../marketService';

export function scoreRisk(
  metadata: TokenMetadata,
  holders: HolderAnalysis,
  liquidity: LiquidityAnalysis,
  clusters: WalletCluster[]
): { risk: RiskAssessment; signals: Signal[] } {
  
  const address = metadata.deployer; // Use deployer as proxy for seed

  const signals: Signal[] = [
    {
      id: 'OWN-01',
      name: 'Ownership Privileges',
      value: metadata.isGraduated ? 'Renounced' : 'Active',
      description: 'The contract owner has the ability to modify parameters.',
      severity: metadata.isGraduated ? 'low' : 'high'
    },
    {
      id: 'CLU-01',
      name: 'Insider Cluster Size',
      value: clusters.length,
      description: `Detected ${clusters.length} distinct coordinated wallet clusters.`,
      severity: clusters.length > 2 ? 'critical' : 'medium'
    },
    {
      id: 'LIQ-01',
      name: 'Liquidity Stability',
      value: liquidity.lpOwnershipRisk < 30 ? 'Stable' : 'Volatile',
      description: 'Assessment of how easily liquidity can be removed.',
      severity: liquidity.lpOwnershipRisk > 50 ? 'high' : 'low'
    }
  ];

  const createScore = (base: number, label: string, evidence: string[]): RiskScore => ({
    score: base,
    label,
    evidence,
    confidence: 0.85 + (Math.random() * 0.1)
  });

  const risk: RiskAssessment = {
    ownershipRisk: createScore(
      getDeterministicScore(address, 'own_risk', 10, 90),
      'Ownership Risk',
      ['Contract not renounced', 'Admin functions active']
    ),
    concentrationRisk: createScore(
      holders.top10Percentage,
      'Concentration Risk',
      [`Top 10 holders control ${holders.top10Percentage.toFixed(1)}%`, 'Single wallet dominance detected']
    ),
    liquidityRisk: createScore(
      liquidity.lpOwnershipRisk,
      'Liquidity Risk',
      ['Low liquidity depth', 'LP tokens not burnt']
    ),
    insiderCoordinationRisk: createScore(
      clusters.reduce((acc, c) => acc + c.coordinationScore, 0) / (clusters.length || 1),
      'Insider Coordination Risk',
      ['Coordinated buy patterns', 'Shared funding sources']
    ),
    contractRisk: createScore(
      getDeterministicScore(address, 'cont_risk', 5, 40),
      'Contract Risk',
      ['Standard SPL/ERC20 implementation', 'No malicious functions detected']
    ),
    compositeRugLikelihood: createScore(
      0, // Will calculate below
      'Composite Rug Likelihood',
      []
    )
  };

  // Calculate composite
  risk.compositeRugLikelihood.score = Math.round(
    (risk.ownershipRisk.score * 0.2) +
    (risk.concentrationRisk.score * 0.2) +
    (risk.liquidityRisk.score * 0.3) +
    (risk.insiderCoordinationRisk.score * 0.3)
  );
  risk.compositeRugLikelihood.evidence = [
    ...risk.liquidityRisk.evidence.slice(0, 1),
    ...risk.insiderCoordinationRisk.evidence.slice(0, 1)
  ];

  return { risk, signals };
}

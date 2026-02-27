
import { Chain, TokenMetadata } from '../../types/signalos';
import { getDeterministicScore } from '../marketService';

export async function fetchMetadata(chain: Chain, address: string): Promise<TokenMetadata> {
  // In a real implementation, we would use viem for EVM and @solana/web3.js for Solana
  // For this implementation, we use deterministic simulation based on the address
  
  const nameSeed = getDeterministicScore(address, 'name', 0, 1000);
  const names = ['Pepe', 'Dogecoin', 'Shiba Inu', 'Floki', 'Bonk', 'Wif', 'Popcat', 'Mog', 'Brett', 'Toshi'];
  const symbols = ['PEPE', 'DOGE', 'SHIB', 'FLOKI', 'BONK', 'WIF', 'POPCAT', 'MOG', 'BRETT', 'TOSHI'];
  
  const name = names[nameSeed % names.length];
  const symbol = symbols[nameSeed % symbols.length];
  
  const metadata: TokenMetadata = {
    name,
    symbol,
    decimals: chain === 'solana' ? 6 : 18,
    totalSupply: "1000000000000000",
    chain,
    creationBlock: chain === 'solana' ? undefined : 18000000 + (nameSeed * 100),
    creationSlot: chain === 'solana' ? 250000000 + (nameSeed * 1000) : undefined,
    deployer: `0x${address.slice(2, 10)}...${address.slice(-4)}`,
  };

  // Solana Launchpad Logic
  if (chain === 'solana') {
    const isPumpFun = address.toLowerCase().endsWith('pump'); // Heuristic
    if (isPumpFun) {
      metadata.launchpadType = 'pumpfun';
      metadata.bondingCurveProgress = getDeterministicScore(address, 'bonding', 0, 100);
      metadata.isGraduated = metadata.bondingCurveProgress === 100;
    } else if (nameSeed % 5 === 0) {
      metadata.launchpadType = 'bonk';
    } else {
      metadata.launchpadType = 'standard';
    }
  }

  return metadata;
}

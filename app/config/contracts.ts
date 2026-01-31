import ArenaTokenABI from '../abi/ArenaTokenABI.json';
import CreatorArenaABI from '../abi/CreatorArenaABI.json';

export const CONTRACTS = {
  // Base Sepolia Testnet Addresses
  // REPLACE THESE AFTER DEPLOYMENT
  CREATOR_ARENA: {
    address: "0x1adcd83d5ca32e75C57d52e524310739DF34fBD7" as `0x${string}`, 
    abi: CreatorArenaABI
  },
  ARENA_TOKEN: {
    address: "0xf6A1c35b69F606a3fe06e5efFB42F7b57F643e5D" as `0x${string}`,
    abi: ArenaTokenABI
  }
} as const;

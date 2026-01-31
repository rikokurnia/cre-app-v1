
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

const ADDRESS = '0xd58b814C7Ce700f251722b5555e25aE0fa8169A1';

const ABI = parseAbi([
  'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)'
]);

async function main() {
    const client = createPublicClient({ 
        chain: base,
        transport: http('https://mainnet.base.org')
    });

    try {
        console.log("Reading eip712Domain...");
        const domain = await client.readContract({
            address: ADDRESS,
            abi: ABI,
            functionName: 'eip712Domain'
        });
        console.log("Domain:", domain);
    } catch (e) {
        console.log("eip712Domain failed, trying DOMAIN_SEPARATOR...");
        try {
            const sep = await client.readContract({
                address: ADDRESS,
                abi: ABI,
                functionName: 'DOMAIN_SEPARATOR'
            });
            console.log("Separator:", sep);
        } catch (e2) {
            console.error("Both failed", e2);
        }
    }
}

main();

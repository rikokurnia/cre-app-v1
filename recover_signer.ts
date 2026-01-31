
import { recoverTypedDataAddress } from 'viem';

const CHAIN_ID = 8453;
const VERIFYING_CONTRACT = '0xd58b814C7Ce700f251722b5555e25aE0fa8169A1';

const TYPES_WITH_NUMCONTRACTS = {
    Order: [
        { name: 'maker', type: 'address' },
        { name: 'orderExpiryTimestamp', type: 'uint256' },
        { name: 'collateral', type: 'address' },
        { name: 'isCall', type: 'bool' },
        { name: 'priceFeed', type: 'address' },
        { name: 'implementation', type: 'address' },
        { name: 'isLong', type: 'bool' },
        { name: 'maxCollateralUsable', type: 'uint256' },
        { name: 'strikes', type: 'uint256[]' },
        { name: 'expiry', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'numContracts', type: 'uint256' },
        { name: 'extraOptionData', type: 'bytes' }
    ]
} as const;

const TYPES_WITHOUT_NUMCONTRACTS = {
    Order: [
        { name: 'maker', type: 'address' },
        { name: 'orderExpiryTimestamp', type: 'uint256' },
        { name: 'collateral', type: 'address' },
        { name: 'isCall', type: 'bool' },
        { name: 'priceFeed', type: 'address' },
        { name: 'implementation', type: 'address' },
        { name: 'isLong', type: 'bool' },
        { name: 'maxCollateralUsable', type: 'uint256' },
        { name: 'strikes', type: 'uint256[]' },
        { name: 'expiry', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'extraOptionData', type: 'bytes' }
    ]
} as const;

async function check(orderJson: any, numContracts: bigint, domainName: string, version: string, useNumContracts: boolean) {
    const domain = {
        name: domainName,
        version: version,
        chainId: CHAIN_ID,
        verifyingContract: VERIFYING_CONTRACT
    } as const;

    const message: any = {
        maker: orderJson.maker,
        orderExpiryTimestamp: BigInt(orderJson.orderExpiryTimestamp),
        collateral: orderJson.collateral,
        isCall: orderJson.isCall,
        priceFeed: orderJson.priceFeed,
        implementation: orderJson.implementation,
        isLong: orderJson.isLong,
        maxCollateralUsable: BigInt(orderJson.maxCollateralUsable),
        strikes: orderJson.strikes.map((s:any) => BigInt(s)),
        expiry: BigInt(orderJson.expiry),
        price: BigInt(orderJson.price),
        extraOptionData: orderJson.extraOptionData as `0x${string}`
    };

    if (useNumContracts) {
        message.numContracts = numContracts;
    }

    try {
        const recovered = await recoverTypedDataAddress({
            domain,
            types: useNumContracts ? TYPES_WITH_NUMCONTRACTS : TYPES_WITHOUT_NUMCONTRACTS,
            primaryType: 'Order',
            message,
            signature: orderJson.signature as `0x${string}`
        });

        if (recovered.toLowerCase() === orderJson.maker.toLowerCase()) {
            return true;
        }
    } catch (e) {
        // console.error(e);
    }
    return false;
}

const ORDER_DATA = {
    "order": {
        "ticker": "ETH-2FEB26-2675-C",
        "maker": "0xf1711BA7E74435032AA103Ef20a4cBeCE40B6df5",
        "orderExpiryTimestamp": 1769847960,
        "collateral": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "isCall": true,
        "priceFeed": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
        "implementation": "0xEeEB29c9454974C89c5Fb1b3190fcb46b74f1eA1",
        "isLong": false,
        "maxCollateralUsable": "10000000000",
        "strikes": [
          267500000000
        ],
        "expiry": 1770019200,
        "price": "3983181569",
        "extraOptionData": "0x"
    },
    "signature": "0x164f6c55a0e76dc6afc5fc62506ad50d8cd9279812fdbb53b6b7fb97e1e5134c66d04724efc4264ce45441b4c23c37051463dbf0f7957f1495a13e8d17163aa71b"
};

async function main() {
    const CONTRACT_CANDIDATES = [
        0n,
        1n,
        10n,
        100n,
        1000n,
        10000n,
        100000n,
        1000000n,
        10000000n,
        100000000n,
        1000000000n,
        BigInt(1e6),
        BigInt(1e18),
        BigInt("10000000000"), // matches maxCollateralUsable
        BigInt("267500000000"), // Strike
        BigInt("3983181569"), // Price
        BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935") // MAX_UINT
    ];

    const DOMAIN_NAMES = [
        "OptionBook", 
        "Thetanuts", 
        "Thetanuts Finance", 
        "Thetanuts Option Book",
        "Thetanuts OptionBook",
        "Thetanuts V4"
    ];

    const VERSIONS = ["1", "2", "3", "4", "V4", "v4", "1.0", "1.0.0"];

    console.log("Starting brute force recovery...");

    const o = ORDER_DATA.order;
    (o as any).signature = ORDER_DATA.signature;

    console.log("Checking WITHOUT numContracts first...");
    for (const name of DOMAIN_NAMES) {
        for (const ver of VERSIONS) {
             const match = await check(o, 0n, name, ver, false);
             if (match) {
                console.log(`\n\n!!! MATCH FOUND (No numContracts) !!!`);
                console.log(`Domain Name: "${name}"`);
                console.log(`Version: "${ver}"`);
                return;
             }
        }
    }
    
    console.log("Checking WITH numContracts...");
    let count = 0;
    for (const name of DOMAIN_NAMES) {
        for (const ver of VERSIONS) {
            console.log(`Checking Domain: "${name}" v"${ver}"...`);
            for (const contracts of CONTRACT_CANDIDATES) {
                count++;
                if (count % 10 === 0) process.stdout.write("."); 
                const match = await check(o, contracts, name, ver, true);
                if (match) {
                    console.log(`\n\n!!! MATCH FOUND !!!`);
                    console.log(`Domain Name: "${name}"`);
                    console.log(`Version: "${ver}"`);
                    console.log(`numContracts: ${contracts.toString()}`);
                    return;
                }
            }
            console.log("");
        }
    }
    console.log("No match found.");
}

main();

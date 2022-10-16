
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "MR-G-D-NFT Test1: Ensure that nft can be minted by the deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer)

        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);

        block.receipts[0].events.expectNonFungibleTokenMintEvent(types.uint(1), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")

    },
});

Clarinet.test({
    name: "MR-G-D-NFT Test2: Ensure that minted nft uri can be retreived",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [
                types.principal(deployer)
            ], deployer)

        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);

        let uri = chain.callReadOnlyFn("mr-grade-d-nft", "get-token-uri", [types.uint(1)], deployer)
        assertEquals(uri.result, "(ok none)");

    },
});

Clarinet.test({
    name: "MR-G-D-NFT Test3: Ensure that owner is correct!",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),
            Tx.contractCall("mr-grade-d-nft", "get-owner", [types.uint(1)], deployer)

        ]);

        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);

        const owner = block.receipts[1].result.expectOk().expectSome()

        assertEquals(owner, deployer)

    },
});

Clarinet.test({
    name: "MR-G-D-NFT Test4: Ensure that nft can be transferred",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;
        const wallet2 = accounts.get("wallet_1")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),
            Tx.contractCall("mr-grade-d-nft", "transfer", [types.uint(1), types.principal(deployer), types.principal(wallet2)], deployer),
            Tx.contractCall("mr-grade-d-nft", "get-owner", [types.uint(1)], deployer)

        ]);

        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);
        block.receipts[1].result.expectOk().expectBool(true)

        block.receipts[1].events.expectNonFungibleTokenTransferEvent(
            types.uint(1),
            deployer,
            wallet2,
            `${deployer}.mr-grade-d-nft`,
            "mr-grade-D-nft"
        )
        const owner = block.receipts[2].result.expectOk().expectSome()
        assertEquals(owner, wallet2)

    },
});

Clarinet.test({
    name: "MR-G-D-NFT Test5: Ensure that nft cannot be transferred if caller is not owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;
        const wallet2 = accounts.get("wallet_1")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(wallet2)], deployer),
            Tx.contractCall("mr-grade-d-nft", "transfer", [types.uint(1), types.principal(deployer), types.principal(wallet2)], wallet2),
            Tx.contractCall("mr-grade-d-nft", "get-owner", [types.uint(1)], deployer)

        ]);

        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);
        block.receipts[1].result.expectErr().expectUint(101);


        const owner = block.receipts[2].result.expectOk().expectSome()

        assertEquals(owner, wallet2)

    },
});


Clarinet.test({
    name: "MR-G-D-NFT Test6: Ensure multiple mints work",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),
            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),
            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),


        ]);

        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);
        block.receipts[1].result.expectOk().expectUint(2);
        block.receipts[2].result.expectOk().expectUint(3);

        block.receipts[0].events.expectNonFungibleTokenMintEvent(types.uint(1), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")
        block.receipts[1].events.expectNonFungibleTokenMintEvent(types.uint(2), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")
        block.receipts[2].events.expectNonFungibleTokenMintEvent(types.uint(3), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")
    },
});

Clarinet.test({
    name: "MR-G-D-NFT Test7: Ensure that the total count of nfts minted can be retreived!",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get("deployer")!.address;

        let block = chain.mineBlock([

            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),
            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),
            Tx.contractCall("mr-grade-d-nft", "mint", [types.principal(deployer)], deployer),


        ]);

        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        block.receipts[0].result.expectOk().expectUint(1);
        block.receipts[1].result.expectOk().expectUint(2);
        block.receipts[2].result.expectOk().expectUint(3);

        block.receipts[0].events.expectNonFungibleTokenMintEvent(types.uint(1), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")
        block.receipts[1].events.expectNonFungibleTokenMintEvent(types.uint(2), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")
        block.receipts[2].events.expectNonFungibleTokenMintEvent(types.uint(3), deployer,
            `${deployer}.mr-grade-d-nft`, "mr-grade-D-nft")

        let count = chain.callReadOnlyFn("mr-grade-d-nft", "get-last-token-id", [], deployer);
        count.result.expectOk().expectUint(3);
    },
});

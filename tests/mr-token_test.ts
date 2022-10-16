
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "MR-Token Test1: Ensure that FT Asset Name is correct!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let block = chain.callReadOnlyFn("mr-token", "get-name", [], deployer.address);
        block.result.expectOk().expectAscii("mr-token");
    },
});

Clarinet.test({
    name: "MR-Token Test2: Ensure that FT Symbol is correct!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let block = chain.callReadOnlyFn("mr-token", "get-symbol", [], deployer.address);
        block.result.expectOk().expectAscii("MRT");
    },
});

Clarinet.test({
    name: "MR-Token Test3: Ensure that FT Decimals are correct!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let block = chain.callReadOnlyFn("mr-token", "get-decimals", [], deployer.address);
        block.result.expectOk().expectUint(6);
    },
});

Clarinet.test({
    name: "MR-Token Test4: Ensure that Contract owner can mint Fungible Token",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(300), types.principal(deployer)], deployer)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[0].events.expectFungibleTokenMintEvent(300, deployer, "mr-token");
    },
});

Clarinet.test({
    name: "MR-Token Test5: Ensure that person other than Contract owner cannot mint FT",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(300), types.principal(deployer.address)], wallet1.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectErr().expectUint(100);
    },
});

Clarinet.test({
    name: "MR-Token Test6: Ensure that FT Balance is correct!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        let balanceBefore = chain.callReadOnlyFn("mr-token", "get-balance", [types.principal(deployer)], deployer);
        balanceBefore.result.expectOk().expectUint(0);
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(340), types.principal(deployer)], deployer)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        let balanceAfter = chain.callReadOnlyFn("mr-token", "get-balance", [types.principal(deployer)], deployer);
        balanceAfter.result.expectOk().expectUint(340);
    },
});

Clarinet.test({
    name: "MR-Token Test7: Ensure that FT total supply is correct!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const wallet1 = accounts.get("wallet_1")!.address;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(300), types.principal(deployer)], deployer),
            Tx.contractCall("mr-token", "mint", [types.uint(500), types.principal(wallet1)], deployer)
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        let totalSupply = chain.callReadOnlyFn("mr-token", "get-total-supply", [], deployer);
        totalSupply.result.expectOk().expectUint(800);
    },
});

Clarinet.test({
    name: "MR-Token Test8: Ensure that the correct token uri is returned!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(30), types.principal(deployer)], deployer)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        let uri = chain.callReadOnlyFn("mr-token", "get-token-uri", [], deployer);
        uri.result.expectOk().expectNone();
    },
});

Clarinet.test({
    name: "MR-Token Test9: Ensure that FT can be transferred!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const wallet1 = accounts.get("wallet_1")!.address;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(300), types.principal(deployer)], deployer),
            Tx.contractCall("mr-token", "transfer", [
                types.uint(100),
                types.principal(deployer),
                types.principal(wallet1),
                types.none()
            ], deployer)
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        block.receipts[1].events.expectFungibleTokenTransferEvent(100, deployer, wallet1, "mr-token");
    },
});

Clarinet.test({
    name: "MR-Token Test10: Ensure that FT cannot be transferred if sender does not have enough balance!",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const wallet1 = accounts.get("wallet_1")!.address;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(100), types.principal(deployer)], deployer),
            Tx.contractCall("mr-token", "transfer", [
                types.uint(3000),
                types.principal(deployer),
                types.principal(wallet1),
                types.none()
            ], deployer)
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr().expectUint(1);

    },
});






// // Clarinet.test({
// //     name: "Ensure that <...>",
// //     async fn(chain: Chain, accounts: Map<string, Account>) {
// //         let block = chain.mineBlock([
// //             /* 
// //              * Add transactions with: 
// //              * Tx.contractCall(...)
// //             */
// //         ]);
// //         assertEquals(block.receipts.length, 0);
// //         assertEquals(block.height, 2);

// //         block = chain.mineBlock([
// //             /* 
// //              * Add transactions with: 
// //              * Tx.contractCall(...)
// //             */
// //         ]);
// //         assertEquals(block.receipts.length, 0);
// //         assertEquals(block.height, 3);
// //     },
// // });

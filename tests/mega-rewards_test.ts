
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "MR-Contract Test-1: Ensure that anyone can send funds (STX and FT-Token) to the project. Functions tested: 'fund-contract', 'mint'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const sponsor = accounts.get("wallet_2")!.address;
        const contractAddress = deployer + ".mega-rewards";
        const sponsorStxFund = 2000;
        const sponsorTokenFund = 4000;
        let block1 = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(sponsorTokenFund), types.principal(sponsor)], deployer)
        ]);

        assertEquals(block1.receipts.length, 1);
        assertEquals(block1.height, 2);

        block1.receipts[0].result.expectOk().expectBool(true);
        block1.receipts[0].events.expectFungibleTokenMintEvent(sponsorTokenFund, sponsor, "mr-token");
        const [ftContractPrincipal, ftName] = block1.receipts[0].events[0].ft_mint_event.asset_identifier.split('::');



        let block2 = chain.mineBlock([
            Tx.contractCall("mega-rewards", "fund-contract", [types.principal(ftContractPrincipal), types.uint(sponsorStxFund), types.uint(sponsorTokenFund)], sponsor)
        ]);
        assertEquals(block2.receipts.length, 1);
        assertEquals(block2.height, 3);
        assertEquals(block2.receipts[0].result, '(ok "SUCCESS")');
        block2.receipts[0].events.expectSTXTransferEvent(sponsorStxFund, sponsor, contractAddress);
        block2.receipts[0].events.expectFungibleTokenTransferEvent(sponsorTokenFund, sponsor, contractAddress, ftName);
    },
});

Clarinet.test({
    name: "MR-Contract Test-2: Ensure that the deployer can whitelist evaluators. Functions tested: 'whitelist-evaluator'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const evaluator = accounts.get("wallet_2")!;
        let block = chain.mineBlock([

            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator.address)], deployer.address)

        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);
        // assertEquals(block.receipts[0].result, '(ok true)');
    },
});

Clarinet.test({
    name: "MR-Contract Test-3: Ensure that it failes if someone other then the deployer tries to whitelist evaluators. Functions tested: 'whitelist-evaluator'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user = accounts.get("wallet_1")!;
        const evaluator = accounts.get("wallet_2")!;
        let block = chain.mineBlock([

            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator.address)], user.address)

        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectErr().expectUint(100);
        // assertEquals(block.receipts[0].result, '(err u100)');
    },
});

Clarinet.test({
    name: "MR-Contract Test-4: Ensure that a whitelisted evaluator can register laureates with grades 'A', 'B', 'C' or 'D'. Functions tested: 'register-laureate', 'get-laureates-list', 'update-laureates-list', 'compute-shares', 'update-laureates-share'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator = accounts.get("wallet_1")!.address;
        const laureate = accounts.get("wallet_2")!.address;


        let block = chain.mineBlock([
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate), types.ascii("A")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate), types.ascii("D")], evaluator)
        ]);
        assertEquals(block.receipts.length, 5);
        assertEquals(block.height, 2);
        assertEquals(block.receipts[1].result, '(ok "SUCCESS")');
        assertEquals(block.receipts[2].result, '(ok "SUCCESS")');
        assertEquals(block.receipts[3].result, '(ok "SUCCESS")');
        assertEquals(block.receipts[4].result, '(ok "SUCCESS")');
    },
});

Clarinet.test({
    name: "MR-Contract Test-5: Ensure that a whitelisted evaluator cannot register laureates with grades other than 'A', 'B', 'C' and 'D'. Functions tested: 'register-laureate', 'get-laureates-list', 'update-laureates-list', 'compute-shares', 'update-laureates-share'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator = accounts.get("wallet_1")!.address;
        const laureate = accounts.get("wallet_2")!.address;


        let block = chain.mineBlock([
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate), types.ascii("E")], evaluator)
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);
        assertEquals(block.receipts[1].result, '(err u103)');
    },
});

Clarinet.test({
    name: "MR-Contract Test-6: Ensure that someone who is not whitelisted cannot register a laureate. Functions tested: 'register-laureate'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user = accounts.get("wallet_1")!;
        const laureate = accounts.get("wallet_2")!;

        let block = chain.mineBlock([
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate.address), types.ascii("A")], user.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectErr().expectUint(101);
        //assertEquals(block.receipts[0].result, '(err u101)');
    },
});


Clarinet.test({
    name: "MR-Contract Test-7: Ensure that the read-only function 'get-laureates-list' returns the lists of registered laureates for the grades 'A', 'B', 'C' and 'D'. Function tested: 'get-laureates-list'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator = accounts.get("wallet_1")!.address;
        const laureate1 = accounts.get("wallet_2")!.address;
        const laureate2 = accounts.get("wallet_3")!.address;
        const laureate3 = accounts.get("wallet_4")!.address;
        const laureate4 = accounts.get("wallet_5")!.address;
        const laureate5 = accounts.get("wallet_6")!.address;
        const laureate6 = accounts.get("wallet_7")!.address;
        const laureate7 = accounts.get("wallet_8")!.address;
        const laureate8 = accounts.get("faucet")!.address;

        let block = chain.mineBlock([
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate1), types.ascii("A")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate2), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate3), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate4), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate5), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate6), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate7), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate8), types.ascii("D")], evaluator)
        ]);
        let AGradeList = chain.callReadOnlyFn("mega-rewards", "get-laureates-list", [types.ascii("A")], deployer);
        let BGradeList = chain.callReadOnlyFn("mega-rewards", "get-laureates-list", [types.ascii("B")], deployer);
        let CGradeList = chain.callReadOnlyFn("mega-rewards", "get-laureates-list", [types.ascii("C")], deployer);
        let DGradeList = chain.callReadOnlyFn("mega-rewards", "get-laureates-list", [types.ascii("D")], deployer);

        assertEquals(AGradeList.result, `(ok [${laureate1}])`);
        assertEquals(BGradeList.result, `(ok [${laureate2}, ${laureate3}])`);
        assertEquals(CGradeList.result, `(ok [${laureate4}, ${laureate5}])`);
        assertEquals(DGradeList.result, `(ok [${laureate6}, ${laureate7}, ${laureate8}])`);
    },
});

Clarinet.test({
    name: "MR-Contract Test-8: Ensure that it fails when the read-only function 'get-laureates-list' is called for a grade other than 'A', 'B', 'C' and 'D'. Function tested: 'get-laureates-list'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let XGradeList = chain.callReadOnlyFn("mega-rewards", "get-laureates-list", [types.ascii("X")], deployer.address);

        XGradeList.result.expectErr().expectUint(103);
        //assertEquals(XGradeList.result, "(err u103)");
    },
});


Clarinet.test({
    name: "MR-Contract Test-9: Ensure that the read-only function 'get-laureates-list' returns an empty list if no laureates were registered. Function tested: 'get-laureates-list'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let AGradeList = chain.callReadOnlyFn("mega-rewards", "get-laureates-list", [types.ascii("A")], deployer.address);

        assertEquals(AGradeList.result, "(ok [])");
    },
});


Clarinet.test({
    name: "MR-Contract Test-10: Ensure that the read-only functions 'get-laureates-stx-share' and 'get-laureates-ft-share' returns the correct share values for the grades 'A', 'B', 'C' and 'D'. Functions tested: 'get-laureates-stx-share', 'get-laureates-ft-share'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator = accounts.get("wallet_1")!.address;
        const laureate1 = accounts.get("wallet_2")!.address;
        const laureate2 = accounts.get("wallet_3")!.address;
        const laureate3 = accounts.get("wallet_4")!.address;
        const laureate4 = accounts.get("wallet_5")!.address;
        const laureate5 = accounts.get("wallet_6")!.address;
        const laureate6 = accounts.get("wallet_7")!.address;
        const laureate7 = accounts.get("wallet_8")!.address;
        const laureate8 = accounts.get("faucet")!.address;
        const ftContractPrincipal = deployer + ".mr-token";
        const sponsorStxFund = 2000;
        const sponsorTokenFund = 4000;

        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(sponsorTokenFund), types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "fund-contract", [types.principal(ftContractPrincipal), types.uint(sponsorStxFund), types.uint(sponsorTokenFund)], evaluator),
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate1), types.ascii("A")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate2), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate3), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate4), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate5), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate6), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate7), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate8), types.ascii("D")], evaluator)
        ]);
        let AGradeStxShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-stx-share", [types.ascii("A")], deployer);
        let BGradeStxShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-stx-share", [types.ascii("B")], deployer);
        let CGradeStxShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-stx-share", [types.ascii("C")], deployer);
        let DGradeStxShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-stx-share", [types.ascii("D")], deployer);

        let AGradeTokenShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-ft-share", [types.ascii("A")], deployer);
        let BGradeTokenShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-ft-share", [types.ascii("B")], deployer);
        let CGradeTokenShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-ft-share", [types.ascii("C")], deployer);
        let DGradeTokenShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-ft-share", [types.ascii("D")], deployer);


        const distributionKey = 8 * 1 + 4 * 2 + 2 * 2 + 1 * 3;
        const Grade_AStxShare = Math.floor(8 * sponsorStxFund / distributionKey);
        const Grade_BStxShare = Math.floor(4 * sponsorStxFund / distributionKey);
        const Grade_CStxShare = Math.floor(2 * sponsorStxFund / distributionKey);
        const Grade_DStxShare = Math.floor(1 * sponsorStxFund / distributionKey);

        const Grade_ATokenShare = Math.floor(8 * sponsorTokenFund / distributionKey);
        const Grade_BTokenShare = Math.floor(4 * sponsorTokenFund / distributionKey);
        const Grade_CTokenShare = Math.floor(2 * sponsorTokenFund / distributionKey);
        const Grade_DTokenShare = Math.floor(1 * sponsorTokenFund / distributionKey);



        assertEquals(AGradeStxShare.result, `(ok u${Grade_AStxShare})`);
        assertEquals(BGradeStxShare.result, `(ok u${Grade_BStxShare})`);
        assertEquals(CGradeStxShare.result, `(ok u${Grade_CStxShare})`);
        assertEquals(DGradeStxShare.result, `(ok u${Grade_DStxShare})`);

        assertEquals(AGradeTokenShare.result, `(ok u${Grade_ATokenShare})`);
        assertEquals(BGradeTokenShare.result, `(ok u${Grade_BTokenShare})`);
        assertEquals(CGradeTokenShare.result, `(ok u${Grade_CTokenShare})`);
        assertEquals(DGradeTokenShare.result, `(ok u${Grade_DTokenShare})`);
    },
});


Clarinet.test({
    name: "MR-Contract Test-11: Ensure that it fails when the read-only functions 'get-laureates-stx-share' and 'get-laureates-ft-share' are called for a grade other than 'A', 'B', 'C' and 'D'. Function tested: 'get-laureates-stx-share', 'get-laureates-ft-share'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        let XGradeStxShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-stx-share", [types.ascii("X")], deployer.address);
        let XGradeFtShare = chain.callReadOnlyFn("mega-rewards", "get-laureates-ft-share", [types.ascii("X")], deployer.address);

        XGradeStxShare.result.expectErr().expectUint(103);
        XGradeFtShare.result.expectErr().expectUint(103);
        //  assertEquals(XGradeShare.result, "(err u103)");
    },
});


Clarinet.test({
    name: "MR-Contract Test-12: Ensure that the read-only functions 'get-stx-balance' returns the correct value for the balance. Function tested: 'get-stx-balance'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const sponsor = accounts.get("wallet_2")!.address;
        const deployer = accounts.get("deployer")!.address;
        const ftContractPrincipal = deployer + ".mr-token";
        const sponsorStxFund = 2000;
        const sponsorTokenFund = 4000;
        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(sponsorTokenFund), types.principal(sponsor)], deployer),
            Tx.contractCall("mega-rewards", "fund-contract", [types.principal(ftContractPrincipal), types.uint(sponsorStxFund), types.uint(sponsorTokenFund)], sponsor),
            Tx.contractCall("mega-rewards", "get-stx-balance", [], deployer)
        ]);

        assertEquals(block.receipts[2].result, `u${sponsorStxFund}`);
    },
});


Clarinet.test({
    name: "MR-Contract Test-13: Ensure that the read-only function 'get-whitelisted-evaluators' returns the correct list of currently whitelisted evaluators. Function tested: 'get-whitelisted-evaluators'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator_1 = accounts.get("wallet_2")!.address;
        const evaluator_2 = accounts.get("wallet_3")!.address;
        let block = chain.mineBlock([
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator_1)], deployer),
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator_2)], deployer)
        ]);
        let getWhitelistedEvaluators = chain.callReadOnlyFn("mega-rewards", "get-whitelisted-evaluators", [], deployer);

        assertEquals(getWhitelistedEvaluators.result, `[${evaluator_1}, ${evaluator_2}]`);
    },
});



Clarinet.test({
    name: "MR-Contract Test-14: Ensure that the read-only function 'get-current-stats' returns the correct values for all the attributes. Function tested: 'get-current-stats'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator = accounts.get("wallet_1")!.address;
        const laureate1 = accounts.get("wallet_2")!.address;
        const laureate2 = accounts.get("wallet_3")!.address;
        const laureate3 = accounts.get("wallet_4")!.address;
        const laureate4 = accounts.get("wallet_5")!.address;
        const laureate5 = accounts.get("wallet_6")!.address;
        const laureate6 = accounts.get("wallet_7")!.address;
        const laureate7 = accounts.get("wallet_8")!.address;
        const laureate8 = accounts.get("faucet")!.address;
        const ftContractPrincipal = deployer + ".mr-token";
        const sponsorStxFund = 2000;
        const sponsorTokenFund = 4000;

        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(sponsorTokenFund), types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "fund-contract", [types.principal(ftContractPrincipal), types.uint(sponsorStxFund), types.uint(sponsorTokenFund)], evaluator),
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate1), types.ascii("A")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate2), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate3), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate4), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate5), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate6), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate7), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate8), types.ascii("D")], evaluator)
        ]);
        let getCurrentStats = chain.callReadOnlyFn("mega-rewards", "get-current-stats", [], deployer);

        const distributionKey = 8 * 1 + 4 * 2 + 2 * 2 + 1 * 3;
        const Grade_AStxShare = Math.floor(8 * sponsorStxFund / distributionKey);
        const Grade_BStxShare = Math.floor(4 * sponsorStxFund / distributionKey);
        const Grade_CStxShare = Math.floor(2 * sponsorStxFund / distributionKey);
        const Grade_DStxShare = Math.floor(1 * sponsorStxFund / distributionKey);

        const Grade_ATokenShare = Math.floor(8 * sponsorTokenFund / distributionKey);
        const Grade_BTokenShare = Math.floor(4 * sponsorTokenFund / distributionKey);
        const Grade_CTokenShare = Math.floor(2 * sponsorTokenFund / distributionKey);
        const Grade_DTokenShare = Math.floor(1 * sponsorTokenFund / distributionKey);


        assertEquals(getCurrentStats.result,
            `{Currently_Available_FtFunds: u${sponsorTokenFund}, ` +
            `Currently_Available_StxFunds: u${sponsorStxFund}, ` +
            `Currently_Whitelisted_Evaluators: [${evaluator}], ` +
            `Grade-A-Laureates_Attribute-1_Number_Of_As: u1, ` +
            `Grade-A-Laureates_Attribute-2_StxShare_Of_As: u${Grade_AStxShare}, ` +
            `Grade-A-Laureates_Attribute-3_FtShare_Of_As: u${Grade_ATokenShare}, ` +
            `Grade-A-Laureates_Attribute-4_List_Of_As: [${laureate1}], ` +
            `Grade-B-Laureates_Attribute-1_Number_Of_Bs: u2, ` +
            `Grade-B-Laureates_Attribute-2_StxShare_Of_Bs: u${Grade_BStxShare}, ` +
            `Grade-B-Laureates_Attribute-3_FtShare_Of_Bs: u${Grade_BTokenShare}, ` +
            `Grade-B-Laureates_Attribute-4_List_Of_Bs: [${laureate2}, ${laureate3}], ` +
            `Grade-C-Laureates_Attribute-1_Number_Of_Cs: u2, ` +
            `Grade-C-Laureates_Attribute-2_StxShare_Of_Cs: u${Grade_CStxShare}, ` +
            `Grade-C-Laureates_Attribute-3_FtShare_Of_Cs: u${Grade_CTokenShare}, ` +
            `Grade-C-Laureates_Attribute-4_List_Of_Cs: [${laureate4}, ${laureate5}], ` +
            `Grade-D-Laureates_Attribute-1_Number_Of_Ds: u3, ` +
            `Grade-D-Laureates_Attribute-2_StxShare_Of_Ds: u${Grade_DStxShare}, ` +
            `Grade-D-Laureates_Attribute-3_FtShare_Of_Ds: u${Grade_DTokenShare}, ` +
            `Grade-D-Laureates_Attribute-4_List_Of_Ds: [${laureate6}, ${laureate7}, ${laureate8}]}`
        );
    },
});



Clarinet.test({
    name: "MR-Contract Test-15: Ensure that it failes if someone other then the contract owner calls the function 'bestow-laureates'. Functions tested: 'bestow-laureates'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user = accounts.get("wallet_1")!;

        let block = chain.mineBlock([

            Tx.contractCall("mega-rewards", "bestow-laureates", [], user.address)

        ]);

        //   block.receipts[0].result.expectErr().expectUint(100);
        assertEquals(block.receipts[0].result, '(err u100)');
    },
});


Clarinet.test({
    name: "MR-Contract Test-16: Ensure that the shares were properly transfered to the wallets of the recipients. Functions tested: 'bestow-laureates', 'transfer-stx', 'transfer-mr-token', 'get-laureates-stx-share', 'get-laureates-ft-share', 'get-laureates-list', 'transfer-remainder'",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address;
        const evaluator = accounts.get("wallet_1")!.address;
        const laureate1 = accounts.get("wallet_2")!.address;
        const laureate2 = accounts.get("wallet_3")!.address;
        const laureate3 = accounts.get("wallet_4")!.address;
        const laureate4 = accounts.get("wallet_5")!.address;
        const laureate5 = accounts.get("wallet_6")!.address;
        const laureate6 = accounts.get("wallet_7")!.address;
        const laureate7 = accounts.get("wallet_8")!.address;
        const laureate8 = accounts.get("faucet")!.address;
        const ftContractPrincipal = deployer + ".mr-token";
        const sponsorStxFund = 2000;
        const sponsorTokenFund = 4000;

        const theAssetsMapsBeforeState = chain.getAssetsMaps().assets;
        const deployerBalanceBeforeTransf = theAssetsMapsBeforeState.STX[deployer];
        const evaluatorBalanceBeforeTransf = theAssetsMapsBeforeState.STX[evaluator];
        const Laureate1BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate1];
        const Laureate2BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate2];
        const Laureate3BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate3];
        const Laureate4BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate4];
        const Laureate5BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate5];
        const Laureate6BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate6];
        const Laureate7BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate7];
        const Laureate8BalanceBeforeTransf = theAssetsMapsBeforeState.STX[laureate8];

        let block = chain.mineBlock([
            Tx.contractCall("mr-token", "mint", [types.uint(sponsorTokenFund), types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "fund-contract", [types.principal(ftContractPrincipal), types.uint(sponsorStxFund), types.uint(sponsorTokenFund)], evaluator),
            Tx.contractCall("mega-rewards", "whitelist-evaluator", [types.principal(evaluator)], deployer),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate1), types.ascii("A")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate2), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate3), types.ascii("B")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate4), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate5), types.ascii("C")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate6), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate7), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "register-laureate", [types.principal(laureate8), types.ascii("D")], evaluator),
            Tx.contractCall("mega-rewards", "bestow-laureates", [], deployer)
        ]);
        const distributionKey = 8 * 1 + 4 * 2 + 2 * 2 + 1 * 3;
        const Grade_AStxShare = Math.floor(8 * sponsorStxFund / distributionKey);
        const Grade_BStxShare = Math.floor(4 * sponsorStxFund / distributionKey);
        const Grade_CStxShare = Math.floor(2 * sponsorStxFund / distributionKey);
        const Grade_DStxShare = Math.floor(1 * sponsorStxFund / distributionKey);
        const stxRemainder = sponsorStxFund - (Grade_AStxShare + 2 * Grade_BStxShare + 2 * Grade_CStxShare + 3 * Grade_DStxShare);

        const Grade_ATokenShare = Math.floor(8 * sponsorTokenFund / distributionKey);
        const Grade_BTokenShare = Math.floor(4 * sponsorTokenFund / distributionKey);
        const Grade_CTokenShare = Math.floor(2 * sponsorTokenFund / distributionKey);
        const Grade_DTokenShare = Math.floor(1 * sponsorTokenFund / distributionKey);
        const tokenRemainder = sponsorTokenFund - (Grade_ATokenShare + 2 * Grade_BTokenShare + 2 * Grade_CTokenShare + 3 * Grade_DTokenShare);

        const theAssetsMaps = chain.getAssetsMaps().assets;


        assertEquals(theAssetsMaps.STX[deployer], deployerBalanceBeforeTransf);
        assertEquals(theAssetsMaps.STX[deployer + ".mega-rewards"], 0);
        assertEquals(theAssetsMaps.STX[evaluator], evaluatorBalanceBeforeTransf - sponsorStxFund);
        assertEquals(theAssetsMaps.STX[laureate1], Laureate1BalanceBeforeTransf + Grade_AStxShare + stxRemainder);
        assertEquals(theAssetsMaps.STX[laureate2], Laureate2BalanceBeforeTransf + Grade_BStxShare);
        assertEquals(theAssetsMaps.STX[laureate3], Laureate3BalanceBeforeTransf + Grade_BStxShare);
        assertEquals(theAssetsMaps.STX[laureate4], Laureate4BalanceBeforeTransf + Grade_CStxShare);
        assertEquals(theAssetsMaps.STX[laureate5], Laureate5BalanceBeforeTransf + Grade_CStxShare);
        assertEquals(theAssetsMaps.STX[laureate6], Laureate6BalanceBeforeTransf + Grade_DStxShare);
        assertEquals(theAssetsMaps.STX[laureate7], Laureate7BalanceBeforeTransf + Grade_DStxShare);
        assertEquals(theAssetsMaps.STX[laureate8], Laureate8BalanceBeforeTransf + Grade_DStxShare);


        assertEquals(theAssetsMaps[".mr-token.mr-token"][deployer + ".mega-rewards"], 0);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][evaluator], 0);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate1], Grade_ATokenShare + tokenRemainder);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate2], Grade_BTokenShare);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate3], Grade_BTokenShare);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate4], Grade_CTokenShare);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate5], Grade_CTokenShare);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate6], Grade_DTokenShare);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate7], Grade_DTokenShare);
        assertEquals(theAssetsMaps[".mr-token.mr-token"][laureate8], Grade_DTokenShare);


        assertEquals(theAssetsMaps[".mr-grade-a-nft.mr-grade-A-nft"][laureate1], 1);
        assertEquals(theAssetsMaps[".mr-grade-b-nft.mr-grade-B-nft"][laureate2], 1);
        assertEquals(theAssetsMaps[".mr-grade-b-nft.mr-grade-B-nft"][laureate3], 1);
        assertEquals(theAssetsMaps[".mr-grade-c-nft.mr-grade-C-nft"][laureate4], 1);
        assertEquals(theAssetsMaps[".mr-grade-c-nft.mr-grade-C-nft"][laureate5], 1);
        assertEquals(theAssetsMaps[".mr-grade-d-nft.mr-grade-D-nft"][laureate6], 1);
        assertEquals(theAssetsMaps[".mr-grade-d-nft.mr-grade-D-nft"][laureate7], 1);
        assertEquals(theAssetsMaps[".mr-grade-d-nft.mr-grade-D-nft"][laureate8], 1);
    },
});

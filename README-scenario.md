;; mega-rewards

## Play through the scenario.

### 1- Start the console.
clarinet console

### 2- Provide funds to the contract. 
In this scenario the deployer is also the sponsor who will provide the funds. But in reality anyone can send funds to the contract. 
The deployer first mints 2000 Token (MRT) and then funds the contract with 2000STX and 2000Token (MRT).

Functions called: mint, fund-contract
		
(contract-call? .mr-token mint u2000 tx-sender)

(contract-call? .mega-rewards fund-contract .mr-token u2000 u2000)


If the sponsor is different then the deployer then use these commands to fund the contract. 

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mr-token mint u2000 tx-sender)

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards fund-contract .mr-token u2000 u2000)


### 3- Whitelist an evaluator. 
Evaluators could be teachers in a school, who will then be able to register students (laureates) with their grades. Only whitelisted evaluators can register laureates.

Functions called: whitelist-evaluator
		
(contract-call? .mega-rewards whitelist-evaluator 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)


### 4- Switch the tx-sender to the principal of the evaluator.

::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5


### 5- Now the evaluator can register the laureates with their grades. 
In this scenario we assume 1 grade A, 2 grade B, 2 grade C, 3 grade D laureates.

Functions called: register-laureate
		
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG "A")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC "B")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND "B")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB "C")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0 "C")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP "D")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ "D")

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards register-laureate 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6 "D")


### 6- At any time, anyone can view the current stats of the contract. 
It displays the funds currently available, the currently whitelisted evaluators and 4 attributes of the grades:
	1- the number of laureates of each grade, 2- the STX share of each grade, 3- the Token (MRT) share of each grade, 4- the list of principals in each grade.

Functions called: get-current-stats  

(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mega-rewards get-current-stats)


### 7- Switch the tx-sender back to the principal of the deployer. 

::set_tx_sender ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM


### 8- Send the funds to each laureate. 
Only the deployer can transfer the shares to the laureates.
   
    Note: the first principal in the list of principals of grade A will receive in addition to the grade A share (in this example 695STX and 695Token), the small remainder (7STX and 7Token) that will remain after the computation of the shares. 

Functions called: bestow-laureates
		
(contract-call? .mega-rewards bestow-laureates)


### 9- After the bestowal all the values in the current stats are reseted.

(contract-call? .mega-rewards get-current-stats)


### 10- the Assets Maps reveal that each laureate has received his share and also the NFT of his grade.

::get_assets_maps
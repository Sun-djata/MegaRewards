
;; mega-rewards
;; Description: <Contract to automatically reward laureates who make the effort to work hard and get good grades>
(use-trait nft-trait .sip009-nft-trait.nft-trait)
(use-trait ft-trait .sip010-ft-trait.ft-trait)

;; constants
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_ONLY_OWNER (err u100))
(define-constant ERR_WHITELISTED_EVALUATOR_ONLY (err u101))
(define-constant ERR_NO_LAUREATES_REGISTERED (err u102))
(define-constant ERR_GRADE_NOT_REWARDED (err u103))

;; variables
(define-data-var stxShare uint u0)
(define-data-var ftShare uint u0)
(define-data-var mrTokenBalance uint u0)


;; maps
(define-map whiteListedEvaluators principal bool)
(define-map laureates {grade: (string-ascii 1)} {list: (list 1000 principal), stxShare: uint, ftShare: uint})

;; lists
(define-data-var whitelistedEvaluatorList (list 1000 principal) (list))

;; initialize map
(map-set laureates {grade: "A"} {list: (list), stxShare: u0, ftShare: u0})
(map-set laureates {grade: "B"} {list: (list), stxShare: u0, ftShare: u0})
(map-set laureates {grade: "C"} {list: (list), stxShare: u0, ftShare: u0})
(map-set laureates {grade: "D"} {list: (list), stxShare: u0, ftShare: u0})


;; public function to send funds (STX and SIP010 Token) to the contract
;; #[allow(unchecked_data)]
(define-public (fund-contract (token <ft-trait>) (amount uint) (tokenAmount uint))
    (begin
        (try! (stx-transfer? amount tx-sender CONTRACT_ADDRESS))
        (try! (contract-call? token transfer tokenAmount tx-sender CONTRACT_ADDRESS none))
        (if (is-eq (err u102) (compute-shares)) true true)
        (var-set mrTokenBalance (get-ft-balance .mr-token))
        (ok "SUCCESS")
    )
)

;; public function to whitelist evaluator so they can register laureates
;; #[allow(unchecked_data)]
(define-public (whitelist-evaluator (evaluator principal))
    (begin 
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_ONLY_OWNER)
        (var-set whitelistedEvaluatorList (unwrap-panic (as-max-len? (append (var-get whitelistedEvaluatorList) evaluator) u1000)))
        (ok (map-set whiteListedEvaluators evaluator true))
    )
)


;; public function to register laureates
;; #[allow(unchecked_data)]
(define-public (register-laureate (laureate principal) (grade (string-ascii 1))) 
    (let
        (
            (newList (unwrap-panic (as-max-len? (concat (try! (get-laureates-list grade)) (list laureate)) u1000)))
        )
        (asserts! (is-eq (map-get? whiteListedEvaluators tx-sender) (some true)) ERR_WHITELISTED_EVALUATOR_ONLY)
       (update-laureates-list grade newList)
       (try! (compute-shares))
       (ok "SUCCESS")       
)
)

;; public function to distribute the rewards to the laureates
(define-public (bestow-laureates)
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_ONLY_OWNER)
        (var-set stxShare (try! (get-laureates-stx-share "A")))
        (map transfer-stx (try! (get-laureates-list "A")))
        (var-set stxShare (try! (get-laureates-stx-share "B")))
        (map transfer-stx (try! (get-laureates-list "B")))
        (var-set stxShare (try! (get-laureates-stx-share "C")))
        (map transfer-stx (try! (get-laureates-list "C")))
        (var-set stxShare (try! (get-laureates-stx-share "D")))
        (map transfer-stx (try! (get-laureates-list "D")))

        (var-set ftShare (try! (get-laureates-ft-share "A")))
        (map transfer-mr-token (try! (get-laureates-list "A")))
        (var-set ftShare (try! (get-laureates-ft-share "B")))
        (map transfer-mr-token (try! (get-laureates-list "B")))
        (var-set ftShare (try! (get-laureates-ft-share "C")))
        (map transfer-mr-token (try! (get-laureates-list "C")))
        (var-set ftShare (try! (get-laureates-ft-share "D")))
        (map transfer-mr-token (try! (get-laureates-list "D")))

        (try! (transfer-remainder))

        (map mint-mr-grade-a-nft (try! (get-laureates-list "A")))
        (map mint-mr-grade-b-nft (try! (get-laureates-list "B")))
        (map mint-mr-grade-c-nft (try! (get-laureates-list "C")))
        (map mint-mr-grade-d-nft (try! (get-laureates-list "D")))

        (var-set stxShare u0)
        (var-set ftShare u0)
        (var-set mrTokenBalance (get-ft-balance .mr-token))

        (var-set whitelistedEvaluatorList (list))

        (map-set laureates {grade: "A"} {list: (list), stxShare: u0, ftShare: u0})
        (map-set laureates {grade: "B"} {list: (list), stxShare: u0, ftShare: u0})
        (map-set laureates {grade: "C"} {list: (list), stxShare: u0, ftShare: u0})
        (map-set laureates {grade: "D"} {list: (list), stxShare: u0, ftShare: u0})
        
        (ok "success")
    )
)

;; private function to transfer the remainder to the first laureate in the list containing the highest grades
(define-private (transfer-remainder)
    (let 
        (
            (numberOfGradeALaureates (len (unwrap-panic (get-laureates-list "A"))))
            (numberOfGradeBLaureates (len (unwrap-panic (get-laureates-list "B"))))
            (numberOfGradeCLaureates (len (unwrap-panic (get-laureates-list "C"))))
            (numberOfGradeDLaureates (len (unwrap-panic (get-laureates-list "D"))))

            (firstLaureateInGradeAList (unwrap-panic (some (element-at (try! (get-laureates-list "A")) u0))))
            (firstLaureateInGradeBList (unwrap-panic (some (element-at (try! (get-laureates-list "B")) u0))))
            (firstLaureateInGradeCList (unwrap-panic (some (element-at (try! (get-laureates-list "C")) u0))))
            (firstLaureateInGradeDList (unwrap-panic (some (element-at (try! (get-laureates-list "D")) u0))))
        ) 
        (var-set stxShare (get-stx-balance))
        (var-set ftShare (get-ft-balance .mr-token))
        
        (if (is-eq numberOfGradeALaureates u0) 
            (if (is-eq numberOfGradeBLaureates u0) 
                (if (is-eq numberOfGradeCLaureates u0) 
                    (if (is-eq numberOfGradeDLaureates u0) 
                        (ok true)
                        (begin 
                            (try! (transfer-stx (unwrap-panic firstLaureateInGradeDList)))
                            (transfer-mr-token (unwrap-panic firstLaureateInGradeDList))
                        )
                    )
                    (begin 
                        (try! (transfer-stx (unwrap-panic firstLaureateInGradeCList)))
                        (transfer-mr-token (unwrap-panic firstLaureateInGradeCList))
                    )
                ) 
                (begin 
                    (try! (transfer-stx (unwrap-panic firstLaureateInGradeBList)))
                    (transfer-mr-token (unwrap-panic firstLaureateInGradeBList))
                )
            )
            (begin 
                (try! (transfer-stx (unwrap-panic firstLaureateInGradeAList)))
                (transfer-mr-token (unwrap-panic firstLaureateInGradeAList))
            )
        )
    )
)


;; private function to update the lists containing the laureates. Laureates of the same grades are in the same list
(define-private (update-laureates-list (grade (string-ascii 1)) (newList (list 1000 principal)))
    (let 
        (
            (laureatesValues (unwrap-panic (map-get? laureates {grade: grade})))
        )
        (map-set laureates {grade: grade} (merge laureatesValues {list: newList}))        
    )
)

;; private function to update the shares for each
(define-private (update-laureates-share (grade (string-ascii 1)) (newStxShare uint) (newFtShare uint))
    (let 
        (
            (laureatesValues (unwrap-panic (map-get? laureates {grade: grade})))
        )
        (map-set laureates {grade: grade} (merge laureatesValues {stxShare: newStxShare, ftShare: newFtShare}))        
    )
)

;; private function to compute the shares for each grade
(define-private (compute-shares)
    (let 
        (
            (stxBalance (as-contract (stx-get-balance tx-sender)))
            (ftBalance (get-ft-balance .mr-token))
            (aLaureatesNumber (len (try! (get-laureates-list "A"))))
            (bLaureatesNumber (len (try! (get-laureates-list "B"))))
            (cLaureatesNumber (len (try! (get-laureates-list "C"))))
            (dLaureatesNumber (len (try! (get-laureates-list "D"))))
            
            (distrubutionKey    (+  (+  (+ 
                                            (* u8 aLaureatesNumber) 
                                            (* u4 bLaureatesNumber)
                                        ) 
                                        
                                        (* u2 cLaureatesNumber)
                                    ) 
                                    
                                    dLaureatesNumber
                                )
            )
            

        )
        (asserts! (not (is-eq distrubutionKey u0)) ERR_NO_LAUREATES_REGISTERED)

        
            
        (if (is-eq aLaureatesNumber u0) 
            true 
            (update-laureates-share "A" (/ (* u8 stxBalance) distrubutionKey) (/ (* u8 ftBalance) distrubutionKey))           
        )
        (if (is-eq bLaureatesNumber u0) 
            true 
            (update-laureates-share "B" (/ (* u4 stxBalance) distrubutionKey) (/ (* u4 ftBalance) distrubutionKey))            
        )
        (if (is-eq cLaureatesNumber u0) 
            true 
            (update-laureates-share "C" (/ (* u2 stxBalance) distrubutionKey) (/ (* u2 ftBalance) distrubutionKey))           
        )
        (if (is-eq dLaureatesNumber u0) 
            true 
            (update-laureates-share "D" (/ stxBalance distrubutionKey) (/ ftBalance distrubutionKey))           
        )       
        (ok true)
    )
)


;; private function to transfer STX to the laureates
(define-private (transfer-stx (laureate principal))      
    (as-contract (stx-transfer? (var-get stxShare) tx-sender laureate))
)

;; private function to transfer FT token to the laureates
(define-private (transfer-mr-token (laureate principal))
    (as-contract (contract-call? .mr-token transfer (var-get ftShare) tx-sender laureate none))        
)

;; private function to mint grade A NFT for the grade A laureates
(define-private (mint-mr-grade-a-nft (laureate principal))
    (contract-call? .mr-grade-a-nft mint laureate)
)

;; private function to mint grade B NFT for the grade B laureates
(define-private (mint-mr-grade-b-nft (laureate principal))
    (contract-call? .mr-grade-b-nft mint laureate)
)

;; private function to mint grade C NFT for the grade C laureates
(define-private (mint-mr-grade-c-nft (laureate principal))
    (contract-call? .mr-grade-c-nft mint laureate)
)

;; private function to mint grade D NFT for the grade D laureates
(define-private (mint-mr-grade-d-nft (laureate principal))
    (contract-call? .mr-grade-d-nft mint laureate)
)


;; read-only function to get the laureates lists
(define-read-only (get-laureates-list (grade (string-ascii 1)))
    (ok (get list (unwrap! (map-get? laureates {grade: grade}) ERR_GRADE_NOT_REWARDED)))
)

;; read-only function to get the laureates STX shares
(define-read-only (get-laureates-stx-share (grade (string-ascii 1)))
    (ok (get stxShare (unwrap! (map-get? laureates {grade: grade}) ERR_GRADE_NOT_REWARDED)))
)

;; read-only function to get the laureates FT shares
(define-read-only (get-laureates-ft-share (grade (string-ascii 1)))
    (ok (get ftShare (unwrap! (map-get? laureates {grade: grade}) ERR_GRADE_NOT_REWARDED)))
)

;; read-only function to get the whitelisted evaluators
(define-read-only (get-whitelisted-evaluators)
    (var-get whitelistedEvaluatorList)
)

;;read-only function to get the current statistics 
(define-read-only (get-current-stats)
    {   
        Currently_Available_StxFunds: (get-stx-balance),
        Currently_Available_FtFunds: (var-get mrTokenBalance),

        Currently_Whitelisted_Evaluators: (get-whitelisted-evaluators),
        
        Grade-A-Laureates_Attribute-1_Number_Of_As: (len (unwrap-panic (get-laureates-list "A"))),
        Grade-A-Laureates_Attribute-2_StxShare_Of_As: (unwrap-panic (get-laureates-stx-share "A")),
        Grade-A-Laureates_Attribute-3_FtShare_Of_As: (unwrap-panic (get-laureates-ft-share "A")),
        Grade-A-Laureates_Attribute-4_List_Of_As: (unwrap-panic (get-laureates-list "A")),

        Grade-B-Laureates_Attribute-1_Number_Of_Bs: (len (unwrap-panic (get-laureates-list "B"))),
        Grade-B-Laureates_Attribute-2_StxShare_Of_Bs: (unwrap-panic (get-laureates-stx-share "B")),
        Grade-B-Laureates_Attribute-3_FtShare_Of_Bs: (unwrap-panic (get-laureates-ft-share "B")),
        Grade-B-Laureates_Attribute-4_List_Of_Bs: (unwrap-panic (get-laureates-list "B")),

        Grade-C-Laureates_Attribute-1_Number_Of_Cs: (len (unwrap-panic (get-laureates-list "C"))),
        Grade-C-Laureates_Attribute-2_StxShare_Of_Cs: (unwrap-panic (get-laureates-stx-share "C")),
        Grade-C-Laureates_Attribute-3_FtShare_Of_Cs: (unwrap-panic (get-laureates-ft-share "C")),
        Grade-C-Laureates_Attribute-4_List_Of_Cs: (unwrap-panic (get-laureates-list "C")),

        Grade-D-Laureates_Attribute-1_Number_Of_Ds: (len (unwrap-panic (get-laureates-list "D"))),
        Grade-D-Laureates_Attribute-2_StxShare_Of_Ds: (unwrap-panic (get-laureates-stx-share "D")),
        Grade-D-Laureates_Attribute-3_FtShare_Of_Ds: (unwrap-panic (get-laureates-ft-share "D")),
        Grade-D-Laureates_Attribute-4_List_Of_Ds: (unwrap-panic (get-laureates-list "D"))
    }
)


;; read-only function to get the stacks funds the contract currently holds
(define-read-only (get-stx-balance)
    (as-contract (stx-get-balance tx-sender))
)

;; read-only function to get the tocken funds the contract currently holds
(define-private (get-ft-balance (token <ft-trait>))
  (unwrap-panic (contract-call? token get-balance CONTRACT_ADDRESS))
)

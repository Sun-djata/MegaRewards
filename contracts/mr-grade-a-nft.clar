
;; mr-grade-a-nft
(impl-trait .sip009-nft-trait.nft-trait)



(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-non-fungible-token mr-grade-A-nft uint)

(define-data-var last-token-id uint u0)

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
    (ok none)
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? mr-grade-A-nft token-id))
)

;; #[allow(unchecked_data)]
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        (nft-transfer? mr-grade-A-nft token-id sender recipient)
    )
)

;; #[allow(unchecked_data)]
(define-public (mint (recipient principal))
        (let 
            (
                (token-id (+ (var-get last-token-id) u1))
            ) 
            (asserts! (is-eq tx-sender contract-owner) err-owner-only)
            (try! (nft-mint? mr-grade-A-nft token-id recipient))
            (var-set last-token-id token-id)
            (ok token-id)  
        )
)

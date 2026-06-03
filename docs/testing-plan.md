# Testing Plan

## Smart Contract

Implemented in `Blockchain/test/ProductAuthenticity.test.ts`.

Positive cases:

- Register Product
- Verify Product
- Update Product
- Transfer Ownership
- Remove Product from active results

Negative cases:

- Unauthorized Update
- Invalid Product Verification
- Remove Non-Existing Product

Run:

```bash
cd Blockchain
npm test
```

## Backend

Recommended follow-up tests:

- Create metadata
- Reject duplicate `productCode`
- Read metadata by `productCode`
- Update metadata
- Delete metadata

## Frontend

Recommended follow-up tests:

- Wallet connection state
- Register form submission
- Verification result states
- Product list rendering
- Admin transaction error display

# SolaceProof-Solana: ZK-Verified Stability for AI Models

SolaceProof is a full-stack Solana dApp leveraging Zero-Knowledge Groth16 proofs to verify the **Axiomatic Stability Regularizer (ASR) Loss** of a neural network model. The core value is providing verifiable proof of model stability on-chain without revealing model weights.

### 🔑 Key Architectural Features

* **Anti-Crash Design:** Uses an **Asynchronous Job Queue** (Node.js `spawn`) for ZK proving, preventing server blockages, OOM errors, and timeouts.
* **Optimal UX:** The Frontend uses **polling** to provide real-time status updates (PENDING, PROVING, SUCCESS) during the 10-40 second ZK process.
* **On-Chain Verification:** Groth16 verification is handled by an Anchor program, emitting a `StabilityVerified` event upon success.

---

### 🚀 Quick Start (3 Terminals Required)

#### Prerequisites:

* **Tools:** Node.js, Rust/Anchor, Solana CLI, `circom`, and `snarkjs` (global npm install).

#### Terminal 1: Setup ZK Assets & Deploy Anchor

1.  **Run Setup Script:** This builds the ZK circuit, generates `.wasm` and `.zkey`, and copies the Anchor IDL.
    ```bash
    sh scripts/run_setup.sh
    ```
2.  **Deploy Verifier:**
    ```bash
    cd anchor
    anchor deploy --provider.cluster devnet
    ```
    > **ACTION:** Update the Program ID (`SOLACEPROOF_VERIFIER_PROGRAM_ID_GANTI_INI`) in `anchor/programs/solace_verifier/src/lib.rs` and `ui/hooks/useProvingJob.js` after deployment!

#### Terminal 2: Start API Server (Job Queue)

1.  ```bash
    cd server
    npm install
    node index.js
    ```
    > *Output:* API Server running on http://localhost:3001

#### Terminal 3: Start Frontend DApp

1.  ```bash
    cd ui
    npm install
    npm run dev
    ```
    > *Output:* Open **http://localhost:3000**

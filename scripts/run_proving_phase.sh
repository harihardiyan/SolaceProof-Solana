#!/usr/bin/env bash
set -euo pipefail

ROOT="$(dirname "$0")/.." 

echo "-> [ZK] Running Proving Phase (REAL MODE)..."

# 1. Generate Input payload using ASR logic
python3 $ROOT/prover/export_payload.py

# 2. Change directory and clean artifacts
cd $ROOT/circuits
rm -f witness.wtns proof_artifacts/*.json

# 3. Generate Witness
node build/asrzk_fixed_js/generate_witness.js build/asrzk_fixed_js/asrzk_fixed.wasm input.json witness.wtns

# 4. Generate Proof
npx snarkjs groth16 prove asrzk_final.zkey witness.wtns proof_artifacts/proof.json proof_artifacts/public.json

echo "-> [ZK] Proof artifacts generated successfully."

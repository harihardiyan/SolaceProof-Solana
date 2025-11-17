#!/usr/bin/env bash
set -euo pipefail

echo "--- 1. BUILDING ANCHOR & IDL ---"
cd anchor
anchor build
cd ..
mkdir -p ui/idl 
cp anchor/target/idl/solace_verifier.json ui/idl/ 
echo "IDL copied to frontend."

echo "--- 2. SETUP CIRCOM/SNARKJS ASSETS ---"
cd circuits
# Compilation using the ASR circuit
npx circom asrzk_fixed.circom --r1cs --wasm --sym
echo "Circuit compiled to R1CS and WASM."

# Setup Phase 2 (Assuming powerOf2_14.ptau exists)
# NOTE: Replace powerOf2_14.ptau if you use a different constraint count
npx snarkjs groth16 setup asrzk_fixed.r1cs powerOf2_14.ptau asrzk_0.zkey
npx snarkjs zkey contribute asrzk_0.zkey asrzk_final.zkey --name="Solace Proof Contributor" -v
echo "Final Zkey generated."

mkdir -p proof_artifacts
cd ..
echo "ZK Setup Complete. Proceed to 'npm install' in server/ & ui/"

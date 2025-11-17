# prover/export_payload.py
import json
import os
from pathlib import Path
import random 

# --- ASR LOSS SIMULATION / CALCULATION ---

def calculate_asr_inputs():
    """Simulates the calculation of L_reg and Model Hash based on ASR formulation."""
    
    # 1. Simulate S_reg (Total Stability Potential)
    # This value is typically large, derived from summing phi(h^2)
    S_reg_value = random.uniform(500000, 1500000) 
    
    # 2. Simulate Lambda_t (Adaptive Scaling Factor)
    # L_total = L_task + L_reg. We prove L_reg is low.
    Lambda_0 = 10000 
    alpha = 0.5
    grad_norm_sq = random.uniform(0.01, 0.1) # Simulate low gradient norm (near convergence)
    
    # lambda_t = Lambda_0 * exp(-alpha * ||grad L_task||^2)
    # Use simple approximation for exp in Python
    lambda_t_value = Lambda_0 * (2.71828 ** (-alpha * grad_norm_sq))
    
    # 3. Calculate L_reg_claim = lambda_t * S_reg
    L_reg_claim = lambda_t_value * S_reg_value
    
    # 4. Hash (Simulate Poseidon Hash of Model Weights W)
    model_weights_hash = random.randint(10**10, 10**12)

    # 5. Transcript Hash (Anti-Replay)
    transcript_hash = random.randint(10**15, 10**18)
    
    # Mock Private Inputs for S_reg_private Constraint Check in Circom
    activation_h2_1 = random.randint(100, 500)
    activation_h2_2 = random.randint(100, 500)
    # Adjust S_reg_value to satisfy the mock constraint: S_reg_private === (activation_h2[0] + activation_h2[1]) * 5
    mock_s_reg = (activation_h2_1 + activation_h2_2) * 5
    
    # Format for Circom (Public/Private inputs must be strings)
    return {
        "modelHash": str(model_weights_hash),
        # Use mock_s_reg for the L_reg_claim calculation to ensure the constraint holds
        "l_reg_claim": str(int(lambda_t_value * mock_s_reg) % (2**64)), # u64 format for Solana
        "transcriptHash": str(transcript_hash), 
        "S_reg_private": str(mock_s_reg), # Use mock value
        "lambda_private": str(int(lambda_t_value)),
        "activation_h2_1": str(activation_h2_1), 
        "activation_h2_2": str(activation_h2_2),
    }

# --- GENERATE OUTPUT ---

def generate_zk_inputs():
    input_data = calculate_asr_inputs()
    
    output_path = Path(os.path.join(os.path.dirname(__file__), '../circuits/input.json'))
    with open(output_path, 'w') as f:
        json.dump(input_data, f, indent=2)

    print(f"[Python] ZK Inputs created successfully.")

if __name__ == '__main__':
    generate_zk_inputs()
  

// circuits/asrzk_fixed.circom
pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/multisignal.circom"; 
// Note: Log/Quartic constraints are simplified for Hackathon stability.
// We focus on proving the core multiplication relationship L_reg = lambda * S_reg.

template ASRVerifier(n_activations) {
    // PUBLIC INPUTS (Output signals)
    signal input modelHash;     
    signal output l_reg_claim;  // The final value sent to Solana
    signal input transcriptHash; 
    
    // PRIVATE INPUTS
    signal input S_reg_private;  // S_reg
    signal input lambda_private; // lambda_t
    signal input activation_h2[n_activations]; // Sample activations

    // --- 1. PROVE L_reg = lambda * S_reg ---
    // The main claim: l_reg_claim must equal the product of the private components.
    component multiplier = MultiSignal(64); 
    
    multiplier.in[0] <== lambda_private;
    multiplier.in[1] <== S_reg_private;

    // The output of the multiplication must constrain the public claim
    l_reg_claim <== multiplier.out; // Constraint 1: l_reg_claim is valid

    // --- 2. PROVE VALIDITY OF S_REG (Sum of phi(h^2)) ---
    // Simplification for stability: S_reg is constrained by sample activations.
    // In a real scenario, this block would contain the complex log/quartic constraints.
    
    signal total_activation;
    total_activation <== activation_h2[0] + activation_h2[1]; 
    
    // Constraint 2: S_reg_private must be proportional to total_activation (MOCK constant = 5)
    signal s_reg_check;
    s_reg_check <== total_activation * 5; 
    
    S_reg_private === s_reg_check; // Constrain S_reg_private to its components.
}

component main = ASRVerifier(2);

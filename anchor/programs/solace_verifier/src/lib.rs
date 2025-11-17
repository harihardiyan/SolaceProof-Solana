use anchor_lang::prelude::*;
use light_protocol::groth16_verifier; 

declare_id!("SOLACEPROOF_VERIFIER_PROGRAM_ID_GANTI_INI"); 

#[program]
pub mod solace_verifier {
    use super::*;

    pub fn submit_stability_proof(
        ctx: Context<SubmitProof>,
        proof_bytes: Vec<u8>,
        public_inputs: Vec<u64>,
    ) -> Result<()> {
        // Validation logic based on public inputs array: [Hash, Claim, Transcript, ...]
        // The first 3 public inputs are: modelHash, l_reg_claim, transcriptHash
        
        let verified = groth16_verifier::verify(&proof_bytes, &public_inputs)
            .map_err(|_| ErrorCode::InvalidProof)?;
        require!(verified, ErrorCode::InvalidProof);

        // public_inputs[0] is modelHash (u64)
        // public_inputs[1] is l_reg_claim (u64)
        emit!(StabilityVerified { model_hash: public_inputs[0], prover: ctx.accounts.prover.key(), l_reg: public_inputs[1] });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub prover: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct StabilityVerified {
    pub model_hash: u64,
    pub prover: Pubkey,
    pub l_reg: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof")]
    InvalidProof,
    #[msg("Missing public input")]
    MissingPublicInput,
}

// ui/hooks/useProvingJob.js
import { useState, useCallback } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { formatGroth16Proof, convertPublicInputs } from '../utils/proofFormatter';
import IDL from '../idl/solace_verifier.json'; 

// **ACTION: UPDATE THIS PROGRAM ID AFTER DEPLOYING ANCHOR**
const PROGRAM_ID = new anchor.web3.PublicKey('SOLACEPROOF_VERIFIER_PROGRAM_ID_GANTI_INI'); 

export const useProvingJob = () => {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [job, setJob] = useState(null);
    const [txSignature, setTxSignature] = useState(null);
    const [error, setError] = useState(null);

    // Function to handle the actual submission to Solana
    const submitProofToSolana = async (proof, publicInputs) => {
        if (!wallet || !connection) {
            setError('Wallet not connected or connection is down.');
            return;
        }

        try {
            const provider = new anchor.AnchorProvider(connection, wallet, {});
            const program = new anchor.Program(IDL, PROGRAM_ID, provider);

            // Format proof and public inputs for Anchor program
            const proofBytes = formatGroth16Proof(proof);
            const publicInputsU64 = convertPublicInputs(publicInputs);
            
            const tx = await program.methods
                .submitStabilityProof(Buffer.from(proofBytes), publicInputsU64)
                .accounts({
                    prover: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            setTxSignature(tx);
            setJob(prev => ({ ...prev, status: 'VERIFIED_ON_CHAIN' }));
            return tx;
        } catch (err) {
            console.error("Solana submission failed:", err);
            setError(err.message || "Failed to submit proof to Solana.");
            setJob(prev => ({ ...prev, status: 'FAILED' }));
        }
    };

    // Polling function to check job status
    const pollJobStatus = useCallback(async (jobId) => {
        const interval = setInterval(async () => {
            try {
                const statusResponse = await fetch(`http://localhost:3001/api/job-status/${jobId}`);
                const { job: latestJob } = await statusResponse.json();
                
                setJob(latestJob);

                if (latestJob.status === 'SUCCESS') {
                    clearInterval(interval);
                    // Attempt to submit to Solana on successful proving
                    await submitProofToSolana(latestJob.proof, latestJob.publicInputs);

                } else if (latestJob.status === 'FAILED') {
                    clearInterval(interval);
                    setError(latestJob.error || "Proving failed on the server.");
                }
            } catch (err) {
                console.error("Polling error:", err);
                clearInterval(interval);
                setError("Could not connect to job server for status updates.");
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [wallet, connection]); // Dependencies for useCallback

    // Function to start the proving process
    const startProving = useCallback(async () => {
        if (!wallet) {
            setError('Please connect your wallet first.');
            return;
        }

        // Reset state
        setJob({ status: 'PENDING' });
        setTxSignature(null);
        setError(null);

        try {
            // 1. Trigger API to start ZK job
            const response = await fetch('http://localhost:3001/api/generate-proof', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Pass wallet address to server for potential future use/logging
                body: JSON.stringify({ walletAddress: wallet.publicKey.toString() }) 
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const { jobId } = await response.json();
            setJob({ id: jobId, status: 'PROVING' });
            
            // 2. Start Polling Loop
            pollJobStatus(jobId);

        } catch (err) {
            console.error("Failed to start proving job:", err);
            setError(err.message || "Failed to connect to the proving server.");
            setJob({ status: 'FAILED' });
        }
    }, [wallet, pollJobStatus]);

    // ... (Return values) ...
    return { job, txSignature, error, startProving, isLoading: job && job.status !== 'SUCCESS' && job.status !== 'FAILED' && job.status !== 'VERIFIED_ON_CHAIN' };
};
      

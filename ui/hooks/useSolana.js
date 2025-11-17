// ui/hooks/useSolana.js
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export const useSolana = () => {
    // Gunakan Devnet untuk pengujian
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    
    // Wallets yang didukung
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [network]
    );

    const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint]);

    return { endpoint, wallets, connection };
};

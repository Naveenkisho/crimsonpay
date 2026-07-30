import { useEffect, useState } from 'react';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';

export default function ReownConnectButton({ disabled, onConnected }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' });
  const { walletProvider } = useAppKitProvider('eip155');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (!requested || !isConnected || !address || !walletProvider) return;
    const walletName = walletProvider.session?.peer?.metadata?.name || 'Connected Wallet';
    setRequested(false);
    onConnected({ provider: walletProvider, address, accounts: [address], tronAddress: '', bitcoinAddress: '', appKit: true }, walletName);
  }, [requested, isConnected, address, walletProvider, onConnected]);

  return <button className="confirm-button" type="button" disabled={disabled} onClick={() => { setRequested(true); open({ view: 'Connect' }); }}>
    Connect with Reown
  </button>;
}

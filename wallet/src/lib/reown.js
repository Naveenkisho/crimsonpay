import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, bsc, polygon, arbitrum, base } from '@reown/appkit/networks';

let initialized = false;

export function initializeReown(config) {
  if (initialized) return;
  createAppKit({
    adapters: [new EthersAdapter()],
    networks: [mainnet, bsc, polygon, arbitrum, base],
    defaultNetwork: mainnet,
    projectId: config.projectId,
    metadata: {
      name: config.appName,
      description: 'Secure CrimsonPay card payment.',
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`]
    },
    features: { analytics: true, email: false, socials: [], connectMethodsOrder: ['wallet'] },
    themeMode: 'dark'
  });
  initialized = true;
}

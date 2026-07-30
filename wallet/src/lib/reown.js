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
    featuredWalletIds: ['4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'],
    metadata: {
      name: config.appName,
      description: 'Secure CrimsonPay card payment.',
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`]
    },
    features: { analytics: true, email: false, socials: [], connectMethodsOrder: ['wallet'] },
    themeVariables: { '--w3m-z-index': 9999 },
    themeMode: 'dark'
  });
  initialized = true;
}

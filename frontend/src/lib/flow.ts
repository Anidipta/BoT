import * as fcl from '@onflow/fcl';

// Configure FCL for Flow testnet
fcl.config()
  .put('flow.network', 'testnet')
  .put('accessNode.api', 'https://rest-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('app.detail.title', 'Book of Truth')
  // optional: set an icon if you have one
  .put('app.detail.icon', 'https://raw.githubusercontent.com/onflow/flow/master/logo.png');

export default fcl;

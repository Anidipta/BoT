import * as fcl from '@onflow/fcl';

fcl.config()
  .put('flow.network', 'testnet')
  .put('accessNode.api', 'https://rest-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('app.detail.title', 'Book of Truth')
  .put('app.detail.icon', 'https://raw.githubusercontent.com/Anidipta/BoT/main/logo.png');

export default fcl;

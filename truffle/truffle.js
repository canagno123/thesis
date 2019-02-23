/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {

rpc: {

host:"localhost",

port:8545

},

networks: {

development: {

host: "localhost", //our network is running on localhost

port: 8545, // port where your blockchain is running

network_id: "*",

from: "0x96ee79ae456dac1e67515cb0f5bd222fdf36b497", // use the account-id generated during the setup process

gas: 8000000

}

}

};

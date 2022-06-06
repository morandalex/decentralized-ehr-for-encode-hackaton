
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';



import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import 'hardhat-deploy';
import { HardhatUserConfig, task } from 'hardhat/config';
import { HttpNetworkUserConfig } from 'hardhat/types';
import { TEthers } from './helpers/types/hardhat-type-extensions';


import 'tsconfig-paths/register';
dotenv.config();

declare module 'hardhat/types/runtime' {
  // This is an example of an extension to the Hardhat Runtime Environment.
  // This new field will be available in tasks' actions, scripts, and tests.
  export interface HardhatRuntimeEnvironment {
    ethers: TEthers;
  }
}


const getMnemonic = () => {
  try {
    return fs.readFileSync('./mnemonic.secret').toString().trim();
  } catch (e) {
    // @ts-ignore
    if (defaultNetwork !== 'localhost') {
      console.log('☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.');
    }
  }
  return '';
};
const { INFURA_KEY  } = process.env;

if (!INFURA_KEY) {
  throw new Error('No value found for INFURA_KEY in .env');
}
const defaultNetwork = 'localhost';
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  defaultNetwork,

  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  networks: {
    localhost: {
      url: 'http://localhost:8545',
       accounts: ['ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: [],
      
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: getMnemonic(),
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: getMnemonic(),
      },
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_KEY}`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: getMnemonic(),
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`, // <---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: getMnemonic(),
      },
    },
    xdai: {
      url: 'https://rpc.xdaichain.com/',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: getMnemonic(),
      },
    },
    matic: {
      url: 'https://rpc-mainnet.maticvigil.com/',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: getMnemonic(),
      },
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
      gasPrice: 50000000000,
      accounts: []
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
      gasPrice: 1200000000000,
      accounts:   []
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    cache: './generated/cache',
    artifacts: './generated/artifacts',
    //@ts-ignore
    deployments: './generated/deployments',
  },
  typechain: {
    outDir: './generated/contract-types',
  },
  /*etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: 'PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8',
  },*/
};


const DEBUG = false;

function debug(text: string) {
  if (DEBUG) {
    console.log(text);
  }
}

export default config;
// @ts-nocheck
import { ApolloProvider } from '@apollo/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import {

  Config,
  DAppProvider,
  // MULTICALL_ADDRESSES,
  Mainnet, Goerli, Kovan, Rinkeby, Ropsten, xDai, Localhost, Hardhat, Mumbai, Polygon
} from '@usedapp/core'
import type { AppProps } from 'next/app'
import React from 'react'
//import { MulticallContract } from '../artifacts/contracts/contractAddress'
import { useApollo } from '../lib/apolloClient'

// scaffold-eth's INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'

const config: Config = {
 /* readOnlyUrls: {
    31337: 'http://localhost:8545',
  },*/
  /* multicallAddresses: {
     31337: '0x0000000000000000000000000000000000000000',
   //  ...MULTICALL_ADDRESSES,
 },*/
  networks: [
    Mainnet,
    Goerli,
    Kovan,
    Rinkeby,
    Ropsten,
    xDai,
    Localhost,
    Hardhat,
    Mumbai,
    Polygon
  ]
}
const zIndices = {
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
}
const theme = extendTheme({ zIndices })

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  const apolloClient = useApollo(pageProps)
  return (

    <ApolloProvider client={apolloClient}>
      <DAppProvider config={config} >
        <ChakraProvider theme={theme}>

            <Component {...pageProps} />

        </ChakraProvider>
      </DAppProvider>
    </ApolloProvider>

  )
}

export default MyApp

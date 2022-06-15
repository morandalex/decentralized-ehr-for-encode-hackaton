import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import {UAuthConnector} from '@uauth/web3-react'
import {InjectedConnector} from '@web3-react/injected-connector'

import type {AbstractConnector} from '@web3-react/abstract-connector'

// Instanciate your other connectors.
export const injected = new InjectedConnector({supportedChainIds: [1]})
//const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
  4: 'https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213',
  137: 'https://polygon.infura.io/v3/84842078b09946638c03157f83405213',
  80001: 'https://mumbai.infura.io/v3/84842078b09946638c03157f83405213',
}

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  qrcode: true,
 // pollingInterval: POLLING_INTERVAL,
})

export const uauth = new UAuthConnector({
  
    clientID: "652302ea-ac5c-4b37-b400-a9b6783879fe",
    redirectUri: "http://localhost:3000/callback",
    scope: "openid wallet email:optional humanity_check:optional",
  
  /*clientID: process.env.NEXT_PUBLIC_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
  postLogoutRedirectUri: process.env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI!,
  // Scope must include openid and wallet
  scope: 'openid wallet',

  // Injected and walletconnect connectors are required.*/
  connectors: {injected, walletconnect},
})

const connectors: Record<string, AbstractConnector> = {
  injected,
  walletconnect,
  uauth,
}




export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'Coinbase',
  supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001],
})


export default connectors
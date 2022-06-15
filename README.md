# Decentralized Electronic Health Record

## Introduction

In the current scenario of centralized hospitals/clinics, the doctors and all the other staff have access to every patient document, which can result in misuse and no control or privacy for a patient. Moreover, sending patient documents over email is not safer either. This is where the decentralized electronic health record comes in picture which helps solve the above issues of privacy, data protection and tamper proof using blockchain.

The decentralized electronic health record (aka, dehr) is a blockchain based health record system. The doctor can enter the patient wallet address, create a patient record comprising of document/documents, which is encoded using the lit protocol and stored on IPFS. For a patient, as the document privacy is of utmost importance, he can decide to grant the doctor/doctors access to his documents for a certain period of time, by entering the doctors wallet address, date and the time lines for access.

The dehr uses

- Covalent API for performing some doctor and patient analytics, such as, the doctor can see all the patients and their documents he has access to and the deadlines of the access.

- Unstoppable domains API to login, along with support for the Metamask wallet connect.

## Setup

- download the zip or git clone from github as

  ```
   $ git clone https://github.com/morandalex/decentralized-ehr-for-encode-hackaton.git
  ```

- install the node modules with yarn

  ```
  $ yarn
  ```

- Need to edit two .env files

1. In packages/hardhat/.env, the below needs to be edited

```
INFURA_KEY=""

# private key (metamask account private key) that is network specific e.g.for Polygon

POLYGON_DEPLOYER_PRIVATE_KEY=""

```

2. In packages/frontend/.env, the below needs to be edited

```
# For Unstoppable domains
NEXT_PUBLIC_CLIENT_ID=""
NEXT_PUBLIC_CLIENT_SECRET=""
NEXT_PUBLIC_FALLBACK_ISSUER=""
NEXT_PUBLIC_REDIRECT_URI=""
NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI=""

NEXT_PUBLIC_INFURA_ID=""

# Encoding-Decoding using lit protocol
NEXT_PUBLIC_NFTSTORAGE_TOKEN=""

# For using covalent API
NEXT_PUBLIC_COVALENT_KEY=""

```

## Starting the App

To start the app run the commands on the terminal in the following order

a. For Polygon

```

$ yarn compile # to compile the contracts

$ yarn deploy --network matic # for Polygon matic

$ yarn dev    # to start the frontend

```

b. For localhost

```
$ yarn compile # to compile the contracts

$ yarn chain   # start the local hardhat blockchain

$ yarn deploy --network localhost

$ yarn dev    # to start the frontend

```

**PS**: As the contract is already deployed on Polygon Matic at address 0xfcaA1Fa876E18cfFe4d396aE0DA88Be637D72F77, you can as well directly start interacting with the contract by running the frontend with $ yarn dev on the terminal.

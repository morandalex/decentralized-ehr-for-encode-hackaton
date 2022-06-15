# encode hackaton 2022


We want to build a standard protocol for health data and its use in medical research.
- Some basic requirements for this project:
- Allow doctors to load patient document prescriptions 
- Give the power to a patient to decide who has the access
- Have document encrypted
- Divide the documents per typology
- Having the history of what   users or  doctors are doing


To do this, it is necessary to give patients the freedom to decide who is authorized to view their records. 
For this reason, I envisioned a simplified model whereby a user authorizes an entity called a doctor to see or not see information limited to an interval of time, in this case, a range of blocks.
A doctor could be a healthcare facility or a research center.
And the patient can simply be a citizen, or a caregiver and decides, for example, who is the family doctor granting him the loaded documents access, defining which documents can be seen by which doctors/health facilities.
The doctor has access to documents only if has been decided before by the patient.
The documents have to be encrypted, in this case on the ipfs decentralized storage.


This decentralized application is built with frontend frameworks Next and Chakraui.
I used the following  web3 Technologies:
- useDapp for management provider
- Etherjs as a utility to encode and decode logs
- hardhat to manage the Mumbai, Polygon, and hardhat chain deployments
- Lit protocol to encrypt and decrypt documents
- Covalent to fetch data logs and the latest block number
- Nft.storage as decentralized storage of encrypted documents
- Unstoppable domain as an added login option 

import {
  Heading,
  HStack,
  Box,
  Text,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Button,
} from "@chakra-ui/react";
//import { ElectronicHealthLink } from "@scaffold-eth/hardhat-ts/generated/contract-types/ElectronicHealthLink";
//import ABIS from "@scaffold-eth/hardhat-ts/hardhat_contracts.json";
//@ts-ignore
import ABIS from "../../hardhat_contracts.json";
//@ts-ignore
import { ElectronicHealthLink } from "../../contract-types/ElectronicHealthLink";

import LitJsSdk from 'lit-js-sdk'
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";

import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { Web3Context } from "../../contexts/Web3Provider";
import TablePaginated from './TablePaginated'
import NETWORKS from "../../core/networks";
import { useWeb3React } from '@web3-react/core';
import { hexToString } from "../../core/helpers";

import { MdOutlineHeadphones } from "react-icons/md";
import { useRouter } from 'next/router';
type Block = {
  inputs?: Array<Object>;
  outputs?: Array<Object>;
  name?: string;
  stateMutability?: string;
  type: string;
};

(async () => {

  const client = new LitJsSdk.LitNodeClient()
  await client.connect()
  //@ts-ignore
  window.litNodeClient = client

})()



function ContractFields({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const { account } = useContext(Web3Context);
  const { library } = useWeb3React();
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);
  const [data, setdata] = useState([])

  const [yourReadContract, setYourReadContract] = useState<ElectronicHealthLink>();
  const [yourWriteContract, setYourWriteContract] = useState<ElectronicHealthLink>();
  const [yourBalance, setYourBalance] = useState("");
  const [selectedType, setSelectedType] = useState('1');
  const [patientAddressInput, setPatientAddressInput] = useState('');
  const [docString, setDocString] = useState('');
  const [docType, setDocType] = useState('1');
  const [accessCheck, setAccessCheck] = useState(false);
  const [docs, setDocs] = useState([]);
  const [contractAddress, setContractAddress] = useState("");
  const [litSelectedChain, setLitSelectedChain] = useState('');
  const router = useRouter()
  const getEthBalance = async () => {
    if (library && account) {
      const res = await library?.getBalance(account);
      const balance = hexToString(res);
      setYourBalance(balance);
      // console.log(`balance`, balance);
    }
  };


  useEffect(() => {
    getEthBalance();
  }, [account, library]);
  useEffect(() => {
    if (chainId && contracts) {
      const strChainId = chainId.toString() as keyof typeof NETWORKS;
      const network = NETWORKS[strChainId];
      const abis = ABIS as Record<string, any>;
      if (abis[strChainId]) {
        console.log(abis);
        const abi =
          abis[strChainId][network.name].contracts.ElectronicHealthLink.abi;
        setAbi(abi);
        const contract =
          abis[strChainId][network.name].contracts.ElectronicHealthLink.address;
        setYourReadContract(contracts.yourReadContract);
        setYourWriteContract(contracts.yourWriteContract);
        setContractAddress(contract);
      }
      if (chainId == 80001) {
        setLitSelectedChain('mumbai')
      }
      if (chainId == 4) {
        setLitSelectedChain('rinkeby')
      }
      if (chainId == 10) {
        setLitSelectedChain('optimism')
      }
    }
  }, [chainId, contracts]);


  const handleSelectedType = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value);
  };
  async function checkAccessFun() {
    console.log('started checkAccess function');

    if (yourWriteContract && patientAddressInput && account) {
      try {
        const result = await yourWriteContract.checkAccess(patientAddressInput, account, parseInt(selectedType));
        console.log('check', result)
        setAccessCheck(result);
        return result
      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
    }

    return false;
  }



  async function getDocumentsFromGrantFun() {
    setDocs([])
    console.log('started checkAccess function');
    console.log('patient address: ', patientAddressInput);
    console.log('doctor address: ', account);
    console.log(parseInt(selectedType))
    if (yourWriteContract && account) {
      try {
        const check: boolean = await checkAccessFun()
        if (check) {
          const result: any = await yourWriteContract.getDocumentsAll(patientAddressInput/*,account,selectedType*/);

          console.log(result)

          let arr: any = [];
          result.map((item: any) => {
            if (item.doctor == account && item.documentType.toString() == selectedType)
              arr.push({
                createdAt: item.createdAt.toString(),
                documentType: item.documentType.toString(),
                ipfsLink: item.ipfsLink,
                patient: item.patient,
                encryptedSymmetricKey: item.encryptedSymmetricKey,
                doctor: item.doctor
              });
          });

          console.log('arrayGenerated', arr);
          setDocs(arr);

        } else {
          alert('you are not autorized')
        }

      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
    }
  }
  useEffect(() => {

    if (chainId == 80001) {
      setLitSelectedChain('mumbai')
    }
    if (chainId == 4) {
      setLitSelectedChain('rinkeby')
    }
    if (chainId == 10) {
      setLitSelectedChain('optimism')
    }


  }, [chainId]);

  const decrypt = async (ipfsHash: string, encryptedSymmetricKey: string) => {
    console.log('encrypted symmetric key', encryptedSymmetricKey)
    console.log('ipfs hash', ipfsHash)
    console.log('doctor address input', account)
    console.log('doctor address input', patientAddressInput)
    const chain = litSelectedChain;
    const evmContractConditions =
      [
        {
          contractAddress: contractAddress,
          functionName: "checkAccess",
          functionParams: [patientAddressInput, account, selectedType],
          functionAbi: {
            inputs: [
              {
                internalType: "address",
                name: "_patient",
                type: "address",
              },
              {
                internalType: "address",
                name: "_doctor",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "_documentType",
                type: "uint256",
              },
            ],
            name: "checkAccess",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          chain: chain,
          returnValueTest: {
            key: "",
            comparator: "=",
            value: "true",
          },
        },
      ];


    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain })

    const check = uint8arrayFromString(
      encryptedSymmetricKey,
      "base64"
    );

    console.log('---------->symmetricKey base 16', LitJsSdk.uint8arrayToString(check, "base16"))
//@ts-ignore
    const symmetricKey = await window.litNodeClient.getEncryptionKey({
      evmContractConditions,
      // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
      toDecrypt: LitJsSdk.uint8arrayToString(check, "base16"),
     chain,
      authSig
    })
    console.log('---------->symmetricKey', symmetricKey)
    let str = await fetch('https://ipfs.io/ipfs/' + ipfsHash).then(r => r.text());
    console.log(str)
    const arrayBuffer = uint8arrayFromString(
      str,
      "base64"
    ).buffer;
    const blob = new Blob([arrayBuffer])


    const decryptedString = await LitJsSdk.decryptString(
      blob,
      symmetricKey
    );

    console.log('-------->decryptedString', decryptedString);

    return decryptedString
  }




  const handleAddressPatientString = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientAddressInput(e.target.value);
  }

  const handleDocInputString = (e: ChangeEvent<HTMLInputElement>) => {
    setDocString(e.target.value);
  }

  const handledocType = (e: ChangeEvent<HTMLInputElement>) => {
    setDocType(e.target.value);
  }

  function handleBackClick(){
    router.push('/doctor')
  }

  return (
    <Box
      alignItems='center'
      justifyContent='center'
      display='flex'
      flexDirection='column'
      textAlign='center'
    >
      <VStack>
        <Heading as="h1">View patients records 🙎‍♂️</Heading>



        <FormControl>
          <FormLabel htmlFor="email">Patient Address</FormLabel>
          <Input value={patientAddressInput} onChange={handleAddressPatientString}></Input>
          <FormHelperText>We'll never share this address</FormHelperText>
          <Select
            id="country"
            placeholder="Select type"
            mb={5}
            //@ts-ignore
            onChange={handleSelectedType}
          >
            <option value="1">Medical doc type 1</option>
            <option value="2">Medical doc type 2</option>
            <option value="3">Medical doc type 3</option>
          </Select>
        </FormControl>
        <Box
          alignItems='center'
          justifyContent='center'
          display='flex'
          flexDirection='column'
          textAlign='center'
        >

          <Button colorScheme="teal" size="lg" mt={5} m='2' onClick={() => getDocumentsFromGrantFun()}> Load Records </Button>


          <TablePaginated table={docs} decrypt={decrypt} />

        </Box>
      </VStack>

      <Button colorScheme='teal' mt='10px' variant='outline' onClick={handleBackClick}>
            Back
      </Button>


    </Box>
  );
}

export default ContractFields;

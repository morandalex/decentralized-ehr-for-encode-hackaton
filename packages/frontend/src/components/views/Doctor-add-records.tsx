import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import TablePaginated from "./TablePaginated";
import { useEthers } from '@usedapp/core'
import { ethers, utils } from 'ethers'
import LitJsSdk from 'lit-js-sdk'
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import { useRouter } from 'next/router';

import { NFTStorage, File, Blob } from '../../../../../node_modules/nft.storage/dist/bundle.esm.min.js'


const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFTSTORAGE_TOKEN
//@ts-ignore
const clientipfsnftstorage = new NFTStorage({ token: NFT_STORAGE_TOKEN })


import ABIs from '../../lib/hardhat_contracts.json'
import { CID } from "nft.storage/dist/src/lib/interface";
const networks = {
  "31337": "localhost",
  "80001": "mumbai",
  "137": "polygon"
}

export default function DoctorAdd() {


  const [accessCheck, setAccessCheck] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("1");
  const [doctorAddressInput, setDoctorAddressInput] = useState("");
  const [startingTime, setStartingTime] = useState("0");
  const [endingTime, setEndingTime] = useState("999999999");
  const [selectedType, setSelectedType] = useState('1');
  const [docs, setDocs] = useState<any>([]);
  const [yourBalance, setYourBalance] = useState("");
  const [litSelectedChain, setLitSelectedChain] = useState('');


  const [patientAddressInput, setPatientAddressInput] = useState("");
  const [docString, setDocString] = useState("");
  const [fileExtension, setFileExtension] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toggle, setToggle] = useState(false);

  const [encrypted, setEncrypted] = useState('');


  const { library, chainId, account } = useEthers();
  const router = useRouter()

  const [cond, setCond] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState('mumbai')
  const [strEncrypted, setStrEncrypted] = useState('')
  const [contractAddress, setContractAddress] = useState('0x938a5Edb375DDe749616232f7f4F628D6610684c')
  const [strToBeEncrypt, setStrToBeEncrypt] = useState('This string will be encrypted by lit protocol')
  const [symEncrypted, setSymEncrypted] = useState('')
  const [contractAbi, setContractAbi] = useState([])


  useEffect(() => {

    async function init() {
      //INIT LIT CLIENT
      const client = new LitJsSdk.LitNodeClient()
      await client.connect()
      //@ts-ignore
      window.litNodeClient = client
    }

    init()
    setLitSelectedChain(networks[chainId])

  }, [])


  useEffect(() => {


    function initContract() {


      const abi = ABIs[chainId][networks[chainId]].contracts['ElectronicHealthLink'].abi
      const address = ABIs[chainId][networks[chainId]].contracts['ElectronicHealthLink'].address

      setContractAbi(abi)
      setContractAddress(address)
      console.log(contractAbi)
      console.log(contractAddress)


    }
    if (chainId) {
      initContract()
      setLitSelectedChain(networks[chainId])
    }


  }, [chainId])

  const checkChain = () => {

    if (chainId == 80001 || chainId == 31337 || chainId == 137) {
      return true
    }
    else {
      return false
    }

  }


  async function readContract(_contractFunName, par) {


    if (checkChain) {

      const signer = library?.getSigner()
      //@ts-ignore
      const c = new ethers.Contract(contractAddress, contractAbi, signer)
      if (signer) {
        try {
          //console.log(par[0], par[1], par[2])
          let res;
          if (par.length == 0) {
            res = await c[_contractFunName]()
          }
          if (par.length == 1) {
            res = await c[_contractFunName](par[0])
          }
          if (par.length == 2) {
            res = await c[_contractFunName](par[0], par[1])
          }
          if (par.length == 3) {
            res = await c[_contractFunName](par[0], par[1], par[2])
          }
          if (par.length == 4) {
            res = await c[_contractFunName](par[0], par[1], par[2], par[4])
          }


          alert(res)
          return res

        } catch (e: any) {
          if (e.data) {
            alert(e.message + "\n" + e.data.message);
          } else {
            alert(e.message);
          }
        }


      }
    } else {
      alert('connect or change  network')
    }
  }


  async function writeContract(_contractFunName, par) {


    if (checkChain) {

      const signer = library?.getSigner()
      //@ts-ignore
      const c = new ethers.Contract(contractAddress, contractAbi, signer)
      if (signer) {
        try {
          //console.log(par[0], par[1], par[2])
          setLoading(true)
          let tx;
          let receipt;
          if (par.length == 0) {

            tx = await c[_contractFunName]()
            receipt = tx.wait()

          }
          if (par.length == 1) {

            tx = await c[_contractFunName](par[0])

          }
          if (par.length == 2) {

            tx = await c[_contractFunName](par[0], par[1])

          }
          if (par.length == 3) {

            tx = await c[_contractFunName](par[0], par[1], par[2])

          }
          if (par.length == 4) {

            tx = await c[_contractFunName](par[0], par[1], par[2], par[3])

          }
          if (par.length == 5) {

            tx = await c[_contractFunName](par[0], par[1], par[2], par[3], par[4])

          }

          console.log(receipt)
          setLoading(false)


        } catch (e: any) {
          if (e.data) {
            alert(e.message + "\n" + e.data.message);
          } else {
            alert(e.message);
          }

        } finally {
          setLoading(false)
        }

      }
    } else {
      alert('change  network')
    }
  }

  const encrypt = async () => {



    console.log('litSelectedChain', litSelectedChain)
    const chain = litSelectedChain;

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain })


    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      docString
    );

    const encryptedStringBase64 = uint8arrayToString(
      new Uint8Array(await encryptedString.arrayBuffer()),
      "base64"
    );

    // console.log('encryptedStringBase64----|||||||||', encryptedStringBase64)
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
          chain: litSelectedChain,
          returnValueTest: {
            key: "",
            comparator: "=",
            value: "true",
          },
        },
      ];

    //@ts-ignore
    const encSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      evmContractConditions,
      symmetricKey,
      authSig,
      chain,
    });
    console.log(encSymmetricKey)
    const encSymmetricStringBase64 = uint8arrayToString(
      encSymmetricKey,
      "base64"
    );
    console.log('encSymmetricStringBase64', encSymmetricStringBase64)


    await setEncryptedSymmetricKey(encSymmetricStringBase64)
    await setEncrypted(encryptedStringBase64)

    // console.log(evmContractConditions)

    var blobToIpfs = new Blob([encryptedStringBase64]/*, {type: 'plain/text'}*/);


    let metadata = ''



    try {
      metadata = await clientipfsnftstorage.storeBlob(blobToIpfs)
    }
    catch (e) { alert(e.message) }

    console.log(metadata)

    setIpfsHash(metadata)
    //await pushDocumentFun()
    console.log(JSON.stringify(authSig))

  }
  async function nftStorageFun(str) {
    var blobToIpfs = new Blob([str]);
    //   let files = []
    //  files.push(fileToIpfs)

    //    let metadata = ''

    const metadata = await clientipfsnftstorage.storeBlob(blobToIpfs)
    console.log(metadata)
  }



  async function pushDocumentFun() {
    console.log("started checkAccess function");
    console.log("patient address: ", patientAddressInput);
    console.log("doctor address: ", account);
    console.log("docString: ", ipfsHash);
    console.log("docType: ", selectedType);
    console.log('  encryptedSymmetricKey:', encryptedSymmetricKey)


    try {

      const result = await writeContract('pushDocument', [
        patientAddressInput,
        selectedType,
        ipfsHash,
        encryptedSymmetricKey,
        account])

    } catch (e: any) {

    }

  }

  const handleAddressPatientString = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientAddressInput(e.target.value);
  };

  const handleDocInputString = (e: ChangeEvent<HTMLInputElement>) => {
    setDocString(e.target.value);
  };

  const handleSelectedType = (e: any) => {
    e.preventDefault()
    setSelectedType(e.target.value);
  };

  function getBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const retrieveFile = async (e: any) => {
    const data = e.target.files[0];
    let file = e.target.files[0].name;

    let ext = file.split(".").pop();
    console.log("extension:" + ext);
    setFileExtension(ext);
    console.log(data);
    let str: any = await getBase64(data);
    console.log(str);
    //@ts-ignore
    setDocString(str);
    e.preventDefault();
  };



  function handleBackClick() {
    router.push('/')
  }

  return (
    <Box
      alignItems="center"
      justifyContent="center"
      display="flex"
      flexDirection="column"
      textAlign="center"
    >
      <Heading as="h1">Create patients records📝</Heading>



      <FormControl>
        <FormLabel htmlFor="email">Patient Address</FormLabel>
        <Input
          value={patientAddressInput}
          onChange={handleAddressPatientString}
        ></Input>
        <FormHelperText>We'll never share this address</FormHelperText>
        <FormLabel htmlFor="email" mt={5}>
          Type of document
        </FormLabel>
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
        <FormLabel htmlFor="email" mt={5}>
          File to upload
        </FormLabel>
        <Input m="1" p="1" type="file" name="data" onChange={retrieveFile} />
        <Input
          isDisabled={true}
          value={docString}
          onChange={handleDocInputString}
        ></Input>
      </FormControl>
      <Box>
        <Button onClick={() => encrypt()}>Encrypt</Button>

        <Button
          colorScheme="teal"
          disabled={!ipfsHash}
          onClick={() => pushDocumentFun()}
        >
          Publish
        </Button>
        {
          //<Button onClick={()=>{ nftStorageFun('hello world')}}>test nft storage</Button>
        }
        <Button colorScheme='teal' mt='10px' variant='outline' onClick={handleBackClick}>
          Back
        </Button>

      </Box>


    </Box>
  )

}


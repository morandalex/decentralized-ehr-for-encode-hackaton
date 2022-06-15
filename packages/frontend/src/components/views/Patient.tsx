import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Button,
  Box,
  HStack,
  Input,
  Text, Heading,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
} from "@chakra-ui/react";
import { Spinner } from '@chakra-ui/react'
import TablePaginated from "./TablePaginated";
import MultiSelectMenu from '../multiple-select'
import { useEthers, Mumbai, Polygon } from '@usedapp/core'
import { ethers, utils } from 'ethers'
import LitJsSdk from 'lit-js-sdk'
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import { useRouter } from 'next/router';

import ABIs from '../../lib/hardhat_contracts.json'
const networks = {
  "31337": "localhost",
  "80001": "mumbai",
  "137": "polygon"
}

export default function Patient() {


  const [accessCheck, setAccessCheck] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(['1']);
  const [doctorAddressInput, setDoctorAddressInput] = useState("");
  const [startingTime, setStartingTime] = useState("0");
  const [endingTime, setEndingTime] = useState("300000000");
  //const [selectedType, setSelectedType] = useState('1');
  const [docs, setDocs] = useState<any>([]);
  const [yourBalance, setYourBalance] = useState("");
  const [litSelectedChain, setLitSelectedChain] = useState('');

  const { library, chainId, account, switchNetwork } = useEthers();
  const router = useRouter()

  const [cond, setCond] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState('mumbai')
  const [strEncrypted, setStrEncrypted] = useState('')
  const [contractAddress, setContractAddress] = useState('')
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



  const [web3Available, setWeb3Available] = useState(false)


  useEffect(() => {


    async function initContract() {
      const test = checkChain()
      if (test) {
        setWeb3Available(true)
        const abi = ABIs[chainId][networks[chainId]].contracts['ElectronicHealthLink'].abi
        const address = ABIs[chainId][networks[chainId]].contracts['ElectronicHealthLink'].address

        setContractAbi(abi)
        setContractAddress(address)
        console.log(contractAbi)
        console.log(contractAddress)
      } else {
        setWeb3Available(false)
      }


    }
    if (chainId && library) {
      initContract()
      setLitSelectedChain(networks[chainId])
    }


  }, [chainId, library])

  const switchMumbai = async () => {
    if (chainId !== Mumbai.chainId) {
      await switchNetwork(Mumbai.chainId)
    }
  }

  const switchPolygon = async () => {
    if (chainId !== Polygon.chainId) {
      await switchNetwork(Polygon.chainId)
    }
  }


  function checkChain() {

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
            res = await c[_contractFunName](par[0], par[1], par[2], par[3])
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



  const decrypt = async (ipfsHash: string, encryptedSymmetricKey: string) => {
    if (selectedDocType.length == 1) {

      console.log('PARAMETERS', [account, doctorAddressInput, selectedDocType[0]])
      console.log('encrypted symmetric key', encryptedSymmetricKey)
      console.log('ipfs hash', ipfsHash)
      console.log('patient address input', account)
      console.log('doctor address input', doctorAddressInput)
      const chain = litSelectedChain;

      const evmContractConditions = [
        {

          contractAddress: contractAddress,
          functionName: "checkAccess",
          functionParams: [account, doctorAddressInput, selectedDocType[0]],
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

      //console.log('litSelectedchain--------->', litSelectedChain)
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain })


      //console.log(authSig)
      const check = uint8arrayFromString(
        encryptedSymmetricKey,
        "base64"
      );

      // console.log('---------->symmetricKey base 16', LitJsSdk.uint8arrayToString(check, "base16"))
      //@ts-ignore
      const symmetricKey = await window.litNodeClient.getEncryptionKey({
        evmContractConditions,
        // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
        toDecrypt: LitJsSdk.uint8arrayToString(check, "base16"),
        chain,
        authSig
      })
      // console.log('---------->symmetricKey', symmetricKey)
      let str = await fetch('https://ipfs.io/ipfs/' + ipfsHash).then(r => r.text());
      // console.log(str)
      const arrayBuffer = uint8arrayFromString(
        str,
        "base64"
      ).buffer;
      const blob = new Blob([arrayBuffer])


      const decryptedString = await LitJsSdk.decryptString(
        blob,
        symmetricKey
      );

      // console.log('-------->decryptedString', decryptedString);

      return decryptedString


    }
    else alert('select only one type')
  }


  async function checkAccessFun() {
    console.log("started checkAccess function");
    console.log("patient address: ", account);
    console.log("doctorAddressInput: ", doctorAddressInput);
    console.log("selectedDocType: ", selectedDocType);

    if (selectedDocType.length == 1) {
      try {
        const result = await readContract('checkAccess', [
          account,
          doctorAddressInput,
          selectedDocType[0]
        ]
        );
        console.log(result);
        setAccessCheck(result);
      } catch (e: any) {

      }
    } else {
      alert('Please select only one doc type')

    }


  }
  async function grantAccessFun() {
    console.log("started grantAccess function");
    console.log("doctor address: ", doctorAddressInput);
    console.log("starting time: ", startingTime);
    console.log("end time : ", endingTime);
    console.log("selectedType: ", selectedDocType);

    try {
      //      let typesArr = [];

      //    typesArr.push(parseInt(selectedDocType));

      //  console.log(typesArr);
      await writeContract('grantAccess', [
        doctorAddressInput,
        parseInt(startingTime),
        parseInt(endingTime) * 100000,
        selectedDocType
      ])


    } catch (e: any) {

    }

  }
  async function revokeAccessFun() {
    console.log("started revokeAccess function");
    console.log("doctorAddress: ", doctorAddressInput);

    try {
      await writeContract('revokeAccess', [doctorAddressInput])

    } catch (e: any) {

    }

  }
  async function getDocumentsFromGrantFun() {
    if (selectedDocType.length == 1) {

      console.log("started getDocumentsFromGrant function");
      console.log("patient address: ", account);
      setDocs([])



      try {
        const result: any = await readContract('getDocumentsAll', [account])


        let arr: any = [];
        result.map((item: any) => {
          if (item.doctor == doctorAddressInput && item.documentType.toString() == selectedDocType)
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
      } catch (e: any) {

      }



    } else { alert('select only one document type') }
  }

  const handleAddressDoctorString = (e: ChangeEvent<HTMLInputElement>) => {
    setDoctorAddressInput(e.target.value);
  };
  const handleSelectedDocType = (e: any) => {
    setSelectedDocType(e.target.value);

  };

  const handleStartingTime = (e: ChangeEvent<HTMLInputElement>) => {
    setStartingTime(e.target.value);
  };

  const handleEndingTime = (e: ChangeEvent<HTMLInputElement>) => {
    setEndingTime(e.target.value);
  };

  function handleBackClick() {
    router.push('/')
  }
  if (web3Available) {
    return (
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        flexDirection="column"
        textAlign="center"
        p="2"
      >
        <Heading as="h1">Patient page</Heading>
        <Box m="2" p="3" border="1px" borderRadius="16">
          <FormControl>
            <FormLabel>Doctor Address</FormLabel>
            <Input
              value={doctorAddressInput}
              onChange={handleAddressDoctorString}
            ></Input>
            <FormLabel mt={5}>Type of document</FormLabel>
            {
              /*
  
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
            */
            }
            <HStack>
              <MultiSelectMenu setSelectedDocType={setSelectedDocType} label="Health docs list" options={["1", "2", "3"]} optionLabels={["1- reports of examinations", "2 - specialist and pharmaceutical prescriptions;", "3 - summary health profile "]} />
              <Text>{JSON.stringify(selectedDocType)}</Text>
            </HStack>
            <FormLabel>Starting Time</FormLabel>
            <Input value={startingTime} onChange={handleStartingTime}></Input>
            <FormLabel>Ending Time</FormLabel>
            <Input value={endingTime} onChange={handleEndingTime}></Input>

            <HStack>
              <Button colorScheme="teal" m="2" onClick={() => grantAccessFun()}>
                Grant Access
              </Button>
              <Button colorScheme="teal" m="2" onClick={() => revokeAccessFun()}>
                Revoke Access
              </Button>
            </HStack>
          </FormControl>

          <HStack>
            <Button colorScheme="teal" m="2" onClick={() => checkAccessFun()}>
              {" "}
              Check if  authorized
            </Button>

            <Text m="2">
              {accessCheck ? (
                <>The doctor provided is authorized</>
              ) : (
                <>
                  The doctor provided is <b>NOT</b> authorized
                </>
              )}
            </Text>
          </HStack>
          <Button colorScheme="teal" onClick={() => getDocumentsFromGrantFun()}>
            getDocumentsFromGrantFun()
          </Button>
        </Box>


        <Box m="2" p="3" border="1px" borderRadius="16">
          <TablePaginated table={docs} decrypt={decrypt} />

        </Box>

        <Button colorScheme='teal' variant='outline' onClick={handleBackClick}>
          Back
        </Button>

      </Box>
    )
  } else {
    return (


      <Box
        d='flex'
        flexDirection='column'
        alignItems='center'

      >
      
        <Text>Chain id not supported</Text>
        <Button onClick={switchMumbai}> change to mumbai</Button>
        <Button onClick={switchPolygon}> change to polygon</Button>
      </Box>

    )

  }

}


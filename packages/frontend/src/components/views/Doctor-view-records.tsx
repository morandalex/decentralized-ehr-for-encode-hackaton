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

import { NFTStorage, File, Blob } from 'nft.storage'

const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFTSTORAGE_TOKEN
//@ts-ignore
const clientipfsnftstorage = new NFTStorage({ token: NFT_STORAGE_TOKEN })


import ABIs from '../../lib/hardhat_contracts.json'
const networks = {
    "31337": "localhost",
    "80001": "mumbai",
    "137": "polygon"
}

export default function DoctorView() {



    const [selectedDocType, setSelectedDocType] = useState("1");
    const [doctorAddressInput, setDoctorAddressInput] = useState("");
    const [startingTime, setStartingTime] = useState("0");
    const [endingTime, setEndingTime] = useState("999999999");







    const [fileExtension, setFileExtension] = useState("");
    const [ipfsHash, setIpfsHash] = useState("");
    const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [toggle, setToggle] = useState(false);

    const [yourBalance, setYourBalance] = useState("");
    const [selectedType, setSelectedType] = useState('1');
    const [patientAddressInput, setPatientAddressInput] = useState('');
    const [docString, setDocString] = useState('');
    const [docType, setDocType] = useState('1');
    const [accessCheck, setAccessCheck] = useState(false);
    const [docs, setDocs] = useState([]);

    const [litSelectedChain, setLitSelectedChain] = useState('');

    const [encrypted, setEncrypted] = useState('');


    const { library, chainId, account } = useEthers();
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

        if (chainId == 80001 || chainId == 31337 || chainId==137) {
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



    const handleSelectedType = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedType(e.target.value);
    };
    async function checkAccessFun() {
        console.log('started checkAccess function');


        try {
            const result = await readContract('checkAccess', [patientAddressInput, account, parseInt(selectedType)])
            console.log('check', result)
            setAccessCheck(result);
            return result
        }
        catch (e: any) {

        }


        return false;
    }



    async function getDocumentsFromGrantFun() {
        setDocs([])
        console.log('started checkAccess function');
        console.log('patient address: ', patientAddressInput);
        console.log('doctor address: ', account);
        console.log(parseInt(selectedType))

        try {
            const check: boolean = await checkAccessFun()
            if (check) {
                const result: any = await readContract('getDocumentsAll', [patientAddressInput])


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
        catch (e: any) {

        }

    }


    const decrypt = async (ipfsHash: string, encryptedSymmetricKey: string) => {
        console.log('PARAMETERS',[patientAddressInput, account, selectedType])
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

       // console.log('---------->symmetricKey base 16', LitJsSdk.uint8arrayToString(check, "base16"))
        //@ts-ignore
        const symmetricKey = await window.litNodeClient.getEncryptionKey({
            evmContractConditions,
            // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
            toDecrypt: LitJsSdk.uint8arrayToString(check, "base16"),
            chain,
            authSig
        })
        //console.log('---------->symmetricKey', symmetricKey)
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
       {/*
        <Button colorScheme='teal' mt='10px' variant='outline' onClick={handleBackClick}>
          Back
        </Button>
      */}
  
  
      </Box>
    )

}


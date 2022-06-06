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
import { supportedNetworks } from "../../contexts/Web3Provider";
import { switchToNetwork } from "../../core/connectors";

import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Web3Context } from "../../contexts/Web3Provider";
import NETWORKS from "../../core/networks";
//import { ElectronicHealthLink } from "@scaffold-eth/hardhat-ts/generated/contract-types/ElectronicHealthLink";
//import ABIS from "@scaffold-eth/hardhat-ts/hardhat_contracts.json";
//@ts-ignore
import ABIS from "../../hardhat_contracts.json";
//@ts-ignore
import { ElectronicHealthLink } from "../../contract-types/ElectronicHealthLink";
import { useWeb3React } from "@web3-react/core";
import { hexToString } from "../../core/helpers";
import LitJsSdk from 'lit-js-sdk'
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
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
import { NFTStorage, File, Blob } from 'nft.storage'

const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFTSTORAGE_TOKEN
//@ts-ignore
const clientipfsnftstorage = new NFTStorage({ token: NFT_STORAGE_TOKEN })

function ContractFields({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const { account } = useContext(Web3Context);
  const { library } = useWeb3React();
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);

  const [yourReadContract, setYourReadContract] =
    useState<ElectronicHealthLink>();
  const [yourWriteContract, setYourWriteContract] =
    useState<ElectronicHealthLink>();
  const [yourBalance, setYourBalance] = useState("");
  const [selectedType, setSelectedType] = useState("1");
  const [patientAddressInput, setPatientAddressInput] = useState("");
  const [docString, setDocString] = useState("");
  const [fileExtension, setFileExtension] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toggle, setToggle] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [encrypted, setEncrypted] = useState('');
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
    if (chainId && contracts) {
      const strChainId = chainId.toString() as keyof typeof NETWORKS;
      const network = NETWORKS[strChainId];
      const abis = ABIS as Record<string, any>;
      if (abis[strChainId]) {
        console.log(abis);
        const abi =
          abis[strChainId][network.name].contracts.ElectronicHealthLink.abi;
        const contract =
          abis[strChainId][network.name].contracts.ElectronicHealthLink.address;
        setAbi(abi);
        setContractAddress(contract);
        setYourReadContract(contracts.yourReadContract);
        setYourWriteContract(contracts.yourWriteContract);

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

  useEffect(() => {
    getEthBalance();
  }, [account, library]);

  async function handleSwitchNetworkAfterEncryption(id: number) {
    switchToNetwork({ library: library, chainId: id });
    onClose();
    toggleFun();
  }

  function toggleFun() {
    setToggle(!toggle);
  }
  async function nftStorage() {
    const blob = new Blob([encrypted])
    const metadata = await clientipfsnftstorage.storeBlob(blob)
    console.log(metadata)

    await setIpfsHash(metadata)
    //await pushDocumentFun()


  }
  const encrypt = async () => {



console.log('litSelectedChain', litSelectedChain)
const chain = litSelectedChain;

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain})


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
  //  console.log('encSymmetricStringBase64', encSymmetricStringBase64)


    await setEncryptedSymmetricKey(encSymmetricStringBase64)
    await setEncrypted(encryptedStringBase64)

   // console.log(evmContractConditions)
    const blobToIpfs = new Blob([encryptedStringBase64])
    const metadata = await clientipfsnftstorage.storeBlob(blobToIpfs)
 //   console.log(metadata)

    setIpfsHash(metadata)
    //await pushDocumentFun()
    console.log(JSON.stringify(authSig))

  };

  function get() {

    console.log('encryptedSymmetricKey', encryptedSymmetricKey)
    console.log('encrypted', encrypted)
  }


  async function pushDocumentFun() {
    console.log("started checkAccess function");
    console.log("patient address: ", patientAddressInput);
    console.log("doctor address: ", account);
    console.log("docString: ", ipfsHash);
    console.log("docType: ", selectedType);
    console.log('  encryptedSymmetricKey:', encryptedSymmetricKey)

    if (yourWriteContract && account) {
      try {

        const result = await yourWriteContract.pushDocument(
          patientAddressInput,
          selectedType,
          ipfsHash,
          encryptedSymmetricKey,
          account
        );
        console.log(result);
        toggleFun();
      } catch (e: any) {
        if (e.data) {
          alert(e.message + "\n" + e.data.message);
        } else {
          alert(e.message);
        }
        toggleFun();
      }
    }
  }

  const handleAddressPatientString = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientAddressInput(e.target.value);
  };

  const handleDocInputString = (e: ChangeEvent<HTMLInputElement>) => {
    setDocString(e.target.value);
  };

  const handleSelectedType = (e:any) => {
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
    let str :any = await getBase64(data);
    console.log(str);
    //@ts-ignore
    setDocString(str);
    e.preventDefault();
  };

  function handleBackClick(){
    router.push('/doctor')
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

        <Button colorScheme='teal' mt='10px' variant='outline' onClick={handleBackClick}>
             Back
        </Button>

      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button
              onClick={async () => handleSwitchNetworkAfterEncryption(31337)}
            >
              {" "}
              hardhat
            </Button>
            <Button onClick={() => { }}> Optimism</Button>
            <Button onClick={async () => handleSwitchNetworkAfterEncryption(4)}>
              rinkeby
            </Button>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ContractFields;

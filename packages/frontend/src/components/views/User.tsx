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
//import { ElectronicHealthLink } from "@scaffold-eth/hardhat-ts/generated/contract-types/ElectronicHealthLink";
//import ABIS from "@scaffold-eth/hardhat-ts/hardhat_contracts.json";
//@ts-ignore
import ABIS from "../../hardhat_contracts.json";
//@ts-ignore
import { ElectronicHealthLink } from "../../contract-types/ElectronicHealthLink";
import TablePaginated from "./TablePaginated";
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Web3Context } from "../../contexts/Web3Provider";
import NETWORKS from "../../core/networks";
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

function ContractFields({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const [data, setdata] = useState([
    { type: "a1", hash: "b1", col3: "c1" },
    { type: "a2", hash: "b2", col3: "c2" },
    { type: "a3", hash: "b3", col3: "c3" },
  ]);

  const { account } = useContext(Web3Context);
  const { library } = useWeb3React();
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);
  const [accessCheck, setAccessCheck] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("1");
  const [yourReadContract, setYourReadContract] =
    useState<ElectronicHealthLink>();
  const [yourWriteContract, setYourWriteContract] =
    useState<ElectronicHealthLink>();
  const [doctorAddressInput, setDoctorAddressInput] = useState("");
  const [startingTime, setStartingTime] = useState("0");
  const [endingTime, setEndingTime] = useState("999999999");
  const [selectedType, setSelectedType] = useState('');
  const [docs, setDocs] = useState<any>([]);
  const [yourBalance, setYourBalance] = useState("");
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
  const decrypt = async (ipfsHash: string, encryptedSymmetricKey: string) => {
    console.log('encrypted symmetric key', encryptedSymmetricKey)
    console.log('ipfs hash', ipfsHash)
    console.log('patient address input', account)
    console.log('doctor address input', doctorAddressInput)
    const chain = litSelectedChain;
    const evmContractConditions = [
      {

        contractAddress: '0xA3e6c12F42989109e01b92304B84d78810E9f3F0',
        functionName: "checkAccess",
        functionParams: [account, doctorAddressInput, '1'],
        functionAbi: {
          "inputs": [
            {
              "internalType": "address",
              "name": "__patient",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_doctor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_documentType",
              "type": "uint256"
            }
          ],
          "name": "checkAccess",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        chain: chain,
        returnValueTest: {
          key: "",
          comparator: "=",
          value: "true",
        },
      },
    ];

console.log('litSelectedchain--------->',litSelectedChain)
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain})


    console.log(authSig)
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


  async function checkAccessFun() {
    console.log("started checkAccess function");
    console.log("patient address: ", account);
    console.log("doctorAddressInput: ", doctorAddressInput);
    console.log("selectedDocType: ", selectedDocType);

    if (yourWriteContract && account) {
      try {
        const result = await yourWriteContract.checkAccess(
          account,
          doctorAddressInput,
          parseInt(selectedType)
        );
        console.log(result);
        setAccessCheck(result);
      } catch (e: any) {
        if (e.data) {
          alert(e.message + "\n" + e.data.message);
        } else {
          alert(e.message);
        }
      }
    }
  }
  async function grantAccessFun() {
    console.log("started grantAccess function");
    console.log("doctor address: ", doctorAddressInput);
    console.log("starting time: ", startingTime);
    console.log("end time : ", endingTime);
    console.log("selectedType: ", selectedType);
    if (yourWriteContract) {
      try {
        let typesArr = [];
        typesArr.push(parseInt(selectedType));
        console.log(typesArr);
        const result = await yourWriteContract.grantAccess(
          doctorAddressInput,
          parseInt(startingTime),
          parseInt(endingTime) * 100000,
          typesArr
        );
        console.log(result);
      } catch (e: any) {
        if (e.data) {
          alert(e.message + "\n" + e.data.message);
        } else {
          alert(e.message);
        }
      }
    }
  }
  async function revokeAccessFun() {
    console.log("started revokeAccess function");
    console.log("doctorAddress: ", doctorAddressInput);
    if (yourWriteContract && account) {
      try {
        const result = await yourWriteContract.revokeAccess(doctorAddressInput);
        console.log(result);
      } catch (e: any) {
        if (e.data) {
          alert(e.message + "\n" + e.data.message);
        } else {
          alert(e.message);
        }
      }
    }
  }
  async function getDocumentsFromGrantFun() {
    console.log("started getDocumentsFromGrant function");
    console.log("patient address: ", account);
    setDocs([])


    if (yourWriteContract && account) {
      try {
        const result: any = await yourWriteContract.getDocumentsAll(account/*,account,selectedType*/);


        let arr: any = [];
        result.map((item: any) => {
          if (item.doctor == doctorAddressInput && item.documentType.toString() == selectedType)
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
        if (e.data) {
          alert(e.message + "\n" + e.data.message);
        } else {
          alert(e.message);
        }
      }
    }
  }

  const handleAddressDoctorString = (e: ChangeEvent<HTMLInputElement>) => {
    setDoctorAddressInput(e.target.value);
  };
  const handleSelectedType = (e:any) => {
    setSelectedType(e.target.value);

  };

  const handleStartingTime = (e: ChangeEvent<HTMLInputElement>) => {
    setStartingTime(e.target.value);
  };

  const handleEndingTime = (e: ChangeEvent<HTMLInputElement>) => {
    setEndingTime(e.target.value);
  };

  function handleBackClick(){
    router.push('/')
  }

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
      </Box>
      <Box m="2" p="3" border="1px" borderRadius="16">
        <FormControl>
          <FormLabel>Doctor Address</FormLabel>
          <Input
            value={doctorAddressInput}
            onChange={handleAddressDoctorString}
          ></Input>
          <FormLabel mt={5}>Type of document</FormLabel>

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

          <Button colorScheme="teal" onClick={() => getDocumentsFromGrantFun()}>
            getDocumentsFromGrantFun()
          </Button>
        </FormControl>
      </Box>

      <Box m="2" p="3" border="1px" borderRadius="16">
        <TablePaginated table={docs} decrypt={decrypt} />
      </Box>

      <Button colorScheme='teal' variant='outline' onClick={handleBackClick}>
          Back
      </Button>

    </Box>
  );
}
export default ContractFields;

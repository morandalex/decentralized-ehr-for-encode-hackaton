import { Button, Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import ABIS from "../hardhat_contracts.json";

import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { Web3Context } from "../../contexts/Web3Provider";

import NETWORKS from "../../core/networks";
//@ts-ignore
import { ElectronicHealthLink } from "../generated/contract-types/electronichealthlink";
import { useWeb3React } from '@web3-react/core';
import { hexToString } from "../../core/helpers";
type Block = {
  inputs?: Array<Object>;
  outputs?: Array<Object>;
  name?: string;
  stateMutability?: string;
  type: string;
};

function ContractFields({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const { account } = useContext(Web3Context);
  const { library } = useWeb3React();
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);


  const [yourReadContract, setYourReadContract] = useState<ElectronicHealthLink>();
  const [yourWriteContract, setYourWriteContract] = useState<ElectronicHealthLink>();
  const [yourBalance, setYourBalance] = useState("");
  const [selectedDocType, setSelectedDocType] = useState('1');
  const [patientAddressInput, setPatientAddressInput] = useState('');
  const [docString, setDocString] = useState('');
  const [docType, setDocType] = useState('1');
  const [accessCheck, setAccessCheck] = useState(false);
  const [docs, setDocs] = useState([]);
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
        console.log(abis)
        const abi = abis[strChainId][network.name].contracts.ElectronicHealthLink.abi;
        setAbi(abi);
        setYourReadContract(contracts.yourReadContract);
        setYourWriteContract(contracts.yourWriteContract);
      }
    }
  }, [chainId, contracts]);


  async function checkAccessFun() {
    console.log('started checkAccess function');
    console.log('patient address: ', patientAddressInput);
    console.log('selectedDocType: ', selectedDocType);
    if (yourWriteContract && patientAddressInput) {
      try {
       // const result = await yourWriteContract.checkAccess(patientAddressInput, selectedDocType);
       // console.log(result)
       // setAccessCheck(result);
      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
    }
  }

  async function pushDocumentFun() {
    console.log('started checkAccess function');
    console.log('patient address: ', patientAddressInput);
    console.log('docString: ', docString);
    console.log('docType: ', docType);
    if (yourWriteContract) {
      try {
        const result = await yourWriteContract.pushDocument(patientAddressInput, docType, docString);
        console.log(result)

      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
    }
  }

  async function getDocumentsFromGrantFun() {
    console.log('started checkAccess function');
    console.log('patient address: ', patientAddressInput);

    if (yourWriteContract) {
      try {
        const result: any = await yourWriteContract.getDocumentsFromGrant(patientAddressInput);
        console.log(result)
        setDocs(result)
      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
    }
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
  return (
    <Box
      alignItems='center'
      justifyContent='center'
      display='flex'
      flexDirection='column'
      textAlign='center'
    >


      {abi &&
        abi.map((el: Block) => {
          if (el.type === "function" && el.inputs?.length !== 0 && el.name == 'checkAccess') {
            return (


              <Box>
                <HStack key={el.name}>
                  <Text>Patient address input:</Text>

                  <Text>{patientAddressInput}</Text>
                </HStack>
                <Input value={patientAddressInput} onChange={handleAddressPatientString}></Input><br></br>
                <Button m='2' onClick={() => checkAccessFun()}>checkAccessFun()</Button>
                <Text>{accessCheck.toString()}</Text>
              </Box>
            );
          }

        })}
      {abi &&
        abi.map((el: Block) => {
          if (el.type === "function" && el.inputs?.length !== 0 && el.name == 'pushDocument') {
            return (


              <Box
                alignItems='center'
                justifyContent='center'
                display='flex'
                flexDirection='column'
                textAlign='center'
              >
                <Text>Set a document string to publich on ipfs</Text>
                <Input value={docString} onChange={handleDocInputString}></Input><br></br>
                <Text>Set the type of this document ( it must be a number ) </Text>
                <Input value={docType} onChange={handledocType}></Input><br></br>
                <Button m='2' onClick={() => pushDocumentFun()}>pushDocumentFun()</Button>

              </Box>
            );
          }

        })}

      {abi &&
        abi.map((el: Block) => {
          if (el.type === "function" && el.inputs?.length !== 0 && el.name == 'getDocumentsFromGrant') {
            return (


              <Box
                alignItems='center'
                justifyContent='center'
                display='flex'
                flexDirection='column'
                textAlign='center'
              >

                <Button m='2' onClick={() => getDocumentsFromGrantFun()}>getDocumentsFromGrantFun()</Button>
                <Text>{JSON.stringify(docs)}</Text>
              </Box>
            );
          }

        })}


    </Box>
  );
}

export default ContractFields;

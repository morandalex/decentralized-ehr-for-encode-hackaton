import { useEffect, useState } from 'react'
import {
    Alert,
    AlertIcon,
    Box,
    HStack,
    Button,
    Divider,
    Heading,
    Input,
    Text,
    Spinner
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { utils } from 'ethers'
import { useReducer } from 'react'
import Layout from '../components/layout/Layout'
import LitJsSdk from 'lit-js-sdk'
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";

import { ethers } from 'ethers'
import { identity } from 'lodash'


import ABIs from '../lib/hardhat_contracts.json'

const networks = {
    "31337": "localhost",
    "80001": "mumbai",
    "137": "polygon"
}


function SignatureExampleIndex(): JSX.Element {
    const { library, chainId } = useEthers();
    const [cond, setCond] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chain, setChain] = useState('mumbai')
    const [strEncrypted, setStrEncrypted] = useState('')
    const [contractAddress, setContractAddress] = useState('0x938a5Edb375DDe749616232f7f4F628D6610684c')
    const [strToBeEncrypt, setStrToBeEncrypt] = useState('This string will be encrypted by lit protocol')
    const [symEncrypted, setSymEncrypted] = useState('')
    const [contractAbi, setContractAbi] = useState([])



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
        }


    }, [chainId])


    const checkChain = () => {

        if (chainId == 80001 || chainId == 31337) {
            return true
        }
        else {
            return false
        }

    }



    async function readContract(_contractFunName, par) {


        if (checkChain) {

            const signer = library?.getSigner()
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


                    alert(res)

                } catch (e) {
                    console.log(e)
                }

            }
        } else { alert('change  network') }
    }



    async function writeFun() {

        if (chainId == 80001) {


            const signer = library?.getSigner()
            const c = new ethers.Contract('0x938a5Edb375DDe749616232f7f4F628D6610684c', abi, signer)
            if (signer) {
                try {
                    setLoading(true)
                    const oldCond = await c.getFlag()
                    console.log(oldCond, '->', !oldCond)
                    const tx = await c.setCondition(!oldCond)
                    const receipt = await tx.wait();
                    console.log(receipt)
                    setLoading(false)
                    setCond(!oldCond)
                    alert(receipt.transactionHash)
                } catch (e) {
                    setLoading(false)
                    alert(e)
                }

            }
        } else {

            alert('change to mumbai network')
        }
    }

    function handleStr(e) {
        setStrToBeEncrypt(e.target.value)
    }
    return (
        <Layout>

            <Box
                d='flex'
                flexDirection='column'
                alignItems='center'

            >
                <Heading as="h1" mb="12">
                    Decentralized electronic health record dapp
                </Heading>

                <HStack m='2'>
                    <Button mx='1' onClick={() => console.log(contractAbi)}>contractAbi</Button>
                    <Button mx='1' onClick={() => console.log(contractAddress)}>contractAddress</Button>

                </HStack>

                {
                    /*
                            <Button mx='1' onClick={() => readContract('checkAccess', ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 1])}>checkAccess()</Button>
                    */
                }



                {contractAbi.map((item) => {

                    return <Text key={item.name}>{item.name}</Text>
                })

                }



                {loading && (<Spinner />)}
            </Box>
        </Layout>
    )
}

export default SignatureExampleIndex

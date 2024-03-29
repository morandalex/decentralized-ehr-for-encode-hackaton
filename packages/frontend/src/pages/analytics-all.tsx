// @ts-nocheck
import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import { Button, Heading, Box, Text,  HStack, Select } from '@chakra-ui/react'
import { utils } from 'ethers'
import ABIs from '../lib/hardhat_contracts.json'
import { useEthers, Mumbai, Polygon } from '@usedapp/core'
const networks = {
    "31337": "localhost",
    "80001": "mumbai",
    "137": "polygon"
  }

export default function CovalentTest() {
   // const [data, setData] = useState(null)
    const [decodedEventGrantAccess, setDecodedEventGrantAccess] = useState([])
    const [decodedEventRevokeAccess, setDecodedEventRevokeAccess] = useState([])
    const [decodedEventPushDocument, setDecodedEventPushDocument] = useState([])
    const [eventData, setEventData] = useState([])
    const [contractAddress, setContractAddress] = useState(null)
    const { library } = useEthers()
    const [startingBlock, setStartingBlock] = useState('0')
    const [endingBlock, setEndingBlock] = useState('latest')
   
    const [selectedEvent, setSelectedEvent] = useState('')
    const [grantAccessDoctorsCounter, setGrantAccessDoctorsCounter] = useState(0)
    const [documentCreated, setDocumentCreated] = useState(0)
    const [revokeAccessDoctorsCounter, setRevokeAccessDoctorsCounter] = useState(0)
    const [web3Available, setWeb3Available] = useState(false)


    const { chainId, switchNetwork } = useEthers()

    useEffect(() => {


        async function initContract() {
            const test = checkChain()
            if (test) {
                setWeb3Available(true)
                const arr = []
                setContractAddress(ABIs[chainId][networks[chainId]].contracts.ElectronicHealthLink.address)
                ABIs[chainId][networks[chainId]].contracts.ElectronicHealthLink.abi.map((item) => {
                    if (item.type == 'event') {
                        let str = ''
                        item.inputs.map((jtem, j) => {
                            if (j < item.inputs.length - 1) {
                                str += jtem.type + ','
                            }
                            else {
                                str += jtem.type
                            }
                        })
                        const eventTopicName = item.name + '(' + str + ')'
                        const eventTopicNameEncoded = utils.keccak256(utils.toUtf8Bytes(eventTopicName))
                        const eventTopicNameConversion = {
                            name: item.name,
                            inputs: item.inputs,
                            eventTopicNameEncoded,
                            eventTopicName,
                        }
                        arr.push(eventTopicNameConversion)
                    }
                })
                setEventData(arr)
                //console.log(arr)


            } else {
                setWeb3Available(false)
            }


        }
        if (chainId && library) {
            getLatestBlock()
            initContract()
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



    async function getLatestBlock() {
        const key = process.env.NEXT_PUBLIC_COVALENT_KEY
        const result = await fetch('https://api.covalenthq.com/v1/'+chainId+'/block_v2/latest/?quote-currency=USD&format=JSON&key=' + key)
            .then(res => res.json())
            .then(data => {
                return data
            })
        //console.log(result)

        const latest = result.data.items[0].height
        setEndingBlock(latest)
        setStartingBlock(String(parseInt(latest)-100000))
        
    
    }
    async function getSignerAddress() {
        const signer = library?.getSigner()
        return await signer.getAddress()
    }

    async function downloadEventLog() {

        await getLatestBlock()

        try {
            // const contractAddress = '0xCe97CC75316eaf852329Dd0d2F2898E2769106b3'
            const key = process.env.NEXT_PUBLIC_COVALENT_KEY
            //const startingBlock = '26639550'
            //const endingBlock = '26644057'
            const apiReq = 'https://api.covalenthq.com/v1/'+chainId+'/events/address/' + contractAddress + '/?starting-block=' + startingBlock + '&ending-block=' + endingBlock + '&key=' + key;
          //  console.log(apiReq)
            const d = await fetch(apiReq)
                .then(response => response.json())
                .then(d => {
                  //  setData(d);
                    return d
                })
          //  console.log(d)




            if (selectedEvent == 'GrantAccess') {
                getDecodedGrantAccess(d)
            }
            if (selectedEvent == 'RevokeAccess') {
                getDecodedRevokeAccess(d)
            }
            if (selectedEvent == 'PushDocument') {
                getDecodedPushDocument(d)
            }
        } catch (e) {
            alert(e)
        }
    }
    async function getDecodedGrantAccess(d) {
      //  const signerAddr = await getSignerAddress()
        const arr = []
        d && d.data.items.map(
            (item) => {
                let index = 0;
                eventData.map((item, i) => {
                    if (item.name == 'GrantAccess') {
                        index = i
                    }
                });
                // console.log(index, String(item.raw_log_topics[0]), eventData[index].eventTopicNameEncoded)
                if (String(item.raw_log_topics[0]) == eventData[index].eventTopicNameEncoded) {
                    const addr = utils.defaultAbiCoder.decode(['address'], item.raw_log_topics[1])
                    const decoded = utils.defaultAbiCoder.decode(['uint256', 'uint256', 'uint256[]', 'address'], item.raw_log_data)
                    //   if (signerAddr == String(addr))
                    //  {
                    const contractEvent = {
                        block_height: String(item.block_height),
                        block_signed_at: String(item.block_signed_at),
                        tx_hash: String(item.tx_hash),
                        patient: String(decoded[3]),
                        topic: String(item.raw_log_topics[0]),
                        doctor: String(addr),
                        start: String(decoded[0]),
                        end: String(decoded[1]),
                        documentTypes: String(decoded[2])
                    }
                    arr.push(contractEvent)
                    // console.log(decoded)
                    // }
                }
            }
        )
        await setDecodedEventGrantAccess(arr)

        await countDoctorsThatReceivedDocAccessByPatients()

    }
    async function getDecodedPushDocument(d) {
        //const signerAddr = await getSignerAddress()
        const arr = []
        d && d.data.items.map(
            (item) => {
                let index = 0;
                eventData.map((item, i) => {
                    if (item.name == 'PushDocument') {
                        index = i
                    }
                });
                //    console.log(index, String(item.raw_log_topics[0]), eventData[index].eventTopicNameEncoded)
                if (String(item.raw_log_topics[0]) == eventData[index].eventTopicNameEncoded) {
                    const patient = utils.defaultAbiCoder.decode(['address'], item.raw_log_topics[1])
                    //const ipfsLink = utils.defaultAbiCoder.decode(['uint'], item.raw_log_topics[2])
                    const doctor = utils.defaultAbiCoder.decode(['address'], item.raw_log_topics[2])
                    const decoded = utils.defaultAbiCoder.decode(['uint256', 'string'], item.raw_log_data)
                    // console.log('ipfslink', ipfsLink)
                    //  if (signerAddr == String(patient))
                    //  {
                    const contractEvent = {
                        block_height: String(item.block_height),
                        block_signed_at: String(item.block_signed_at),
                        tx_hash: String(item.tx_hash),
                        patient: String(patient),
                        doctor: String(doctor),
                        docType: String(decoded[0]),
                        topic: String(item.raw_log_topics[0]),
                        ipfsLink: String(decoded[1]),
                    }
                    arr.push(contractEvent)
                    // console.log(decoded)
                    // }
                }
            }
        )
        setDecodedEventPushDocument(arr)
        await countDocumentCreated()
        //console.log(arr)
    }
    async function getDecodedRevokeAccess(d) {
        //const signerAddr = await getSignerAddress()
        const arr = []
        d && d.data.items.map(
            (item) => {
                let index = 0;
                eventData.map((item, i) => {
                    if (item.name == 'RevokeAccess') {
                        index = i
                    }
                });
                //  console.log(index, String(item.raw_log_topics[0]), eventData[index].eventTopicNameEncoded)
                if (String(item.raw_log_topics[0]) == eventData[index].eventTopicNameEncoded) {
                    const addr = utils.defaultAbiCoder.decode(['address'], item.raw_log_topics[1])
                    const decoded = utils.defaultAbiCoder.decode(['address'], item.raw_log_data)
                    //  if (signerAddr == String(patient))
                    //  {
                    const contractEvent = {
                        block_height: String(item.block_height),
                        block_signed_at: String(item.block_signed_at),
                        tx_hash: String(item.tx_hash),
                        sender_address: String(decoded[0]),
                        topic: String(item.raw_log_topics[0]),
                        revokeAddress: String(addr),
                    }
                    arr.push(contractEvent)
                    //}
                }
            }
        )
        setDecodedEventRevokeAccess(arr)
        await countDoctorsThatReceivedDocRevokeByPatients()
        //console.log(arr)
    }
    function handleSelectedEvent(e: any) {
        //console.log(e.target.value)
        setSelectedEvent(e.target.value)
    }
    async function countDoctorsThatReceivedDocAccessByPatients() {
        const doctorList = [];
       // console.log(decodedEventGrantAccess)
        decodedEventGrantAccess.map((item) => {
            // console.log()
            const check = doctorList.indexOf(item.doctor)
            //console.log(item.doctor, check)
            if (check < 1) { doctorList.push(item.doctor) }
        })
       // console.log(doctorList.length)
        setGrantAccessDoctorsCounter(doctorList.length);
    }
    async function countDocumentCreated() {
        setDocumentCreated(decodedEventPushDocument.length)


    }
    async function countDoctorsThatReceivedDocRevokeByPatients() {
       // console.log(' countDoctorsThatReceivedDocRevokeByPatients')
        const doctorList = [];
       // console.log(decodedEventGrantAccess)
        decodedEventRevokeAccess.map((item) => {
            // console.log()
            const check = doctorList.indexOf(item.doctor)
          //  console.log(item.doctor, check)
            if (check < 1) { doctorList.push(item.doctor) }
        })
      //  console.log(doctorList.length)
        setRevokeAccessDoctorsCounter(doctorList.length);
    }

    if (web3Available) {
        return (<>
            <Layout>
                <Box
                    d='flex'
                    flexDirection='column'
                    alignItems='center'

                >
                    <Heading as="h1">Global counters</Heading>
                    <Text>From starting block  {startingBlock} to ending block {endingBlock}</Text>
                    <HStack m='3' p='1'>
                        <Select onChange={handleSelectedEvent} placeholder='Select option'>
                            {
                                eventData.map((item, i) => {
                                    return <option key={i} value={item.name}>{item.name} - {item.eventTopicNameEncoded}</option>
                                })
                            }
                        </Select>
                        <Button variant='solid' m='1' p='5' onClick={downloadEventLog}> download </Button>
                    </HStack>
                    {
                        (selectedEvent == 'GrantAccess' && decodedEventGrantAccess) && (<>
                            <Text> Counter of doctors  that received document access by patients : {String(grantAccessDoctorsCounter)}</Text>

                        </>)

                    }
                    {
                        (selectedEvent == 'RevokeAccess' && decodedEventRevokeAccess) && (<>
                            <Text> Counter of doctors  that received document revoke by patients : {String(revokeAccessDoctorsCounter)}</Text>

                        </>)
                    }
                    {
                        (selectedEvent == 'PushDocument' && decodedEventPushDocument) && (<>
                            <Text> Counter of total documents created : {String(documentCreated)}</Text>

                        </>)
                    }
                </Box>
            </Layout>
        </>)

    } else {
        return (

            <Layout>
            <Box
                d='flex'
                flexDirection='column'
                alignItems='center'

            >

<Text>Please connect</Text>
                <Button onClick={switchMumbai}> change to mumbai</Button>
                <Button onClick={switchPolygon}> change to polygon</Button>
            </Box>
            </Layout>

        )

    }
}
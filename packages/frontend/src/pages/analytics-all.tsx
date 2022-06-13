import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import { Button, Box, Text, Divider, HStack, Select } from '@chakra-ui/react'
import { utils } from 'ethers'
import ABIs from '../lib/hardhat_contracts.json'
import { useEthers } from '@usedapp/core'
export default function CovalentTest() {
    const [data, setData] = useState(null)
    const [decodedEventGrantAccess, setDecodedEventGrantAccess] = useState([])
    const [decodedEventRevokeAccess, setDecodedEventRevokeAccess] = useState([])
    const [decodedEventPushDocument, setDecodedEventPushDocument] = useState([])
    const [eventData, setEventData] = useState([])
    const [contractAddress, setContractAddress] = useState(null)
    const { library } = useEthers()
    const [startingBlock, setStartingBlock] = useState('26639550')
    const [endingBlock, setEndingBlock] = useState('latest')
    const [latestBlock, setLatestBlock] = useState('')
    const [selectedEvent, setSelectedEvent] = useState('')
    const [grantAccessDoctorsCounter, setGrantAccessDoctorsCounter] = useState(0)
    const [documentCreated, setDocumentCreated] = useState(0)
    const [revokeAccessDoctorsCounter, setRevokeAccessDoctorsCounter] = useState(0)
    useEffect(() => {




        async function init() {
            await initEventData()
            console.log('ontractAddress', contractAddress)
            console.log('start retrieving data from covalent ...')



        }

        init()

        getLatestBlock()
    }, [])


    async function getLatestBlock() {
        const key = process.env.NEXT_PUBLIC_COVALENT_KEY
        const result = await fetch('https://api.covalenthq.com/v1/80001/block_v2/latest/?quote-currency=USD&format=JSON&key=' + key)
            .then(res => res.json())
            .then(data => {
                return data
            })
        console.log(result.data.items[0].height)
        setLatestBlock(result.data.items[0].height)
    }
    async function getSignerAddress() {
        const signer = library?.getSigner()
        return await signer.getAddress()
    }
    async function initEventData() {
        let arr = []
        setContractAddress(ABIs[80001].mumbai.contracts.ElectronicHealthLink.address)
        ABIs[80001].mumbai.contracts.ElectronicHealthLink.abi.map((item, i) => {
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
                let eventTopicName = item.name + '(' + str + ')'
                const eventTopicNameEncoded = utils.keccak256(utils.toUtf8Bytes(eventTopicName))
                let eventTopicNameConversion = {
                    name: item.name,
                    inputs: item.inputs,
                    eventTopicNameEncoded,
                    eventTopicName,
                }
                arr.push(eventTopicNameConversion)
            }
        })
        setEventData(arr)
        console.log(arr)
    }
    async function downloadEventLog() {

        await getLatestBlock()

        try {
            // const contractAddress = '0xCe97CC75316eaf852329Dd0d2F2898E2769106b3'
            const key = process.env.NEXT_PUBLIC_COVALENT_KEY
            //const startingBlock = '26639550'
            //const endingBlock = '26644057'
            const apiReq = 'https://api.covalenthq.com/v1/80001/events/address/' + contractAddress + '/?starting-block=' + startingBlock + '&ending-block=' + endingBlock + '&key=' + key;
            console.log(apiReq)
            const d = await fetch(apiReq)
                .then(response => response.json())
                .then(d => {
                    setData(d);
                    return d
                })
            console.log(d)




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
        let signerAddr = await getSignerAddress()
        let arr = []
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
                    let contractEvent = {
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
        let signerAddr = await getSignerAddress()
        let arr = []
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
                    let contractEvent = {
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
        console.log(arr)
    }
    async function getDecodedRevokeAccess(d) {
        let signerAddr = await getSignerAddress()
        let arr = []
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
                    let contractEvent = {
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
        console.log(arr)
    }
    function handleSelectedEvent(e: any) {
        console.log(e.target.value)
        setSelectedEvent(e.target.value)
    }
    async function countDoctorsThatReceivedDocAccessByPatients() {
        let doctorList = [];
        console.log(decodedEventGrantAccess)
        decodedEventGrantAccess.map((item, i) => {
            // console.log()
            const check = doctorList.indexOf(item.doctor)
            console.log(item.doctor, check)
            if (check < 1) { doctorList.push(item.doctor) }
        })
        console.log(doctorList.length)
        setGrantAccessDoctorsCounter(doctorList.length);
    }
    async function countDocumentCreated() {
        setDocumentCreated(decodedEventPushDocument.length)


    }
    async function countDoctorsThatReceivedDocRevokeByPatients() {
        console.log(' countDoctorsThatReceivedDocRevokeByPatients')
        let doctorList = [];
        console.log(decodedEventGrantAccess)
        decodedEventRevokeAccess.map((item, i) => {
            // console.log()
            const check = doctorList.indexOf(item.doctor)
            console.log(item.doctor, check)
            if (check < 1) { doctorList.push(item.doctor) }
        })
        console.log(doctorList.length)
        setRevokeAccessDoctorsCounter(doctorList.length);
    }
    return (<>
        <Layout>
            <Box
                d='flex'
                flexDirection='column'
                alignItems='center'
            ><Text>Latest covalent block : {latestBlock}</Text>
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
}
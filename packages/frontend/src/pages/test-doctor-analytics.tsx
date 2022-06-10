import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import { Button, Box, Text, Heading, HStack, Center, Divider  } from '@chakra-ui/react'
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import { utils } from 'ethers'
import ABIs from '../lib/hardhat_contracts.json'
import covalent from './test-covalent'
import { useEthers } from '@usedapp/core'
export default function DoctorAnalyticsTest() {
    const [data, setData] = useState(null)
    const [decodedEventGrantAccess, setDecodedEventGrantAccess] = useState([])
    const [eventData, setEventData] = useState([])
    const [selectedEvent,setSelectedEvent] = useState('')
    const [startingBlock, setStartingBlock] = useState('26639009')
    const [endingBlock, setEndingBlock] = useState('latest')
    const {library} = useEthers()


    useEffect(() => {
        initEventData()
    }, [])

    async function initEventData() {
        let arr = []
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
        console.log("Inside initEventData:", arr)

       }

    async function downloadEventLog() {
        try {
                const contractAddress = '0x3aC0203e43609dA8Ca441a6eBFD652BcECF520Af'
                const key = process.env.NEXT_PUBLIC_COVALENT_KEY
                //const startingBlock = '26639550'
                //const endingBlock = '26644057'

                const d = await fetch('https://api.covalenthq.com/v1/80001/events/address/' + contractAddress + '/?starting-block=' + startingBlock + '&ending-block=' + endingBlock + '&key=' + key)
                    .then(response => response.json())
                    .then(d => {
                        setData(d);
                        return d
                    })
                console.log(d)
                   getDecodedGrantAccess(d)
            } catch (e) {
                alert(e)
            }

    }

    async function getDecodedGrantAccess(d) {
        let arr = []
        let signerAddr = await getSignerAddress()
        d && d.data.items.map(
               (item)  =>  {
                let index = 0;
                    eventData.map((item, i) => {
                       if (item.name == 'GrantAccess') {
                        index = i
                       }
                    });
                console.log(index, String(item.raw_log_topics[0]), eventData[index].eventTopicNameEncoded)
                if (String(item.raw_log_topics[0]) == eventData[index].eventTopicNameEncoded) {
                    const addr = utils.defaultAbiCoder.decode(['address'], item.raw_log_topics[1])
                    const decoded = utils.defaultAbiCoder.decode(['uint256', 'uint256', 'uint256[]'], item.raw_log_data)
                    const patientAddr = item.sender_address
                    //console.log("patientAddr:", item.sender_address)

                    // push only those contents belonging to the signed in address (i.e doctors wallet addr)
                    // The grantAddress will be the 'grant to user' = doctors wallet addr
                    // We check if the recd address is same as signed in address
                    if (signerAddr == String(addr))
                    {
                        let contractEvent = {
                            topic: String(item.raw_log_topics[0]),
                            grantAddress: String(addr),
                            start: String(decoded[0]),
                            end: String(decoded[1]),
                            documentTypes: String(decoded[2]),
                            patientAddress:String(patientAddr)
                        }
                        arr.push(contractEvent)
                    }
                }
            }
        )
        setDecodedEventGrantAccess(arr)
    }

   

    async function ViewDocTimelines(){
        downloadEventLog()
        setSelectedEvent('GrantAccess')
    }

    async function getSignerAddress(){
        const signer = library?.getSigner()
        return await signer.getAddress()
    }


 return (
      <Layout>
        <Heading as="h2" >
            <Center>
                Doctor Dashboard
            </Center>
        </Heading>
        <Box>
            <Center>
                <Button variant = 'solid' m='10' p='5' onClick={ViewDocTimelines}> View Document Timelines </Button>
            </Center>
            {
                (selectedEvent == 'GrantAccess')
                && (
                            <TableContainer>
                                <Table variant='striped' colorScheme='teal'>
                                    <TableCaption placement='top' fontWeight= 'bold'>Patient Document Timelines</TableCaption>
                                    <Thead>
                                        <Tr>
                                            <Th>Patient Address</Th>
                                            <Th>Document Type</Th>
                                            <Th>Access Start</Th>                                            
                                            <Th>Access End</Th>
                                        </Tr>
                                    </Thead>
                                  </Table>
                            </TableContainer>
                   )
            }
        </Box>
        <Box>
            {
                (selectedEvent == 'GrantAccess') 
                && (decodedEventGrantAccess.map((item, i) => {
                                return (< div key={i}>
                                        <Divider my='1'></Divider>
                                            <TableContainer>                                          
                                                <Table variant='striped' colorScheme='teal'>
                                                    <Tbody>
                                                    <Tr>
                                                        <Td >{item.patientAddress}</Td>
                                                        <Td>{item.documentTypes}</Td>
                                                        <Td >{item.start}</Td>
                                                        <Td >{item.end}</Td>
                                                    </Tr>
                                                    </Tbody>
                                                </Table> 
                                          </TableContainer>
                                    </div>
                                )
                    })
                )

            }
        </Box>
      </Layout>
   )

}

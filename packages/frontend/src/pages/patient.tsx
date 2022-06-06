import Layout from '../components/layout/Layout'
import { Box } from '@chakra-ui/react'
import Patient from '../components/views/Patient'
function DoctorAddPage(): JSX.Element {
    return (
        <Layout>
            <Box
                d='flex'
                flexDirection='column'
                alignItems='center'
            >
                <Patient></Patient>
            </Box>
        </Layout>
    )
}
export default DoctorAddPage

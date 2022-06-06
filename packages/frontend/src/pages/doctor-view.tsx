import Layout from '../components/layout/Layout'
import { Box } from '@chakra-ui/react'
import ViewDocs from '../components/views/Doctor-view-records'
function DoctorAddPage(): JSX.Element {
    return (
        <Layout>
            <Box
                d='flex'
                flexDirection='column'
                alignItems='center'
            >
                <ViewDocs></ViewDocs>
            </Box>
        </Layout>
    )
}
export default DoctorAddPage

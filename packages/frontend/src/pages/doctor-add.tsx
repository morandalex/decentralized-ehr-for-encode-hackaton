import Layout from '../components/layout/Layout'
import { Box } from '@chakra-ui/react'
import AddDocs from '../components/views/Doctor-add-records'
function DoctorAddPage(): JSX.Element {
    return (
        <Layout>
            <Box
                d='flex'
                flexDirection='column'
                alignItems='center'
            >
                <AddDocs></AddDocs>
            </Box>
        </Layout>
    )
}
export default DoctorAddPage

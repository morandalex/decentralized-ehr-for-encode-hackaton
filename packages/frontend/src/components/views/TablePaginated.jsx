import React, { forwardRef, useEffect } from "react";

import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Button,
  Heading,
  Tr,
  Th,
  Td,
  TableCaption,
  Spinner,
  useToast,
  Link,
  useClipboard,
  IconButton,
} from "@chakra-ui/react";
const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
import Pagination from "@choc-ui/paginator";

const TablePaginated = ({ table, decrypt }) => {
  const toast = useToast();
  const [data, setData] = React.useState(table);
  const [loading, setLoading] = React.useState(true);
  const [current, setCurrent] = React.useState(1);
  const [strToCopy, setStrToCopy] = React.useState("");
  const { hasCopied, onCopy } = useClipboard(strToCopy);
  const pageSize = 5;
  const offset = (current - 1) * pageSize;
  const rows = data.slice(offset, offset + pageSize);
  useEffect(() => {
    function init() {
   
      setData(table);
    }
    init();
  }, [table]);
  function copyStr(cid) {
    console.log(cid);
    setStrToCopy(cid);
    onCopy();
  }
  const Prev = forwardRef((props, ref) => (
    <Button ref={ref} {...props}>
      Prev
    </Button>
  ));
  const Next = forwardRef((props, ref) => (
    <Button ref={ref} {...props}>
      Next
    </Button>
  ));
  const itemRender = (_, type) => {
    if (type === "prev") {
      return Prev;
    }
    if (type === "next") {
      return Next;
    }
  };

  const downloadImage = async (link,encryptedSymmetricKey) => {
    const base64 = await decrypt(link,encryptedSymmetricKey);
    const extension = base64.substring("data:image/".length, base64.indexOf(";base64"))
    const downloadLink = document.createElement("a");
    downloadLink.href = base64;
    downloadLink.download = link + "."+extension;
    downloadLink.click();
  };

  return (
    <>
      <Table size="sm" shadow="base" rounded="lg" variant="simple">
        <TableCaption mb="10">
          <Pagination
            current={current}
            onChange={(page) => {
              setCurrent(page);
              /*   toast({
                   title: "Pagination.",
                   description: `You changed to page ${page}`,
                   variant: "solid",
                   duration: 9000,
                   isClosable: true,
                   position: "top-right"
                 });*/
            }}
            pageSize={pageSize}
            total={data.length}
            itemRender={itemRender}
            paginationProps={{
              display: "flex",
              pos: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            colorScheme="purple"
            focusRing="gray"
          />
        </TableCaption>
        <Thead>
          <Tr>
            <Th> CreatedAt</Th>
            <Th> DocType</Th>
            <Th> Patient</Th>
            <Th> Doctor</Th>
            <Th> EncSymmKey</Th>
            <Th>IpfsLink</Th>
            <Th> IpfsDownload</Th>
       
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((item, i) => {
            return (
              <Tr key={i}>
                <Td> {item.createdAt}</Td>
                <Td> {item.documentType}</Td>
                <Td> {item.patient.substr(0, 6)}...{item.patient.substr(-4)}</Td>
                <Td> {item.doctor.substr(0, 6)}...{item.doctor.substr(-4)}</Td>
                <Td> {item.encryptedSymmetricKey.substr(0,4)}...{item.encryptedSymmetricKey.substr(-4)}</Td>
                <Td> <Link isExternal href ={'https://ipfs.io/ipfs/'+item.ipfsLink} >{item.ipfsLink.substr(0,6)}...{item.ipfsLink.substr(-4)}</Link></Td>
                <Td>
                  <Button onClick={() => downloadImage(item.ipfsLink,item.encryptedSymmetricKey)}>
                    Download
                  </Button>
                </Td>
               
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};
TablePaginated.defaultProps = {
  table: [],
};
export default TablePaginated;

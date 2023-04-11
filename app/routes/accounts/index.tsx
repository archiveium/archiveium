import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { buildNavbarData } from "~/controllers/dashboard.server";
import { requireUserId } from "~/utils/session";
import {
    Box, Button, Card, Flex, HStack, IconButton, Menu, MenuButton, MenuItemOption, MenuList,
    MenuOptionGroup, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr
} from "@chakra-ui/react";
import { AttachmentIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { SlPencil } from 'react-icons/sl';
import { CiPause1 } from 'react-icons/ci';
import { GetAllAccountsByUserId, GetAllFoldersByUserIdAndAccountId } from "~/controllers/account.server";
import { GetAllEmailsWithS3DataByFolderAndUserId } from "~/controllers/email.server";

export async function loader({ request }: LoaderArgs) {
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folderId');
    const accountId = url.searchParams.get('accountId');

    const userId = await requireUserId(request, '/login');

    const allAccounts = await GetAllAccountsByUserId(userId);
    const selectedAccount = allAccounts.find((account) => account.id == accountId) ?? allAccounts[0];

    const folders = await GetAllFoldersByUserIdAndAccountId(userId, selectedAccount.id);
    const selectedFolder = folders.find((folder) => folder.id == folderId) ?? folders[0];

    const emailsWithS3Data = await GetAllEmailsWithS3DataByFolderAndUserId(userId, selectedFolder.id);

    return {
        navbar: await buildNavbarData(userId),
        allAccounts,
        selectedAccount,
        folders,
        selectedFolder,
        emailsWithS3Data
    };
}

export default function Index() {
    const data = useLoaderData<typeof loader>();

    return (
        <Box as="section" bg="gray.100" minH="100vh">
            <Box>
                <Navbar />
                <Box as="main" p="4">
                    <Flex pb={4}>
                        <Box>
                            <HStack>
                                <Text>Viewing folder</Text>
                                <Menu>
                                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme='blue' size={"sm"}>
                                        <Text maxW={"200"} isTruncated>{data.selectedFolder.name}</Text>
                                    </MenuButton>
                                    <MenuList>
                                        <MenuOptionGroup defaultValue={data.selectedFolder.id} type='radio'>
                                            {data.folders.map((folder) => (
                                                <MenuItemOption as={Link} to={folder.href ?? '#'} key={folder.id} value={folder.id}>
                                                    <Text maxW={"250"} isTruncated fontSize={"sm"}>{folder.name}</Text>
                                                </MenuItemOption>
                                            ))}
                                        </MenuOptionGroup>
                                    </MenuList>
                                </Menu>
                                <Text>in account</Text>
                                <Menu>
                                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme='blue' size={"sm"}>
                                        {data.selectedAccount.email}
                                    </MenuButton>
                                    <MenuList>
                                        <MenuOptionGroup defaultValue={data.selectedAccount.id} type='radio'>
                                            {data.allAccounts.map((account) => (
                                                <MenuItemOption as={Link} to={"?accountId=" + account.id} key={account.id} value={account.id}>
                                                    <Text maxW={"250"} isTruncated fontSize={"sm"}>{account.email}</Text>
                                                </MenuItemOption>
                                            ))}
                                        </MenuOptionGroup>
                                    </MenuList>
                                </Menu>
                            </HStack>
                        </Box>
                        <Spacer />
                        <Box>
                            <HStack>
                                <IconButton
                                    colorScheme='blue'
                                    aria-label='Search database'
                                    size={"sm"}
                                    icon={<SlPencil />}
                                />
                                <IconButton
                                    colorScheme='yellow'
                                    aria-label='Search database'
                                    size={"sm"}
                                    icon={<CiPause1 />}
                                />
                            </HStack>
                        </Box>
                    </Flex>
                    <Card>
                        <TableContainer pt={"1"}>
                            <Table variant='simple' size={"sm"}>
                                <Thead>
                                    <Tr>
                                        <Th>From</Th>
                                        <Th>Subject</Th>
                                        <Th>Date</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data.emailsWithS3Data.map((email) => (
                                        <Tr key={email.id}>
                                            <Td>{email.s3Data?.from}</Td>
                                            <Td>
                                                <Text maxWidth="550px" isTruncated>
                                                    {email.s3Data?.subject} {email.has_attachments ? <AttachmentIcon /> : null}
                                                </Text>
                                            </Td>
                                            <Td>{email.formatted_date}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Box>
            </Box>
        </Box >
    );
}

import type { LoaderArgs } from "@remix-run/node";
import { Form, Link as RemixLink, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { buildNavbarData } from "~/controllers/dashboard.server";
import { requireUserId } from "~/utils/session";
import {
    Box, Button, Card, Flex, HStack, IconButton, Input, Link, Menu, MenuButton, MenuDivider, MenuItemOption, MenuList,
    MenuOptionGroup, Spacer, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr
} from "@chakra-ui/react";
import { AttachmentIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { SlPencil } from 'react-icons/sl';
import { CiPause1, CiPlay1 } from 'react-icons/ci';
import { GetAllAccountsByUserId, GetAllFoldersByUserIdAndAccountId } from "~/controllers/account.server";
import { GetAllEmailsWithS3DataByFolderAndUserId } from "~/controllers/email.server";
import Pagination from "~/components/pagination";
import { GeneratePagination } from "~/utils/pagination";
import { getAllEmailsCountByFolderAndUserId } from "~/models/emails";

export async function loader({ request }: LoaderArgs) {
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folderId');
    const accountId = url.searchParams.get('accountId');
    const page = url.searchParams.get('page') ?? '1';

    const userId = await requireUserId(request, '/login');

    const allAccounts = await GetAllAccountsByUserId(userId);
    const selectedAccount = allAccounts.find((account) => account.id == accountId) ?? allAccounts[0];

    const folders = await GetAllFoldersByUserIdAndAccountId(userId, selectedAccount.id);
    const selectedFolder = folders.find((folder) => folder.id == folderId) ?? folders[0];
    const syncingFolders = folders.filter((folder) => folder.syncing);
    const notSyncingFolder = folders.filter((folder) => !folder.syncing);

    const emailCount = await getAllEmailsCountByFolderAndUserId(userId, selectedFolder.id);
    const emailsWithS3Data = await GetAllEmailsWithS3DataByFolderAndUserId(userId, selectedFolder.id, page);

    const paginator = GeneratePagination(emailCount, 15, page, selectedFolder.id, selectedAccount.id);

    return {
        navbar: await buildNavbarData(userId),
        allAccounts,
        selectedAccount,
        syncingFolders,
        notSyncingFolder,
        selectedFolder,
        emailsWithS3Data,
        paginator,
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
                                        <MenuOptionGroup value={data.selectedFolder.id} type='radio' title='Syncing'>
                                            {data.syncingFolders.map((folder) => (
                                                <MenuItemOption as={RemixLink} to={folder.href ?? '#'} key={folder.id} value={folder.id}>
                                                    <Text maxW={"250"} isTruncated fontSize={"sm"}>{folder.name}</Text>
                                                </MenuItemOption>
                                            ))}
                                        </MenuOptionGroup>
                                        <MenuDivider />
                                        <MenuOptionGroup value={data.selectedFolder.id} type='radio' title='Not Syncing'>
                                            {data.notSyncingFolder.map((folder) => (
                                                <MenuItemOption as={RemixLink} to={folder.href ?? '#'} key={folder.id} value={folder.id}>
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
                                                <MenuItemOption as={RemixLink} to={"?accountId=" + account.id} key={account.id} value={account.id}>
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
                                    as={RemixLink}
                                    to={`/accounts/edit/${data.selectedAccount.id}`}
                                    colorScheme='blue'
                                    aria-label='Edit account'
                                    size={"sm"}
                                    icon={<SlPencil />}
                                />
                                <Form method="post" action={`/accounts/edit/${data.selectedAccount.id}`}>
                                    <Input name="syncing" value={data.selectedAccount.syncing ? 'false' : 'true'} hidden readOnly />
                                    {data.selectedAccount.syncing ?
                                        <IconButton
                                            type="submit"
                                            name="formName"
                                            value="updateAccountSync"
                                            colorScheme='yellow'
                                            aria-label='Pause account syncing'
                                            size={"sm"}
                                            icon={<CiPause1 />}
                                        />
                                        :
                                        <IconButton
                                            type="submit"
                                            name="formName"
                                            value="updateAccountSync"
                                            colorScheme='green'
                                            aria-label='Resume account syncing'
                                            size={"sm"}
                                            icon={<CiPlay1 />}
                                        />
                                    }
                                </Form>
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
                                            <Td>
                                                <Link href={`email/${email.id}`} isExternal>{email.s3Data?.from}</Link>
                                            </Td>
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
                        <Pagination {...data.paginator} />
                    </Card>
                </Box>
            </Box>
        </Box >
    );
}

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import Navbar from "~/components/navbar";
import { buildNavbarData } from "~/controllers/dashboard.server";
import { commitAppSession, getSession, requireUserId } from "~/utils/session";
import {
    Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Card, CardBody, Checkbox,
    Container, Flex, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Radio,
    RadioGroup, Stack, Table, Tbody, Td, Text, Th, Thead, Tr
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getAllProviders } from "~/models/providers";
import { badRequest } from "~/utils/request";
import { SaveAccount, ValidateAccount } from "~/controllers/account.server";
import { ZodError } from "zod";
import AlertError from "~/components/alert_error";
import { IMAPAuthenticationFailed } from "~/exceptions/imap";
import { Step, Steps } from 'chakra-ui-steps';

enum formNames {
    SUBMIT_PROVIDER = "submitProvider",
    SUBMIT_FOLDERS = "submitFolders",
};

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request, '/login');
    const navbarData = await buildNavbarData(userId);
    const availableProviders = await getAllProviders();
    const defaultProvider = availableProviders.find(provider => provider.is_default);
    return {
        navbar: navbarData,
        availableProviders,
        defaultProvider,
    };
};

export const action = async ({ request }: ActionArgs) => {
    const userId = await requireUserId(request, '/login');
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const body = await request.formData();

    try {
        switch (body.get("formName")) {
            case formNames.SUBMIT_PROVIDER:
                const formData = Object.fromEntries(body);
                const validatedProvider = await ValidateAccount(formData, userId);
                return json({
                    step: {
                        active: 1,
                    },
                    validatedProvider: { remoteFolders: validatedProvider.remoteFolders, email: validatedProvider.account.email },
                    fieldErrors: null,
                    formError: undefined
                });
            case formNames.SUBMIT_FOLDERS:
                await SaveAccount(userId, body.get('email'), body.getAll('folders'));
                session.flash('globalMessage', 'Account has been saved successfully!');
        }
    } catch (error: any) {
        // TODO Log error
        if (error instanceof ZodError) {
            return badRequest({
                step: {
                    active: 0,
                },
                validatedProvider: null,
                fieldErrors: error.flatten().fieldErrors,
                formError: undefined,
            });
        } else if (error instanceof IMAPAuthenticationFailed) {
            return badRequest({
                step: {
                    active: 0,
                },
                validatedProvider: null,
                fieldErrors: null,
                formError: 'Provided credentials are invalid.',
            });
        }

        return badRequest({
            step: {
                active: 0,
            },
            validatedProvider: null,
            fieldErrors: null,
            formError: 'There was an error adding account.',
        });
    }

    return redirect('/dashboard', {
        headers: {
            'Set-Cookie': await commitAppSession(session),
        }
    });
};

export default function Add() {
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();
    const activeStep = actionData?.step.active ?? 0;

    const addProviderForm = (
        <Form method="post">
            <CardBody>
                <FormControl isRequired isInvalid={actionData?.fieldErrors?.name ? true : false}>
                    <FormLabel>Name</FormLabel>
                    <Input name="name" type={"text"} placeholder='Enter a name for this account' />
                    <FormErrorMessage>{actionData?.fieldErrors?.name}</FormErrorMessage>
                </FormControl>
                <FormControl mt={6} isRequired isInvalid={actionData?.fieldErrors?.email ? true : false}>
                    <FormLabel>Email Address</FormLabel>
                    <Input name="email" type={"email"} placeholder='Enter email address' />
                    <FormErrorMessage>{actionData?.fieldErrors?.email}</FormErrorMessage>
                </FormControl>
                <FormControl mt={6} isRequired isInvalid={actionData?.fieldErrors?.password ? true : false}>
                    <FormLabel>Password</FormLabel>
                    <Input name="password" type={"password"} placeholder='Enter application password (not the password used for logging in)' />
                    <FormErrorMessage>{actionData?.fieldErrors?.password}</FormErrorMessage>
                </FormControl>
                <FormControl as='fieldset' mt={6} isRequired isInvalid={actionData?.fieldErrors?.provider_id ? true : false}>
                    <FormLabel as='legend'>
                        Select Provider
                    </FormLabel>
                    <RadioGroup name="provider_id" defaultValue={loaderData.defaultProvider?.id}>
                        <HStack spacing='24px'>
                            {loaderData.availableProviders.map((provider) => <Radio key={provider.id} value={provider.id}>{provider.name}</Radio>)}
                        </HStack>
                    </RadioGroup>
                    <FormErrorMessage>{actionData?.fieldErrors?.provider_id}</FormErrorMessage>
                </FormControl>
                <FormControl pt={8}>
                    <Button type="submit" name="formName" value={formNames.SUBMIT_PROVIDER} variant='solid' colorScheme='blue'>
                        Select Folders
                    </Button>
                </FormControl>
            </CardBody>
        </Form>
    );
    const selectFoldersForm = (
        <CardBody>
            {actionData?.validatedProvider?.remoteFolders ?
                <Form method="post">
                    <Box p={0}>
                        <Table variant='simple'>
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th isNumeric>Email Count</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {actionData.validatedProvider.remoteFolders.map((remoteFolder) => (
                                    <Tr key={remoteFolder.name}>
                                        <Td><Checkbox spacing={"1rem"} name='folders' value={remoteFolder.name}>{remoteFolder.name}</Checkbox></Td>
                                        <Td isNumeric>{remoteFolder.status_messages}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Input name="email" defaultValue={actionData.validatedProvider.email} hidden />
                        <FormControl pt={8}>
                            <Button type="submit" name="formName" value={formNames.SUBMIT_FOLDERS} variant='solid' colorScheme='blue'>
                                Add Account
                            </Button>
                        </FormControl>
                    </Box>
                </Form>
                : <Container py={{ base: '16', md: '24' }}>
                    <Stack spacing={{ base: '8', md: '10' }}>
                        <Stack spacing={{ base: '4', md: '5' }} align="center">
                            <Heading size={"md"}>No folders found</Heading>
                            <Text color="muted" maxW="2xl" textAlign="center" fontSize="xl">
                                Enter valid credentials to see available folders for that account.
                            </Text>
                        </Stack>
                    </Stack>
                </Container>}
        </CardBody>
    );

    const steps = [
        { label: 'Provider Credentials', content: addProviderForm },
        { label: 'Select Folders', content: selectFoldersForm },
    ];

    return (
        <Box as="section" bg="gray.100" minH="100vh">
            <Box>
                <Navbar />
                <Box as="main" p="4">
                    <Flex pb={4}>
                        <Box>
                            <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/dashboard'>
                                        <Text fontSize='lg'>Overview</Text>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='#'>
                                        <Text fontSize='lg'>Add Account</Text>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>
                    </Flex>
                    <Box pb={4}>
                        <AlertError {...actionData} />
                    </Box>
                    <Card>
                        <Flex flexDir="column" p={4} overflowX={'auto'}>
                            <Steps activeStep={activeStep}>
                                {steps.map(({ label, content }) => (
                                    <Step label={label} key={label}>
                                        {content}
                                    </Step>
                                ))}
                            </Steps>
                        </Flex>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
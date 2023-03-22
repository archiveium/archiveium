import LogoSmall from "~/components/logo_small";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { commitSession, createUserSession, getSession, getUserId } from "~/utils/session";
import { LoginUser } from "~/controllers/auth.server";
import { badRequest } from "~/utils/request";
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Link,
    Button,
    Heading,
    Text,
    Container,
    HStack,
    Center,
    Card,
    CardBody,
} from '@chakra-ui/react';
import AlertError from "~/components/alert_error";
import AlertSuccess from "~/components/alert_success";

export async function loader({ request }: LoaderArgs) {
    // TODO This needs to be in a middleware, whenever Remix implements that concept
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }

    const session = await getSession(request.headers.get('Cookie'));

    return json(
        {
            flashMessage: session.get('globalMessage') || null
        },
        {
            headers: {
              'Set-Cookie': await commitSession(session),
            },
        }
    );
}

export const action = async ({ request }: ActionArgs) => {
    const body = await request.formData();
    const credentials = Object.fromEntries(body);

    try {
        const user = await LoginUser(credentials);
        return createUserSession(user.id, '/dashboard');
    } catch (error) {
        // TODO Log error
    }

    return badRequest({
        formError: 'Invalid credentials. Please check email and password.',
    });
};

export default function Login() {
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();

    return (
        <Box as="section" bg="gray.100" minH="100vh">
            <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
                <Stack spacing="6">
                    <Stack spacing="6">
                        <Center>
                            <LogoSmall />
                        </Center>
                        <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
                            <Heading size={{ base: 'xs', md: 'sm' }}>Log in to your account</Heading>
                        </Stack>
                        <AlertError { ...actionData }/>
                        <AlertSuccess { ...loaderData }/>
                    </Stack>
                    <Card borderRadius={{ base: 'none', sm: 'xl' }} p={4}>
                        <CardBody>
                            <Form autoComplete="off" method="post">
                                <Stack spacing="6">
                                    <Stack spacing="5">
                                        <FormControl isRequired>
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <Input id="email" type="email" />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <HStack justify="space-between">
                                                <FormLabel htmlFor="password">Password</FormLabel>
                                                <Link color={"blue.600"} size="md" href="/forgot-password">
                                                    I forgot password
                                                </Link>
                                            </HStack>
                                            <Input id="password" type="password" />
                                        </FormControl>
                                    </Stack>
                                    <Stack spacing="6">
                                        <Button type="submit" colorScheme={"blue"}>Sign in</Button>
                                        <HStack spacing="1" justify="center">
                                            <Text color="muted">Don't have account yet? Enroll in </Text>
                                            <Link color={"blue.600"} href="/preview">
                                                closed preview
                                            </Link>
                                        </HStack>
                                    </Stack>
                                </Stack>
                            </Form>
                        </CardBody>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
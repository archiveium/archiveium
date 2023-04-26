import LogoSmall from "~/components/logo_small";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { commitSession, getSession, getUserId } from "~/utils/session";
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
    FormErrorMessage,
} from '@chakra-ui/react';
import AlertError from "~/components/alert_error";
import AlertSuccess from "~/components/alert_success";
import { CreatePasswordResetRequest } from "~/controllers/auth.server";
import { ZodError } from "zod";
import { UserNotVerifiedException } from "~/exceptions/auth";

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
    const formData = Object.fromEntries(body);
    const session = await getSession(request.headers.get('Cookie'));

    try {
        await CreatePasswordResetRequest(formData);
        session.flash('globalMessage', 'A password reset email has been sent.');
        return redirect('/login', {
            headers: {
                'Set-Cookie': await commitSession(session),
            }        
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return badRequest({
                fieldErrors: error.flatten().fieldErrors,
                formError: undefined,
            });
        } else if (error instanceof UserNotVerifiedException) {
            return badRequest({
                fieldErrors: null,
                formError: error.message,
            });
        }
        console.error(error);
    }

    return badRequest({
        fieldErrors: null,
        formError: 'There was an error processing your request. Please try again.',
    });
};

export default function ForgotPassword() {
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
                            <Heading size={{ base: 'xs', md: 'sm' }}>Password reset request</Heading>
                        </Stack>
                        <AlertError { ...actionData }/>
                        <AlertSuccess { ...loaderData }/>
                    </Stack>
                    <Card borderRadius={{ base: 'none', sm: 'xl' }} p={4}>
                        <CardBody>
                            <Form autoComplete="off" method="post">
                                <Stack spacing="6">
                                    <Stack spacing="5">
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.email ? true : false }>
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <Input name="email" type="email" />
                                            <FormErrorMessage>{actionData?.fieldErrors?.email}</FormErrorMessage>
                                        </FormControl>
                                    </Stack>
                                    <Stack spacing="6">
                                        <Button type="submit" colorScheme={"blue"}>Reset Password</Button>
                                        <HStack spacing="1" justify="center">
                                            <Text color="muted">Remember it already? </Text>
                                            <Link color={"blue.600"} href="/login">
                                                Sign in
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
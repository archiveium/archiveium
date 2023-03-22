import LogoSmall from "~/components/logo_small";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { commitSession, getSession, getUserId } from "~/utils/session";
import { RegisterUser } from "~/controllers/auth.server";
import { ZodError } from "zod";
import { badRequest } from "~/utils/request";
import { Box, Button, Card, CardBody, Center, Container, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Link, Stack, Text } from "@chakra-ui/react";
import AlertError from "~/components/alert_error";
import AlertSuccess from "~/components/alert_success";
import { UserAlreadyRegisteredException, UserNotAcceptedException, UserNotInvitedException } from "~/exceptions/auth";

export const action = async ({ request }: ActionArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const body = await request.formData();
    const formData = Object.fromEntries(body);
    try {
        await RegisterUser(formData);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return badRequest({
                fieldErrors: error.flatten().fieldErrors,
                formError: undefined,
            });
        } else if (
            error instanceof UserNotInvitedException || 
            error instanceof UserNotAcceptedException || 
            error instanceof UserAlreadyRegisteredException
        ) {
            return badRequest({
                fieldErrors: null,
                formError: error.message,
            });
        }

        return badRequest({
            fieldErrors: null,
            formError: (error.code && (error.code == 23505)) ? 'Email is already registered.' : 'There was an error registering your account. Please try again.',
        });
    }

    session.flash('globalMessage', 'An email has been sent to your email address. Please verify before logging in.');
    return redirect('/login', {
        headers: {
            'Set-Cookie': await commitSession(session),
        }
    });
};

export async function loader({ request }: LoaderArgs) {
    // TODO This needs to be in a middleware, whenever Remix implements that concept
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }

    const session = await getSession(
        request.headers.get('Cookie')
    );

    return json(
        { flashMessage: session.get('globalMessage') || null },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        }
    );
}

export default function Register() {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <Box as="section" bg="gray.100" minH="100vh">
            <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
                <Stack spacing="6">
                    <Stack spacing="6">
                        <Center>
                            <LogoSmall />
                        </Center>
                        <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
                            <Heading size={{ base: 'xs', md: 'sm' }}>Register new account</Heading>
                        </Stack>
                        <AlertError {...actionData} />
                        <AlertSuccess {...loaderData} />
                    </Stack>
                    <Card borderRadius={{ base: 'none', sm: 'xl' }} p={4}>
                        <CardBody>
                            <Form autoComplete="off" method="post">
                                <Stack spacing="6">
                                    <Stack spacing="5">
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.name ? true : false }>
                                            <FormLabel>Name</FormLabel>
                                            <Input name="name" type="text" placeholder="Enter your name"/>
                                            <FormErrorMessage>{actionData?.fieldErrors?.name}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.email ? true : false }>
                                            <FormLabel>Email address</FormLabel>
                                            <Input name="email" type="email" placeholder="Enter your email address"/>
                                            <FormErrorMessage>{actionData?.fieldErrors?.email}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.password ? true : false }>
                                            <FormLabel>Password</FormLabel>
                                            <Input name="password" type="password" placeholder="Your password"/>
                                            <FormErrorMessage>{actionData?.fieldErrors?.password}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.passwordConfirm ? true : false }>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <Input name="passwordConfirm" type="password" placeholder="Re-enter your password"/>
                                            <FormErrorMessage>{actionData?.fieldErrors?.passwordConfirm}</FormErrorMessage>
                                        </FormControl>
                                    </Stack>
                                    <Stack spacing="6">
                                        <Button type="submit" colorScheme={"blue"}>Register</Button>
                                        <HStack spacing="1" justify="center">
                                            <Text color="muted">Already have an account? </Text>
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
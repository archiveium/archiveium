import LogoSmall from "~/components/logo_small";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { commitSession, getSession, getUserId } from "~/utils/session";
import { UpdatePassword, ValidatePasswordResetToken } from "~/controllers/auth.server";
import { ZodError } from "zod";
import { badRequest } from "~/utils/request";
import { Box, Button, Card, CardBody, Center, Container, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Link, Stack, Text } from "@chakra-ui/react";
import AlertError from "~/components/alert_error";
import AlertSuccess from "~/components/alert_success";
import { PasswordResetRequestTokenExpiredException } from "~/exceptions/auth";

export const action = async ({ request }: ActionArgs) => {
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }

    const session = await getSession(request.headers.get("Cookie"));
    const body = await request.formData();
    const formData = Object.fromEntries(body);

    try {
        await UpdatePassword(formData);
    } catch (error: any) {
        if (error instanceof PasswordResetRequestTokenExpiredException) {
            session.flash('globalMessage', 'Password reset token has expired. Please try again.');
            return redirect('/forgot-password', {
                headers: {
                    'Set-Cookie': await commitSession(session),
                }
            });
        } else if (error instanceof ZodError) {
            return badRequest({
                fieldErrors: error.flatten().fieldErrors,
                formError: undefined,
            });
        }

        console.error(error);
        return badRequest({
            fieldErrors: null,
            formError: 'There was an error updating your password',
        });
    }

    session.flash('globalMessage', 'Password has been updated successfully.');
    return redirect('/login', {
        headers: {
            'Set-Cookie': await commitSession(session),
        }
    });
};

export async function loader({ request, params }: LoaderArgs) {
    // TODO This needs to be in a middleware, whenever Remix implements that concept
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }

    const session = await getSession(request.headers.get('Cookie'));
    const url = new URL(request.url);
    const passwordResetToken = url.searchParams.get('token') ?? '';
    const email = url.searchParams.get('email') ?? '';

    // validate token and email
    try {
        await ValidatePasswordResetToken(passwordResetToken, email);
    } catch (error) {
        if (error instanceof PasswordResetRequestTokenExpiredException) {
            session.flash('globalMessage', 'Password reset token has expired. Please try again.');
            return redirect('/forgot-password', {
                headers: {
                    'Set-Cookie': await commitSession(session),
                }
            });
        }

        // if invalid, redirect to login page with an error
        session.flash('globalMessage', 'Invalid password reset token.');
        return redirect('/login', {
            headers: {
                'Set-Cookie': await commitSession(session),
            }
        });
    }

    return json(
        {
            flashMessage: session.get('globalMessage') || null,
            token: passwordResetToken,
            email
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        }
    );
}

export default function ResetPassword() {
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
                            <Heading size={{ base: 'xs', md: 'sm' }}>Reset Password</Heading>
                        </Stack>
                        <AlertError {...actionData} />
                        <AlertSuccess {...loaderData} />
                    </Stack>
                    <Card borderRadius={{ base: 'none', sm: 'xl' }} p={4}>
                        <CardBody>
                            <Form autoComplete="off" method="post">
                                <Stack spacing="6">
                                    <Stack spacing="5">
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.password ? true : false}>
                                            <FormLabel>New Password</FormLabel>
                                            <Input name="password" type="password" placeholder="Your new password" />
                                            <FormErrorMessage>{actionData?.fieldErrors?.password}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.passwordConfirm ? true : false}>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <Input name="passwordConfirm" type="password" placeholder="Re-enter your password" />
                                            <FormErrorMessage>{actionData?.fieldErrors?.passwordConfirm}</FormErrorMessage>
                                        </FormControl>
                                    </Stack>
                                    <Input name="token" defaultValue={loaderData.token} hidden />
                                    <Input name="email" defaultValue={loaderData.email} hidden />
                                    <Stack spacing="6">
                                        <Button type="submit" colorScheme={"blue"}>Update Password</Button>
                                        <HStack spacing="1" justify="center">
                                            <Text color="muted">Changed mind? </Text>
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
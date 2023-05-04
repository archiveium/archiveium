import LogoSmall from "~/components/logo_small";
import { useActionData, Form } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { ActionArgs , LoaderArgs} from "@remix-run/node";
import { RegisterForPreview } from "~/controllers/register.server";
import { badRequest } from "~/utils/request";
import { ZodError } from "zod";
import { commitAppSession, getSession, getUserId } from "../utils/session";
import { Box, Button, Card, CardBody, Center, Container, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Link, Stack, Text } from "@chakra-ui/react";
import AlertError from "~/components/alert_error";

export async function loader({ request }: LoaderArgs) {
    // TODO This needs to be in a middleware, whenever Remix implements that concept
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }
    return null;
}

// TODO Handle only POST requests
export const action = async ({ request }: ActionArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const body = await request.formData();
    const formData = Object.fromEntries(body);
    try {
        await RegisterForPreview(formData);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return badRequest({
                fieldErrors: error.flatten().fieldErrors,
                formError: undefined,
            });
        }

        return badRequest({
            fieldErrors: null,
            formError: (error.code && (error.code == 23505)) ? 'Email is already registered/enrolled.' : 'There was an error enrolling your account. Please try again.',
        });
    }

    session.flash('globalMessage', 'Thank you for showing interest. Keep an eye on your mailbox!');
    return redirect('/login', {
        headers: {
            'Set-Cookie': await commitAppSession(session),
        }        
    });
};

export default function Preview() {
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
                            <Heading size={{ base: 'xs', md: 'sm' }}>Closed Preview Enrollment</Heading>
                        </Stack>
                        <AlertError { ...actionData }/>
                    </Stack>
                    <Card borderRadius={{ base: 'none', sm: 'xl' }} p={4}>
                        <CardBody>
                            <Text fontSize={"sm"}>After you have submitted email address, an email will be sent once we are ready to register your account.</Text>
                            <Form autoComplete="off" method="post">
                                <Stack spacing="6" pt={4}>
                                    <Stack spacing="5">
                                        <FormControl isRequired isInvalid={actionData?.fieldErrors?.email ? true : false }>
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <Input name="email" type="email" />
                                            <FormErrorMessage>{actionData?.fieldErrors?.email}</FormErrorMessage>
                                        </FormControl>
                                    </Stack>
                                    <Stack spacing="6">
                                        <Button type="submit" colorScheme={"blue"}>Enroll me</Button>
                                        <HStack spacing="1" justify="center">
                                            <Text color="muted">Already have account? </Text>
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
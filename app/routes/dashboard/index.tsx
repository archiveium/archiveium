import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { buildDashboardData, buildNavbarData } from "~/controllers/dashboard.server";
import { requireUserId } from "~/utils/session";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Card, CardBody, Flex, Spacer, Stat, StatGroup, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import { AddIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Suspense } from "react";
import DashboardFallback from "~/components/fallbacks/dashboard";

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request, '/login');
    return defer({
        navbar: await buildNavbarData(userId),
        dashboard: buildDashboardData(userId)
    });
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
                            <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='#'>
                                        <Text fontSize='lg'>Overview</Text>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>
                        <Spacer />
                        <Box>
                            <Button leftIcon={<AddIcon />} colorScheme='blue' size={"sm"} as={Link} to="/accounts/add">Add Account</Button>
                        </Box>
                    </Flex>
                    <Card>
                        <CardBody>
                            <Suspense fallback={<DashboardFallback />}>
                                <Await resolve={data.dashboard}>
                                    {(dashboard) => (
                                        <>
                                            <StatGroup p={4}>
                                                <Stat>
                                                    <StatLabel>Accounts Added</StatLabel>
                                                    <StatNumber>{ dashboard.accounts.added }</StatNumber>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Accounts Syncing</StatLabel>
                                                    <StatNumber>{ dashboard.accounts.syncing }</StatNumber>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Total Emails (Remote)</StatLabel>
                                                    <StatNumber>{ dashboard.emails.total }</StatNumber>
                                                </Stat>
                                            </StatGroup><StatGroup p={4}>
                                                <Stat>
                                                    <StatLabel>Emails Processed</StatLabel>
                                                    <StatNumber>{ dashboard.emails.processed }</StatNumber>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Failures</StatLabel>
                                                    <StatNumber>{ dashboard.emails.failure }</StatNumber>
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Quota Used ({ dashboard.emails.quota } emails)</StatLabel>
                                                    <StatNumber>{ dashboard.emails.used }</StatNumber>
                                                </Stat>
                                            </StatGroup>
                                        </>
                                    )}
                                </Await>
                            </Suspense>
                        </CardBody>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}

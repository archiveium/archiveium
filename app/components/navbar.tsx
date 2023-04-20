import LogoNavbar from "./logo_navbar";
import {
    Box,
    Flex,
    Avatar,
    HStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Text,
    Button,
} from '@chakra-ui/react';
import { Form, useLoaderData } from "@remix-run/react";
import type { NavbarLoaderData } from "~/types/navbar";

export default function Navbar() {
    const data = useLoaderData<NavbarLoaderData>();

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            w="full"
            px="4"
            bg="white"
            borderBottomWidth="1px"
            color="inherit"
            h="14"
        >
            <HStack spacing={8} alignItems={'center'}>
                <Box>
                    <LogoNavbar />
                </Box>
            </HStack>
            <Flex alignItems={'center'}>
                <Menu>
                    <MenuButton
                        as={Button}
                        rounded={'full'}
                        variant={'link'}
                        cursor={'pointer'}
                        style={{ textDecoration: 'none' }}
                        minW={0}>
                        <HStack>
                            <Avatar name={data.navbar.user.name} size={'sm'} bg="gray.100" />
                            <Text fontSize={"sm"}>{data.navbar.user.name}</Text>
                        </HStack>
                    </MenuButton>
                    <MenuList>
                        <Form action="/logout" method="post">
                            <MenuItem type="submit">Logout</MenuItem>
                        </Form>
                    </MenuList>
                </Menu>
            </Flex>
        </Flex>
    );
}
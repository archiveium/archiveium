import { DeleteIcon } from "@chakra-ui/icons"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    IconButton,
    useDisclosure
} from "@chakra-ui/react"
import { Form } from "@remix-run/react"
import React from "react"

export function DeleteAccountDialog(data: {accountId: string}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    return (
        <>
            <IconButton colorScheme='red' aria-label='Delete account' size={"sm"} onClick={onOpen} icon={<DeleteIcon />} />

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Sure you want to delete account?
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <p>All your synced emails and folders will be deleted.</p>
                            <p>This is an irreversable action. Please make sure you have a backup before proceeding.</p>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Form method="delete" action={`/accounts/edit/${data.accountId}`}>
                                <Button type="submit" colorScheme='red' ml={3} name="formName" value="deleteAccount">
                                    Delete
                                </Button>
                            </Form>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}
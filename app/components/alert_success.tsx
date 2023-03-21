import { Alert, AlertIcon } from "@chakra-ui/react";

interface AlertSuccessProps {
    flashMessage?: string;
}

export default function AlertSuccess(props: AlertSuccessProps) {
    if (props.flashMessage) {
        return (
            <Alert status='success' borderRadius={{ base: 'none', sm: 'xl' }}>
                <AlertIcon />
                { props.flashMessage }
            </Alert>
        );
    }
    return null;
}
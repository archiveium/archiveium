import { Alert, AlertIcon } from "@chakra-ui/react";

interface AlertErrorProps {
    formError?: string;
    fieldErrors?: any;
}

export default function AlertError(props: AlertErrorProps) {
    if (props.formError) {
        return (
            <Alert status='error' borderRadius={{ base: 'none', sm: 'xl' }}>
                <AlertIcon />
                { props.formError }
            </Alert>
        );
    }
    return null;
}
import { DefaultProvider } from "./defaultProvider";
import { ZohoProvider } from "./zohoProvider";

export function providerFactory(name: string): DefaultProvider {
    const lowerCaseName = name.toLowerCase();
    switch (lowerCaseName) {
    case 'zoho (free)':
        return new ZohoProvider();
    }

    return new DefaultProvider();
}
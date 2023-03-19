import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { ChakraProvider } from "@chakra-ui/react";

function Document({
  children,
  title = "Archiveium",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Archiveium",
  viewport: "width=device-width, initial-scale=1",
});

export default function App() {
  return (
    <Document>
      <ChakraProvider>
        <Outlet />
      </ChakraProvider>
    </Document>
  );
}

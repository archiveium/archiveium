import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import tabler from '@tabler/core/dist/css/tabler.min.css';

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Archiveium",
  viewport: "width=device-width, initial-scale=1",
});

export function links() {
  return [
    {
      rel: "stylesheet",
      href: tabler,
    },
  ];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="theme-light">
        <div className="page">
          <div className="page-wrapper">
            <Outlet />
            <ScrollRestoration />
          </div>
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}

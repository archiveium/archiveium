import { createCookie, createFileSessionStorage } from "@remix-run/node";
import config from 'config';
import type { SessionConfig } from "./types/config";

const sessionConfig = config.get<SessionConfig>('session');

const sessionCookie = createCookie('__session', {
  secrets: sessionConfig.secrets,
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  createFileSessionStorage({
    dir: 'sessions',
    cookie: sessionCookie,
  });

export { getSession, commitSession, destroySession };
import { createCookie, createFileSessionStorage, redirect } from "@remix-run/node";
import config from 'config';
import type { SessionConfig } from "../types/config";

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

const createUserSession =  async function(userId: number, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export { getSession, commitSession, destroySession, createUserSession };
import { createCookie, createFileSessionStorage, redirect } from "@remix-run/node";
import config from 'config';
import type { SessionConfig } from "../types/config";

const sessionConfig = config.get<SessionConfig>('session');

function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

const sessionCookie = createCookie('__session', {
  secrets: sessionConfig.secrets,
  sameSite: true,
});

const { getSession, commitSession, destroySession } =
  // TODO Save sessions in redis, blocker https://github.com/remix-run/remix/pull/5949
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

const getUserId = async function(request: Request): Promise<string | undefined> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return undefined;
  return userId;
}

const requireUserId = async function(request: Request, redirectTo: string = new URL(request.url).pathname): Promise<string> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    throw redirect(redirectTo);
  }
  return userId;
}

export { getSession, commitSession, destroySession, createUserSession, getUserId, requireUserId };
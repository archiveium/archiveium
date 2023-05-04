import type { Session } from "@remix-run/node";
import { createCookie, createFileSessionStorage, redirect } from "@remix-run/node";
import config from 'config';
import type { SessionConfig } from "../types/config";

const sessionConfig = config.get<SessionConfig>('session');

function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

function getMaxAge(): number {
  return 21600; // 6 hours
}

const sessionCookie = createCookie('__session', {
  secrets: sessionConfig.secrets,
  sameSite: true,
  maxAge: getMaxAge(),
  secure: process.env.NODE_ENV === 'production',
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
      "Set-Cookie": await commitAppSession(session),
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

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

const commitAppSession = async function (session: Session): Promise<string> {
  return commitSession(session);
}

export { getSession, commitAppSession, destroySession, createUserSession, getUserId, requireUserId };
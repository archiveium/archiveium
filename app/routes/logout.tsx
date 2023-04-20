import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/utils/session";

export const loader = async () => redirect("/login");

export const action = async ({ request }: ActionArgs) => {
    return logout(request);
}
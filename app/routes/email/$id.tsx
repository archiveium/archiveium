import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId, getSession, commitAppSession } from "~/utils/session";
import { GetEmailWithS3DataByIdAndUserId } from "~/controllers/email.server";
import parse from 'html-react-parser';

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request, '/login');
    const session = await getSession(
        request.headers.get("Cookie")
    );

    if (params.id) {
        const emailData = await GetEmailWithS3DataByIdAndUserId(userId, params.id);
        return json({
            emailData: {
                html: emailData.html
            }
        });
    } else {
        session.flash('globalMessage', 'Invalid email');
    }

    return redirect('/dashboard', {
        headers: {
            'Set-Cookie': await commitAppSession(session),
        }
    });
};

export default function GetEmail() {
    const { emailData } = useLoaderData<typeof loader>();
    return (
        parse(emailData.html)
    );
}
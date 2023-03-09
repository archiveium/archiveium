import LogoSmall from "~/components/logo_small";
import { Link, Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { VerifyRegistrationUrl } from "~/controllers/register.server";
import { commitSession, getSession } from "~/sessions";
import { getUserById, resetUserNotificationDate, verifyUser } from "~/models/users";

export const loader = async ({ params, request }: LoaderArgs) => {
    const session = await getSession(
        request.headers.get('Cookie')
    );
    const url = new URL(request.url);
    const verificationUrl = await VerifyRegistrationUrl({
        id: params.id,
        hash: params.hash,
        expires: url.searchParams.get('expires') ?? '',
        signature: url.searchParams.get('signature') ?? '',
    });

    const user = await getUserById(verificationUrl.userId);
    if (user.email_verified_at) {
        session.flash('globalMessage', 'Email has already been verified. You can now login.');
        return redirect('/login', {
            headers: {
                'Set-Cookie': await commitSession(session),
            }        
        });
    }

    if (!verificationUrl.hasExpired && verificationUrl.signatureValid) {
        await verifyUser(verificationUrl.userId);
        session.flash('globalMessage', 'Email verified successfully! You can now login.');
        return redirect('/login', {
            headers: {
                'Set-Cookie': await commitSession(session),
            }        
        });
    } else if (!verificationUrl.signatureValid) {
        session.flash('globalMessage', 'Invalid verification url. Please try again.');
        return redirect('/login', {
            headers: {
                'Set-Cookie': await commitSession(session),
            }
        });
    } else {
        // TODO Set globalErrorMessage and globalSuccessMessage to show them differently
        // maybe create a separate function to handle setting and getting flash messages
        session.flash('globalMessage', 'Verification url has expired. Please try again.');
    }

    return json(
        { flashMessage: session.get('globalMessage') || null },
        {
            headers: {
              'Set-Cookie': await commitSession(session),
            },
        }
    );
  };

export const action = async ({ params, request }: ActionArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const url = new URL(request.url);
    const verificationUrl = await VerifyRegistrationUrl({
        id: params.id,
        hash: params.hash,
        expires: url.searchParams.get('expires') ?? '',
        signature: url.searchParams.get('signature') ?? '',
    });
    const user = await getUserById(verificationUrl.userId);

    if (user.email_verified_at) {
        session.flash('globalMessage', 'Email has already been verified. You can now login.');
    } else if (verificationUrl.hasExpired && verificationUrl.signatureValid) {
        await resetUserNotificationDate(verificationUrl.userId);
        session.flash('globalMessage', 'Verification email has been sent.');
    }

    return redirect('/login', {
        headers: {
            'Set-Cookie': await commitSession(session),
        }
    });
};

export default function VerifyEmail() {
    const { flashMessage } = useLoaderData<typeof loader>();
    return (
        <div className="page page-center">
            <div className="container-tight py-4">
                <div className="text-center mb-4">
                    <LogoSmall />
                </div>

                { flashMessage ? (
                    <div className="alert alert-danger" role="alert">
                        <div className="text-muted">{ flashMessage }</div>
                    </div>
                ) : null }

                <Form className="card card-md" method="post">
                    {/* @csrf */}
                    {/* <x-honeypot wire:model="extraFields" /> */}

                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Thank you for signing up!</h2>
                        <p>Unfortunately your email verification url has expired. Use the button below to resend email.</p>
                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary w-100">Resend Verification Email</button>
                        </div>
                    </div>
                </Form>
                <div className="text-center text-muted mt-3">
                    Already have account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
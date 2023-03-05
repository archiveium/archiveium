import LogoSmall from "~/components/logo_small";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { commitSession, getSession } from "~/sessions";
import { RegisterUser } from "~/controllers/auth.server";
import { ZodError } from "zod";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );    
    const body = await request.formData();
    const formData = Object.fromEntries(body);
    try {
        await RegisterUser(formData);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return badRequest({
                fieldErrors: error.flatten().fieldErrors,
                formError: null,
            });
        }

        return badRequest({
            fieldErrors: null,
            formError: (error.code && (error.code == 23505)) ? 'Email is already registered.' : 'There was an error registering your account. Please try again.',
        });
    }

    session.flash('globalMessage', 'An email has been sent to your email address. Please verify before logging in.');
    return redirect('/login', {
        headers: {
            'Set-Cookie': await commitSession(session),
        }        
    });
};

export async function loader({ request }: LoaderArgs) {
    const session = await getSession(
        request.headers.get('Cookie')
    );

    return json(
        { flashMessage: session.get('globalMessage') || null },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        }
    );
}

export default function Register() {
    const { flashMessage } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <div className="page page-center">
            <div className="container-tight py-4">
                <div className="text-center mb-4">
                    <LogoSmall />
                </div>

                { flashMessage ? (
                    <div className="alert alert-danger" role="alert">
                        <div className="text-muted">{flashMessage}</div>
                    </div>
                ) : null }

                { actionData?.formError ? (
                    <div className="alert alert-danger" role="alert">
                        <div className="text-muted">{ actionData.formError }</div>
                    </div>
                ) : null }

                <Form className="card card-md" method="post">
                    {/* // @csrf */}
                    {/* // <x-honeypot wire:model="extraFields" /> */}

                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Register new account</h2>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" className={actionData?.fieldErrors?.name ? 'form-control is-invalid' : 'form-control'} placeholder="Enter your name" />
                            {actionData?.fieldErrors?.name ? (
                                <div className="invalid-feedback">{actionData.fieldErrors.name[0]}</div>
                            ) : null}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email address</label>
                            <input type="email" name="email" className={actionData?.fieldErrors?.email ? 'form-control is-invalid' : 'form-control'} placeholder="Enter your email address" />
                            {actionData?.fieldErrors?.email ? (
                                <div className="invalid-feedback">{actionData.fieldErrors.email[0]}</div>
                            ) : null}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <div className="form-group mb-3">
                                <input type="password" name="password" className={actionData?.fieldErrors?.password ? 'form-control is-invalid' : 'form-control'} autoComplete="off" placeholder="Your password" />
                                {actionData?.fieldErrors?.password ? (
                                    <div className="invalid-feedback">{actionData.fieldErrors.password[0]}</div>
                                ) : null}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <div className="form-group mb-3">
                                <input type="password" name="passwordConfirm" className={actionData?.fieldErrors?.passwordConfirm ? 'form-control is-invalid' : 'form-control'} autoComplete="off" placeholder="Re-enter your password" />
                                {actionData?.fieldErrors?.passwordConfirm ? (
                                    <div className="invalid-feedback">{actionData.fieldErrors.passwordConfirm[0]}</div>
                                ) : null}
                            </div>
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary w-100">Register</button>
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
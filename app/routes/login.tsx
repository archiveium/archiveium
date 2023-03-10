import LogoSmall from "~/components/logo_small";
import { Form, Link, useActionData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/node";
import { createUserSession } from "~/utils/session";
import { LoginUser } from "~/controllers/auth.server";
import { badRequest } from "~/utils/request";

export const action = async ({ request }: ActionArgs) => {
    const body = await request.formData();
    const credentials = Object.fromEntries(body);

    try {
        const user = await LoginUser(credentials);
        return createUserSession(user.id, '/dashboard');
    } catch (error) {
        // TODO Log error
    }

    return badRequest({
        formError: 'Invalid credentials. Please check email and password.',
    });
};

export default function Login() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="page page-center">
            <div className="container-tight py-4">
                <div className="text-center mb-4">
                    <LogoSmall />
                </div>

                { actionData?.formError ? (
                    <div className="alert alert-danger" role="alert">
                        <div className="text-muted">{ actionData.formError }</div>
                    </div>
                ) : null }

                <Form className="card card-md" autoComplete="off" method="post">
                    {/* @csrf */}
                    {/* <x-honeypot wire:model="extraFields" /> */}

                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Login</h2>
                        <div className="mb-3">
                            <label className="form-label">Email address</label>
                            <input type="email" name="email" className="form-control" placeholder="Enter email" />
                        </div>
                        <div className="mb-2">
                            <label className="form-label">
                                Password
                                {/* <span className="form-label-description">
                                    <a href="">I forgot password</a>
                                </span> */}
                            </label>
                            <div className="mb-3">
                                <input type="password" name="password" className="form-control" placeholder="Password" autoComplete="off" />
                            </div>
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary w-100">Sign in</button>
                        </div>
                    </div>
                </Form>
                <div className="text-center text-muted mt-3">
                    Don't have account yet? Enroll in <Link to="/preview">closed preview</Link>
                </div>
            </div>
        </div>
    );
}
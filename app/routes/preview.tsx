import LogoSmall from "~/components/logo_small";
import { Link, useActionData, Form } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { ActionArgs , LoaderArgs} from "@remix-run/node";
import { RegisterForPreview } from "~/controllers/register.server";
import { badRequest } from "~/utils/request";
import { ZodError } from "zod";
import { commitSession, getSession, getUserId } from "../utils/session";

export async function loader({ request }: LoaderArgs) {
    // TODO This needs to be in a middleware, whenever Remix implements that concept
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }
    return null;
}

// TODO Handle only POST requests
export const action = async ({ request }: ActionArgs) => {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const body = await request.formData();
    const formData = Object.fromEntries(body);
    try {
        await RegisterForPreview(formData);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return badRequest({
                fieldErrors: error.flatten().fieldErrors,
                formError: null,
            });
        }

        return badRequest({
            fieldErrors: null,
            formError: (error.code && (error.code == 23505)) ? 'Email is already registered/enrolled.' : 'There was an error enrolling your account. Please try again.',
        });
    }

    session.flash('globalMessage', 'Thank you for showing interest. Keep an eye on your mailbox!');
    return redirect('/login', {
        headers: {
            'Set-Cookie': await commitSession(session),
        }        
    });
};

export default function Preview() {
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

                <Form className="card card-md" method="post">
                    {/* @csrf */}
                    {/* <x-honeypot wire:model="extraFields" /> */}

                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Closed Preview Enrollment</h2>
                        <p className="card-subtitle">
                            After you have submitted email address, an email will be sent once we are ready to register your account.
                        </p>
                        <div className="mb-3">
                            <label className="form-label">Email address</label>
                            <input type="email" name="email" className={actionData?.fieldErrors?.email ? 'form-control is-invalid' : 'form-control'} placeholder="Enter your email address" required />
                            {actionData?.fieldErrors?.email ? (
                                <div className="invalid-feedback">{actionData.fieldErrors.email[0]}</div>
                            ) : null}
                        </div>
                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary w-100">Enroll Me</button>
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
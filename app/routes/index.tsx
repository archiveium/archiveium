import { redirect } from "@remix-run/node";

export async function loader() {
  // TODO Redirect to dashboard if user is already logged in
  return redirect('/login');
}

export default function Index() {
  return ('');
}

import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import "./main.css";

function SignIn() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

  async function handleSubmit(event, action) {
        event.preventDefault();
        const form = event.currentTarget.tagName === 'FORM'
            ? event.currentTarget
            : event.currentTarget.form;        const isCreateAccount = action === '/createAcct';
        if (isCreateAccount && !name.trim()) {
            setMessage('Enter your full name to create an account.');
            return;
        }        if (!form.reportValidity()) return;

        setBusy(true);
        setMessage('');

        try {
            const response = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const result = await response.json().catch(() => ({}));
            if (response.ok) {
                setMessage(result.message || 'Check your email for a sign-in link.');
            } else {
                setMessage(result.message || 'Could not sign in. Please try again.');
            }
        } catch {
            setMessage('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
    }
  }

  return (
    <>
    <div className="container text-center mt-4">
        <div className="box p-4">
            <h1 className="raleway-bold">Welcome to Webware Project</h1>
            <p className="raleway-font">
            Sign In or Create Account
            </p>
        </div>
        </div>
        
        <main role="main">
        <div className="container mt-4">
            <div className="box2 p-4">

            <form id="signin_form" onSubmit={(event) => handleSubmit(event, '/login')}>
                <fieldset>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label raleway-font">Full Name:</label>
                    <input type="text" id="name" name="name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label raleway-font">Email *:</label>
                    <input type="email" id="email" name="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label raleway-font">Password *:</label>
                    <input type="password" id="password" name="password" className="form-control" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
                <div className="d-flex justify-content-center align-items-center gap-3">
                    <button type="submit" id="signin_button" className="btn btn-purple" disabled={busy}>Sign In</button>
                    <button type="button" id="create_button" className="btn btn-purple" onClick={(event) => handleSubmit(event, '/createAcct')} disabled={busy}>Create Account</button>
                </div>
                </fieldset>
            </form>
            <div className="mt-3" role="status" aria-live="polite">{message}</div>
            <hr />
            </div>
        </div>
        </main>
    </>

  );
}

export default SignIn;

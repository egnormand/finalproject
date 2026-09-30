import { useState } from "react";
import reactLogo from "./assets/react.svg";
import 'bootstrap/dist/css/bootstrap.min.css'
import "./main.css";

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event, action) {
    event.preventDefault()
    const response = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password }) 
    })
    if (response.ok) { 
        console.log("lets go");
        //onSignIn();
    } else { 
        console.log("didn't work");
        //onSignInFailed();
    }
  }

  return (
    <>
    <div className="container text-center mt-4">
        <div className="box p-4">
            <h1>Welcome to Webware Project</h1>
            <p>
            Sign In or Create Account
            </p>
        </div>
        </div>
        
        <main role="main">
        <div className="container mt-4">
            <div className="box2 p-4">

            <form id="signin_form">
                <fieldset>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username *:</label>
                    <input type="text" id="username" name="username" className="form-control" value={username} onChange={(event) => setUsername(event.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password *:</label>
                    <input type="text" id="password" name="password" className="form-control" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
                <div className="d-flex justify-content-center align-items-center gap-3">
                    <button type="button" id="signin_button" className="btn btn-purple" onClick={(event) => handleSubmit(event, '/login')}>Sign In</button>
                    <button type="button" id="create_button" className="btn btn-purple" onClick={(event) => handleSubmit(event, '/createAcct')}>Create Account</button>
                </div>
                </fieldset>
            </form>
            </div>
        </div>
        </main>
    </>

  );
}

export default SignIn;

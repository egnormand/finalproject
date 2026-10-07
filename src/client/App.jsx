import { useEffect, useState } from "react";
import Forum from "./Forum.jsx";
import SignIn from "./SignIn.jsx";
import AccountPage from "./AccountPage.jsx";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeView, setActiveView] = useState("forum");

  useEffect(() => {
    let active = true;
    fetch("/session")
      .then((response) => response.json())
      .then((session) => {
        if (active) setUserEmail(session.email);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSessionChecked(true);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) setUserEmail(null);
  }

  if (!sessionChecked) {
    return <main className="container mt-4" role="status">Checking sign-in...</main>;
  }

  if (!userEmail) return <SignIn />;

  return (
    <>
      <header className="container-fluid d-flex justify-content-end align-items-center gap-3 border-bottom bg-white py-2">
        <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setActiveView("forum")}
        >
          Forums
        </button>

        <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setActiveView("accountpage")}
        >
          Account Page
        </button>
        <span>{userEmail}</span>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleSignOut}>
          Sign Out
        </button>
      </header>
      <main>
        {activeView === "forum" ? (
            <Forum />
        ) : activeView === "accountpage" ? (
            <AccountPage />
        ) : (
            <SignIn />
        )}
      </main>
    </>
  );
}

export default App;
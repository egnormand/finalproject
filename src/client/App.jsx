import { useEffect, useState } from "react";
import Forum from "./Forum.jsx";
import SignIn from "./SignIn.jsx";
import AccountPage from "./AccountPage.jsx";


function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [acctInfo, setAcctInfo] = useState(null);
  const [selectedForumId, setSelectedForumId] = useState(null);

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


  async function handleAcctInfo() {
    setAcctInfo(true);
  }


  if (!sessionChecked) {
    return <main className="container mt-4" role="status">Checking sign-in...</main>;
  }


  if (!userEmail) return <SignIn />;


  if (acctInfo) {
    return (
        <AccountPage
            directBack={() => setAcctInfo(false)}
            viewForum={(forumId) => {
                setSelectedForumId(forumId);
                setAcctInfo(false);
            }}
        />
    );
  }

  return (
    <>
      <header className="container-fluid d-flex justify-content-end align-items-center gap-3 border-bottom bg-white py-2">
        <span>{userEmail}</span>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleAcctInfo}>
          Account Info
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleSignOut}>
          Sign Out
        </button>
      </header>
      <Forum initialForumId={selectedForumId}/>
    </>
  );
}


export default App;

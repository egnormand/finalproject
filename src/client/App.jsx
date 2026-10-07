import { useState } from "react";
//CHANGED FOR DEBUGGING, CHANGE BACK DURING MERGE
import Forum from "./Forum.jsx";
import SignIn from "./SignIn.jsx";
import AccountPage from "./AccountPage.jsx";

function App() {
  //CHANGED FOR DEBUGGING, CHANGE TO THE SIGNIN PAGE WHEN MERGING
  const [activeView, setActiveView] = useState("forum");

  return (
    <>
      <header className="container-fluid border-bottom bg-white">
        <nav className="nav nav-tabs" aria-label="Main navigation">
          <button
            type="button"
            className={`nav-link ${activeView === "forum" ? "active" : ""}`}
            aria-current={activeView === "forum" ? "page" : undefined}
            onClick={() => setActiveView("forum")}
          >
            Forums
          </button>
          <button
            type="button"
            className={`nav-link ${activeView === "signin" ? "active" : ""}`}
            aria-current={activeView === "signin" ? "page" : undefined}
            onClick={() => setActiveView("signin")}
          >
            Sign In
          </button>
                    <button
            type="button"
            className={`nav-link ${activeView === "accountpage" ? "active" : ""}`}
            aria-current={activeView === "accountpage" ? "page" : undefined}
            onClick={() => setActiveView("accountpage")}
          >
            Account Page
          </button>
        </nav>
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

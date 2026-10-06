import { useState } from "react";
import Forum from "./Forum.jsx";
import SignIn from "./SignIn.jsx";

function App() {
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
        </nav>
      </header>
      <main>{activeView === "forum" ? <Forum /> : <SignIn />}</main>
    </>
  );
}

export default App;

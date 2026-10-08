import { useEffect, useState } from "react";
import "./AccountPage.css";
import "./Forum.css";

const fakeFollowingForums = [
    { id: "fake-general", name: "General Discussion" },
    { id: "fake-announcements", name: "Announcements" },
    { id: "fake-homework", name: "Homework Help" },
];

export default function AccountPage({ directBack, viewForum }) {
    const [forumId, setForumId] = useState(null);
    const [name, setName] = useState("Loading...");
    const [fullName, setFullName] = useState("Loading...");
    const [FName, setFName] = useState("Loading...");
    const [LName, setLName] = useState("Loading...");
    const [email, setEmail] = useState("Loading...");
    const [joinedForums, setJoinedForums] = useState([]);
    const [forums, setForums] = useState([]);
    const [password, setPassword] = useState("Loading...");
    const [userId, setUserId] = useState(null);
    const [followingForums, setFollowingForums] = useState(fakeFollowingForums);
    const [userError, setUserError] = useState("");
    const [editFN, setEditFN] = useState("");
    const [editLN, setEditLN] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPass, setEditPass] = useState("");
    const [editFNPopup, setEditFNPopup] = useState(null);
    const [editLNPopup, setEditLNPopup] = useState(null);
    const [editEmailPopup, setEditEmailPopup] = useState(null);
    const [editPassPopup, setEditPassPopup] = useState(null);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const response = await fetch("/current-user");
                if (!response.ok) {
                    throw new Error("Unable to load the current user.");
                }

                const user = await response.json();
                setUserId(user._id);
                const name = user.name.split(" ");
                setFName(name[0]);
                setLName(name[1]);
                setEmail(user.email);
                setPassword(user.passwordHash);
                setJoinedForums(user.joinedForums);
            } catch (error) {
                setUserError(error.message);
                setName("Unavailable");
                setEmail("Unavailable");
                setPassword("Unavailable");
                setJoinedForums("Unavailable");
            }
        }

        async function loadForums() {
            try {
                const response = await fetch("/api/forums");

                if (!response.ok) {
                    throw new Error("Unable to load the forums.");
                }

                const forumData = await response.json();

                setForums(forumData);
            } catch (error) {
                console.error("Error loading forums:", error);
            }
        }

        loadCurrentUser();
        loadForums();
    }, []);

    const handleForumLeave = async forumId => {
        try {
            const response = await fetch(`/api/forums/${forumId}/members`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ joined: false }),
            });

            if (!response.ok) {
                throw new Error("Could not leave forum.");
            }
            setJoinedForums(current => current.filter(id => id !== forumId));
        } catch (error) {
            console.error("Error leaving forum:", error);
            alert("Could not leave forum.");
        }
    };

    const handleLeave = async () => {
        directBack();
    };
    const handleUpdate = async (event, field) => {
        event.preventDefault();
        let value;
        let dbField = "";
        if (field === "FName") {
            value = `${editFN} ${LName}`;
            dbField = "name";
        } else if (field === "LName") {
            value = `${FName} ${editLN}`;
            dbField = "name";
        } else if (field === "email") {
            value = editEmail;
            dbField = "email";
        } else if (field === "password") {
            value = editPass;
            dbField = "password";
        }
        const response = await fetch("/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                _id: userId,
                field: dbField,
                value: value,
            }),
        });

        console.log("userId being sent:", userId);
        console.log("field:", dbField);
        console.log("value:", value);

        if (response.ok) {
            if (field === "FName") {
                setFName(editFN);
                setFullName(`${editFN} ${LName}`);
                setEditFNPopup(null);
            } else if (field === "LName") {
                setLName(editLN);
                setFullName(`${FName} ${editLN}`);
                setEditLNPopup(null);
            } else if (field === "email") {
                setEmail(editEmail);
                setEditEmailPopup(null);
            } else if (field === "password") {
                setEditPassPopup(null);
            }
        } else {
            console.log("Update Failed.");
        }
    };

    const editFNForm = function () {
        setEditFNPopup(true);
        setEditFN(FName);
    };
    const editLNForm = function () {
        setEditLNPopup(true);
        setEditLN(LName);
    };
    const editEmailForm = function () {
        setEditEmailPopup(true);
        setEditEmail(email);
    };
    const editPassForm = function () {
        setEditPassPopup(true);
        setEditPass(password);
    };

    const closeForm = () => {
        setEditFNPopup(null);
        setEditLNPopup(null);
        setEditEmailPopup(null);
        setEditPassPopup(null);
    };

    return (
        <>
            <header className="site-header">
                <button
                    className="btn"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#forumSidebar"
                    aria-expanded="true"
                    aria-controls="forumSidebar"
                    aria-label="Toggle forum sidebar"
                >
                    ☰
                </button>
                <span className="site-name">WPI Forums</span>
            </header>
            <div className="account-page">
                <div id="forumSidebar" className="collapse collapse-horizontal show">
                    <aside className="forum-sidebar">
                        <h1>Forums</h1>
                        <nav className="forum-nav">
                            {forums
                                .filter(forum => joinedForums.includes(forum.id))
                                .map(forum => (
                                    <button
                                        key={forum.id}
                                        className={
                                            forum.id === forumId ? "forum-button selected btn" : "forum-button btn"
                                        }
                                        onClick={() => viewForum(forum.id)}
                                    >
                                        {forum.name}
                                    </button>
                                ))}
                        </nav>
                        <h1>Return to Main Page</h1>
                        <nav className="return-nav">
                            <button type="submit" className="forum-action-button" onClick={handleLeave}>
                                Return
                            </button>
                        </nav>
                    </aside>
                </div>
                <div className="main">
                    <img src="/images/wpi2.png" alt="" className="forum-banner" />
                    <div className="forum-heading">
                        <h2>Account Info</h2>
                    </div>
                    <hr className="posts-divider" />
                    <div className="info">
                        <div className="info-box">
                            <h2>User Info</h2>
                            <div className="row">
                                <p>First Name:</p>
                                <p>{FName}</p>
                                <button type="submit" className="forum-action-button" onClick={() => editFNForm()}>
                                    Change First Name
                                </button>
                            </div>
                            <div className="row">
                                <p>Last Name:</p>
                                <p>{LName}</p>
                                <button type="submit" className="forum-action-button" onClick={() => editLNForm()}>
                                    Change Last Name
                                </button>
                            </div>
                            <div className="row">
                                <p>Email:</p>
                                <p>{email}</p>
                                <button
                                    className="forum-action-button"
                                    style={{ width: "152px" }}
                                    onClick={() => editEmailForm()}
                                >
                                    Change Email
                                </button>
                            </div>
                            {/* <div className="row">
                                <p>Password:</p>
                                <p aria-label="Password hidden">********</p>
                                <button className="forum-action-button" onClick={() => editPassForm()}>Change Password</button>
                            </div> */}
                        </div>
                        <div className="info-box">
                            <h2>Following Count: {joinedForums.length}</h2>
                            <ul>
                                {joinedForums.map((forumId, index) => {
                                    const forum = forums.find(forum => forum.id === forumId);

                                    return (
                                        <div key={forumId ?? index} className="row2">
                                            <li>{forum ? forum.name : "Forum not found"}</li>

                                            <button
                                                className="forum-action-button"
                                                onClick={() => forum && viewForum(forum.id)}
                                            >
                                                View
                                            </button>

                                            <button
                                                className="forum-action-button"
                                                onClick={() => handleForumLeave(forumId)}
                                            >
                                                Leave
                                            </button>
                                        </div>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {editFNPopup && (
                <div className="box2 editFormDiv">
                    <form id="editForm" className="form-container" onSubmit={event => handleUpdate(event, "FName")}>
                        <fieldset>
                            <legend>Insert New First Name</legend>
                            <div className="mb-3">
                                <label htmlFor="Name" className="form-label">
                                    New First Name *:
                                </label>
                                <input
                                    type="text"
                                    id="newName"
                                    name="newName"
                                    className="form-control"
                                    value={editFN}
                                    onChange={event => setEditFN(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="button-container">
                                <p className="button">
                                    <button type="submit" className="forum-action-button" id="save_update">
                                        Update
                                    </button>
                                </p>
                                <p className="button-container">
                                    <button type="button" className="forum-action-button" onClick={closeForm}>
                                        Close
                                    </button>
                                </p>
                            </div>
                        </fieldset>
                    </form>
                </div>
            )}

            {editLNPopup && (
                <div className="box2 editFormDiv">
                    <form id="editForm" className="form-container" onSubmit={event => handleUpdate(event, "LName")}>
                        <fieldset>
                            <legend>Insert New Last Name</legend>
                            <div className="mb-3">
                                <label htmlFor="Name" className="form-label">
                                    New Last Name *:
                                </label>
                                <input
                                    type="text"
                                    id="newName"
                                    name="newName"
                                    className="form-control"
                                    value={editLN}
                                    onChange={event => setEditLN(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="button-container">
                                <p className="button">
                                    <button type="submit" className="forum-action-button" id="save_update">
                                        Update
                                    </button>
                                </p>
                                <p className="button-container">
                                    <button type="button" className="forum-action-button" onClick={closeForm}>
                                        Close
                                    </button>
                                </p>
                            </div>
                        </fieldset>
                    </form>
                </div>
            )}

            {editEmailPopup && (
                <div className="box2 editFormDiv">
                    <form id="editForm" className="form-container" onSubmit={event => handleUpdate(event, "email")}>
                        <fieldset>
                            <legend>Insert New Email</legend>
                            <div className="mb-3">
                                <label htmlFor="Name" className="form-label">
                                    New Email *:
                                </label>
                                <input
                                    type="text"
                                    id="newName"
                                    name="newName"
                                    className="form-control"
                                    value={editEmail}
                                    onChange={event => setEditEmail(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="button-container">
                                <p className="button">
                                    <button type="submit" className="forum-action-button" id="save_update">
                                        Update
                                    </button>
                                </p>
                                <p className="button-container">
                                    <button type="button" className="forum-action-button" onClick={closeForm}>
                                        Close
                                    </button>
                                </p>
                            </div>
                        </fieldset>
                    </form>
                </div>
            )}

            {editPassPopup && (
                <div className="box2 editFormDiv">
                    <form id="editForm" className="form-container" onSubmit={event => handleUpdate(event, "password")}>
                        <fieldset>
                            <legend>Insert New Password</legend>
                            <div className="mb-3">
                                <label htmlFor="Name" className="form-label">
                                    New Password *:
                                </label>
                                <input
                                    type="text"
                                    id="newName"
                                    name="newName"
                                    className="form-control"
                                    value={editPass}
                                    onChange={event => setEditPass(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Name" className="form-label">
                                    Confirm New Password *:
                                </label>
                                <input
                                    type="text"
                                    id="newName"
                                    name="newName"
                                    className="form-control"
                                    value={editPass}
                                    onChange={event => setEditPass(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="button-container">
                                <p className="button">
                                    <button type="submit" className="forum-action-button" id="save_update">
                                        Update
                                    </button>
                                </p>
                                <p className="button-container">
                                    <button type="button" className="forum-action-button" onClick={closeForm}>
                                        Close
                                    </button>
                                </p>
                            </div>
                        </fieldset>
                    </form>
                </div>
            )}
        </>
    );
}

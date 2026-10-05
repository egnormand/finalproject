import { useEffect, useState } from 'react';
import "./AccountPage.css"

const fakeFollowingForums = [
    { id: "fake-general", name: "General Discussion" },
    { id: "fake-announcements", name: "Announcements" },
    { id: "fake-homework", name: "Homework Help" },
];

export default function AccountDisplay() {
    const [forums] = useState([
        { id: 1, name: "General Discussion" },
        { id: 2, name: "Announcements" },
        { id: 3, name: "Homework Help" },
        { id: 4, name: "Off-Topic Chat" },
    ]);
    const [forumId, setForumId] = useState(null);
    const [username, setUsername] = useState("Loading...");
    const [email, setEmail] = useState("Loading...");
    const [followingForums, setFollowingForums] = useState(fakeFollowingForums);
    const [userError, setUserError] = useState("");

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const response = await fetch("/current-user");
                if (!response.ok) {
                    throw new Error("Unable to load the current user.");
                }

                const user = await response.json();
                setUsername(user.name);
                setEmail(user.email);
                setFollowingForums(user.forums.length > 0 ? user.forums : fakeFollowingForums);
            } catch (error) {
                setUserError(error.message);
                setUsername("Unavailable");
                setEmail("Unavailable");
                setFollowingForums(fakeFollowingForums);
            }
        }

        loadCurrentUser();
    }, []);

    return (
        <div className="account-page">
            <div className="account-sidebar">
                <h1>Forums</h1>
                {/*creates the button for each forum*/}
                {forums.map(forum => (
                    <button key={forum.id} className={forum.id === forumId ? "forum-button selected" : "forum-button"} onClick={() => setForumId(forum.id)}>
                        {forum.name}
                    </button>
                ))}
                <div class="special-button">
                    <button>Account Info</button>
                </div>
            </div>

            <div className="main">
                <h1>Account Info</h1>
                <h2>User Info</h2>
                    <div className="row">
                        <p>Username:</p>
                        <p>{username}</p>
                        <button className="forum-action-button">Edit?</button>
                    </div>
                <div className="row">
                    <p>Email:</p>
                    <p>{email}</p>
                    <button className="forum-action-button">Edit?</button>
                </div>
                <div className="row">
                    <p>Password:</p>
                    <p aria-label="Password hidden">********</p>
                    <button className="forum-action-button">Edit?</button>
                </div>
                {userError && <p role="alert">{userError}</p>}

                <h2>Following</h2>
                <h3>Total: {followingForums.length}</h3>
                <ul>
                    {followingForums.map((forum, index) => (
                        <div className="row2">
                        <li key={forum.id ?? forum._id ?? index}>
                            {typeof forum === "string" ? forum : forum.name ?? forum.forumName}
                        </li>
                        <button className="forum-action-button">View</button>
                        <button className="forum-action-button">Leave</button>
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    )
}
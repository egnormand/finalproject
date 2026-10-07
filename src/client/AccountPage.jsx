import { useEffect, useState } from 'react';
import "./AccountPage.css"
import "./Forum.css"

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
    const [name, setName] = useState("Loading...");
    const [email, setEmail] = useState("Loading...");
    const [password, setPassword] = useState("Loading...");
    const [userId, setUserId] = useState(null);
    const [followingForums, setFollowingForums] = useState(fakeFollowingForums);
    const [userError, setUserError] = useState("");
    const [editUser, setEditUser] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPass, setEditPass] = useState('');
    const [editUserPopup, setEditUserPopup] = useState(null);
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
                setName(user.name);
                setEmail(user.email);
                setPassword(user.passwordHash);
                setFollowingForums(user.forums.length > 0 ? user.forums : fakeFollowingForums);
            } catch (error) {
                setUserError(error.message);
                setName("Unavailable");
                setEmail("Unavailable");
                setPassword("Unavailable");
                setFollowingForums(fakeFollowingForums);
            }
        }

        loadCurrentUser();
    }, []);


    const handleUpdate = async (event, field) => {
      event.preventDefault();
      let value;
      if (field === "name"){
        value = editUser;
      } else if (field === "email"){
        value = editEmail;
      } else if (field === "password"){
        value = editPass;
      }
      const response = await fetch("/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
            body: JSON.stringify({
                _id: userId,
                field: field,
                value: value
            })
        });
        if (response.ok) {
            if (field === "name"){
                setName(editUser);
                setEditUserPopup(null);
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

    const editUserForm = function(){
        setEditUserPopup(true);
        setEditUser(name);
    }
    const editEmailForm = function(){
        setEditEmailPopup(true);
        setEditEmail(email);
    }
    const editPassForm = function(){
        setEditPassPopup(true);
        setEditPass(password);
    }

    const closeForm = () => {
        setEditUserPopup(null);
        setEditEmailPopup(null);
        setEditPassPopup(null);
    }



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
                            {/*creates the button for each forum*/}
                            {forums.map(forum => (
                                <button
                                    key={forum.id}
                                    className={forum.id === forumId ? "forum-button selected btn" : "forum-button btn"}
                                    onClick={() => setForumId(forum.id)}
                                >
                                    {forum.name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                </div>
            <div className="main">
                <img
                    src="/public/images/images1.jpg"
                    alt=""
                    className="forum-banner"
                />
                <div className='forum-heading'>
                   <h2>Account Info</h2>
                </div>
                <hr className="posts-divider" />
                <div className = "info">
                    <div className="info-box">
                        <h2>User Info</h2>
                            <div className="row">
                                <p>First Name:</p>
                                <p>{name}</p>
                                <button type="submit" className="forum-action-button" onClick={() => editUserForm()}>Change First Name</button>
                            </div>
                            <div className="row">
                                <p>Last Name:</p>
                                <p>{name}</p>
                                <button type="submit" className="forum-action-button" onClick={() => editUserForm()}>Change Last Name</button>
                            </div>
                            <div className="row">
                                <p>Email:</p>
                                <p>{email}</p>
                                <button className="forum-action-button" onClick={() => editEmailForm()}>Change Email</button>
                            </div>
                            <div className="row">
                                <p>Password:</p>
                                <p aria-label="Password hidden">********</p>
                                <button className="forum-action-button" onClick={() => editPassForm()}>Change Password</button>
                            </div>
                        </div>
                    <div className="info-box">
                        <h2>Following Count: {followingForums.length}</h2>
                        <ul>
                            {followingForums.map((forum, index) => (
                                <div key={forum.id ?? forum._id ?? index} className="row2">
                                <li>
                                    {typeof forum === "string" ? forum : forum.name ?? forum.forumName}
                                </li>
                                <button className="forum-action-button">View</button>
                                <button className="forum-action-button">Leave</button>
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {editUserPopup && (
            <div className="box2 editFormDiv">
                <form id="editForm" className="form-container" onSubmit={(event) => handleUpdate(event, "name")}>
                <fieldset>
                    <legend>Insert New Name</legend>
                    <div className="mb-3">
                    <label htmlFor="Name" className="form-label">New Name *:</label>
                    <input type="text" id="newName" name="newName" className="form-control" value={editUser} onChange={(event) => setEditUser(event.target.value)} required/>
                    </div>
                    <div className="button-container">
                        <p className="button">
                            <button type="submit" className="forum-action-button" id="save_update">Update</button>
                        </p>
                        <p className="button-container">
                            <button type="button" className="forum-action-button" onClick={closeForm}>Close</button>
                        </p>
                    </div>
                </fieldset>
                </form>
            </div>
            )}


            {editEmailPopup && (
            <div className="box2 editFormDiv">
                <form id="editForm" className="form-container" onSubmit={(event) => handleUpdate(event, "email")}>
                <fieldset>
                    <legend>Insert New Email</legend>
                    <div className="mb-3">
                    <label htmlFor="Name" className="form-label">New Email *:</label>
                    <input type="text" id="newName" name="newName" className="form-control" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} required/>
                    </div>
                    <div className="button-container">
                        <p className="button">
                            <button type="submit" className="forum-action-button" id="save_update">Update</button>
                        </p>
                        <p className="button-container">
                            <button type="button" className="forum-action-button" onClick={closeForm}>Close</button>
                        </p>
                    </div>
                </fieldset>
                </form>
            </div>
            )}


            {editPassPopup && (
            <div className="box2 editFormDiv">
                <form id="editForm" className="form-container" onSubmit={(event) => handleUpdate(event, "password")}>
                <fieldset>
                    <legend>Insert New Password</legend>
                    <div className="mb-3">
                    <label htmlFor="Name" className="form-label">New Password *:</label>
                    <input type="text" id="newName" name="newName" className="form-control" value={editPass} onChange={(event) => setEditPass(event.target.value)} required/>
                    </div>
                    <div className="mb-3">
                    <label htmlFor="Name" className="form-label">Confirm New Password *:</label>
                    <input type="text" id="newName" name="newName" className="form-control" value={editPass} onChange={(event) => setEditPass(event.target.value)} required/>
                    </div>
                    <div className="button-container">
                        <p className="button">
                            <button type="submit" className="forum-action-button" id="save_update">Update</button>
                        </p>
                        <p className="button-container">
                            <button type="button" className="forum-action-button" onClick={closeForm}>Close</button>
                        </p>
                    </div>
                </fieldset>
                </form>
            </div>
            )}
        </>
    )
}
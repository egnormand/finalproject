import { useEffect, useState } from "react";

import Markdown from "react-markdown";
import PostEditor from "./PostEditor";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Forum.css";

export default function Forum() {
    const [forums, setForums] = useState([]);
    const [forumId, setForumId] = useState("");
    const [posts, setPosts] = useState([]);
    //used to tell the page to load new posts
    const [refresh, setRefresh] = useState(0);
    const [forumName, setForumName] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const [forumExplorer, setForumExplorer] = useState(false);
    const [membershipStatus, setMembershipStatus] = useState(false);

    useEffect(() => {
        fetch("/api/forums")
            .then(response => response.json())
            .then(data => {
                setForums(data);
                setForumId(data[0]?.id || "");            });
    }, []);
    //load posts
    useEffect(() => {
        setPosts([]);

        //make sure forum is selected
        if (!forumId) return;
        let active = true;
        //get rid of previous posts when the page loads
        fetch(`/api/posts?forumId=${forumId}`)
            .then(response => response.json())
            .then(data => {
                if (active && Array.isArray(data)) {
                    setPosts(data);
                }
            });
        //this will prevent an old request from replacing new posts if at same time
        return () => {
            active = false;
        };
    }, [forumId, refresh]);

    //when a user submits this makes the post
    async function createPost(title, body) {
        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ forumId, title, body }),
            });
            if (!response.ok) {
                const data = await response.json();
                alert(data.message || "Could not create post.");
                return false;
            }
            setRefresh(current => current + 1);
            setShowEditor(false);
            //lets the form be cleared
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    //Create forum function
    async function createForum(event) {
        event.preventDefault();
        try {
            const response = await fetch(`/api/forums/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: forumName }),
            });
            const forum = await response.json();
            if (!response.ok) {
                alert(forum.message || "Could not create forum.");
                return;
            }
            setForums(current => [...current, forum]);
            setForumId(forum.id);
            setForumName("");
            setForumExplorer(false);
            setShowEditor(false);
        } catch (error) {
            console.log(error);
            alert("Could not create forum.");
        }
    }
    async function changeMembershipStatus(forum, joined) {
        if (membershipStatus) return;

        if (joined && !window.confirm(`Join ${forum.name}?`)) {
            return;
        }

        setMembershipStatus(true);

        try {
            const response = await fetch(`/api/forums/${forum.id}/members`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joined })
            });

            const data = await response.json();
            setForums(current =>
                current.map(item =>
                    item.id === forum.id
                        ? { ...item, joined }
                        : item
                )
            );
            setShowEditor(false);
            setForumExplorer(false);
            setForumId(joined ? forum.id : "");
        } catch {
            alert("Could not change membership status.");
        } finally {
            setMembershipStatus(false);
        }
    }
    const selectedForum = forums.find(forum => forum.id === forumId);
    const visibleForums = forums.filter(forum =>
        forumExplorer ? !forum.joined : forum.joined
    );
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
            <div className="forum-page">
                <div id="forumSidebar" className="collapse collapse-horizontal show">
                    <aside className="forum-sidebar">
                        <h1>{forumExplorer ? "Explore" : "Forums"}</h1>

                        <nav className="forum-nav">
                            {visibleForums.map(forum => (
                                <button
                                    key={forum.id}
                                    type="button"
                                    disabled={membershipStatus}
                                    className={
                                        forum.id === forumId
                                            ? "forum-button selected btn"
                                            : "forum-button btn"
                                    }
                                    onClick={() => {
                                        if (forumExplorer) {
                                            changeMembershipStatus(forum, true);
                                        } else {
                                            setShowEditor(false);
                                            setForumId(forum.id);
                                        }
                                    }}
                                >
                                    {forum.name}
                                </button>
                            ))}

                            {visibleForums.length === 0 && (
                                <p>
                                    {forumExplorer
                                        ? "No more forums to join."
                                        : "Explore forums to join one."}
                                </p>
                            )}
                        </nav>
                        <form className="new-forum card" onSubmit={createForum}>
                            <div className="card-body">
                                <label htmlFor="forum-name">New Forum</label>
                            <input
                                id="forum-name"
                                value={forumName}
                                onChange={event => setForumName(event.target.value)}
                                required
                            />
                            <button type="submit" className="btn">Add Forum</button>
                            </div>
                            
                        </form>
                        <button
                        type="button"
                        className="btn"
                        disabled={membershipStatus}
                        onClick={() => {
                            setForumExplorer(!forumExplorer);
                            setShowEditor(false);
                            setForumId("");
                        }}
                    >
                        {forumExplorer ? "Back to My Forums" : "Explore Forums"}
                    </button>

                    </aside>
                </div>
                <main className="forum-content">
                    <img
                        src="/public/images/images1.jpg"
                        alt=""
                        className="forum-banner"
                        />
                    <div className="forum-heading">
                        <h2>w/{selectedForum?.name}</h2>
                        {/* new post button and functionality */}
                        {forumId && (
                            <>
                            <div className="forum-actions">
                                <button type="button" className="btn" onClick={() => setShowEditor(true)}>
                                    New Post
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    disabled={membershipStatus}
                                    onClick={() => changeMembershipStatus(selectedForum, false)}
                                >
                                    Leave
                                </button>
                                <PostEditor
                                    key={forumId}
                                    show={showEditor}
                                    onClose={() => setShowEditor(false)}
                                    onPublish={createPost}
                                />
                                </div>
                            </>
                        )}
                    </div>
                        <hr className="posts-divider" />

                    {/*creates one "article" per post */}

                    <div className="post-feed">
                        {posts.map(post => (
                            <article className="card post-card mb-3" key={post._id}>
                                <div className="card-body">
                                    <h3>{post.title}</h3>
                                    <p className="post-author">{post.authorName ||post.author }</p>
                                    <div>
                                        {/*Show markdown and no html */}
                                        <Markdown skipHtml>{post.body}</Markdown>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}

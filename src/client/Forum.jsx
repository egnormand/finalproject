import {useEffect, useState} from 'react';

import Markdown from 'react-markdown';
import PostEditor from './PostEditor';
import "./Forum.css"

export default function Forum() {
    const [forums, setForums] = useState([]);
    const [forumId, setForumId] = useState("");
    const [posts, setPosts] = useState([]);
    //used to tell the page to load new posts
    const [refresh, setRefresh] = useState(0);
    const [forumName, setForumName] = useState("");

    useEffect(() => {
        fetch("/api/forums")
            .then(response => response.json())
            .then(data=>{setForums(data);setForumId(data[0]?.id || "");
            });
    }, []);
    //load posts
    useEffect(() => {
        //make sure forum is selected
        if (!forumId) return;
        let active = true;
        //get rid of previous posts when the page loads
        setPosts([]);
        fetch(`/api/posts?forumId=${(forumId)}`).then(response => response.json())
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
    async function createPost(title, body){

       try {
           const response = await fetch("/api/posts", {
               method: "POST",
               headers: {"Content-Type": "application/json"},
               body: JSON.stringify({forumId, title, body})
           });
           if (!response.ok) {
               const data = await response.json();
               alert(data.message || "Could not create post.");
               return false;
           }
           setRefresh(current => current + 1);
           //lets the form be cleared
           return true;
       } catch (error) {
           console.log(error);
           return false;
       }
    }

    //Create forum function
    async function createForum(event){
        event.preventDefault();
        try {
            const response = await fetch(`/api/forums/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: forumName})
            });
            const forum = await response.json();
            if(!response.ok) {
                alert(forum.message || "Could not create forum.");
                return;
            }
            setForums(current => [...current, forum]);
            setForumId(forum.id);
            setForumName("");
        } catch (error) {
            console.log(error);
            alert("Could not create forum.");
        }
    }
    const selectedForum = forums.find(forum => forum.id === forumId);
    return (
        <div className="forum-page">
            <aside className="forum-sidebar">
                <h1>Forums</h1>
                <nav className="forum-nav">
                    {/*creates the button for each forum*/}
                    {forums.map(forum => (
                        <button key={forum.id} className = {forum.id === forumId
                        ? "forum-button selected" : "forum-button"}
                        onClick={() => setForumId(forum.id)}>
                            {forum.name}
                        </button>
                    ))}
                </nav>
                <form className = "new-forum" onSubmit={createForum}>
                    <label htmlFor = "forum-name">New Forum</label>
                    <input
                        id="forum-name"
                        value={forumName}
                        onChange={event => setForumName(event.target.value)}
                        required
                        />
                    <button type="submit">Add Forum</button>
                </form>
            </aside>
            <main className="forum-content">
                <h2>{selectedForum?.name}</h2>
                {forumId && (
                    <PostEditor key = {forumId} onPublish={createPost} />
                )}
                <h2>Posts</h2>
                {/*creates one "article" per post */}
                {posts.map(post => (
                    <article className="forum-post" key={post._id}>
                        <h3>{post.title}</h3>
                        <p className="post-author">{post.author}</p>
                        <div>
                            {/*Show markdown and no html */}
                            <Markdown skipHtml>{post.body}</Markdown>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    )

}
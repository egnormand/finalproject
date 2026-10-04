import {useEffect, useState} from 'react';

import Markdown from 'react-markdown';
import PostEditor from './PostEditor';

async function request(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
}

export default function Forum() {
    const [forums, setForums] = useState([]);
    const [forumId, setForumId] = useState("");
    const [posts, setPosts] = useState([]);
    //used to tell the page to load new posts
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let active = true;

        request("/api/forums").then(data => {
            if(!active) return;
            setForums(data);
            //selects default forum
            setForumId(data[0]?.id || "");
        });
        return () => {
            active = false;
        };
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
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({forumId, title, body})
        });
        setRefresh(current => current + 1);
        //lets the form be cleared
        return true;
    }
    const selectedForum = forums.find(forum => forum.id === forumId);
    return (
        <div className="Forum">
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
            </aside>
            <main className="forum-content">
                <h2>{selectedForum?.name}</h2>
                {forumId && (
                    <PostEditor key = {forumId} onPublish={createPost} />
                )}
                <h2>Posts</h2>
                {/*creates one "article" per post */}
                {posts.map(post => (
                    <article className="post" key={post._id}>
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
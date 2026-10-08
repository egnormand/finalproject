import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Comments.css";

export default function Comments({ postId, comments = [], onAdded }) {
    const [body, setBody] = useState("");
    const [error, setError] = useState("");
    async function addComment(event) {
        event.preventDefault();

        const text = body.trim();
        if (!text) return;
        setError("");
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: text }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not save comment.");
            }
            onAdded(data);
            setBody("");
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="post-comment-section">
            <button
                type="button"
                className="comment-toggle"
                data-bs-toggle="collapse"
                data-bs-target={`#comments-${postId}`}
                aria-expanded="false"
                aria-controls={`comments-${postId}`}
            >
                <i className="bi bi-chat" aria-hidden="true"></i>
                <span>Comments ({comments.length})</span>
            </button>

            <div className="collapse" id={`comments-${postId}`}>
                <div className="pt-3">
                    {comments.length === 0 && <p>No comments yet.</p>}

                    {comments.map(comment => (
                        <div className="border-bottom py-2" key={comment._id}>
                            <strong>{comment.authorName || "User"}</strong>
                            <p
                                className="mb-1"
                                style={{
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {comment.body}
                            </p>
                        </div>
                    ))}

                    <form onSubmit={addComment} className="mt-3">
                        <textarea
                            className="form-control"
                            placeholder="Write a comment..."
                            aria-label="Write a comment"
                            rows={2}
                            value={body}
                            onChange={event => setBody(event.target.value)}
                            required
                        />
                        {error && (
                            <p className="text-danger mt-2" role="alert">
                                {error}
                            </p>
                        )}
                        <button type="submit" className="btn btn-outline-danger mt-2" disabled={!body.trim()}>
                            Post Comment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

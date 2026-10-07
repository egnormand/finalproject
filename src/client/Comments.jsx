import {useState} from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Comments.css";

export default function Comments({postId}) {
    const [comments, setComments] = useState([]);
    const [body, setBody] = useState("");

    function addComment(event) {
        event.preventDefault();

        const text = body.trim();
        if (!text) return;

        setComments(current => [
            ...current,
            {
                id: crypto.randomUUID(),
                body: text
            }
        ]);

        setBody("");
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

            <div
                className="collapse"
                id={`comments-${postId}`}
            >
                <div className="pt-3">
                    {comments.length === 0 && (
                        <p>No comments yet.</p>
                    )}

                    {comments.map(comment => (
                        <div
                            className="border-bottom py-2"
                            key={comment.id}
                        >
                            <strong>You</strong>
                            <p
                                className="mb-1"
                                style={{
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "anywhere"
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
                            onChange={event =>
                                setBody(event.target.value)
                            }
                            required
                        />

                        <button
                            type="submit"
                            className="btn btn-outline-danger mt-2"
                            disabled={!body.trim()}
                        >
                            Post Comment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
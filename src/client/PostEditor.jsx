import {useEffect, useRef, useState} from "react";
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {
    schema,
    defaultMarkdownSerializer,
} from "prosemirror-markdown"
import {exampleSetup} from "prosemirror-example-setup";

import "prosemirror-view/style/prosemirror.css"
import "prosemirror-menu/style/menu.css"
import"prosemirror-example-setup/style/style.css"

//sends to server
export default function PostEditor({onPublish}) {
    const [title, setTitle] = useState("");

    const editorReference = useRef(null);

    useEffect(() => {
        let state = EditorState.create({
            schema,
            //using example setup from prose mirror docs for now. we could add more features later
            plugins: exampleSetup({
                schema,
                floatingMenu: false
            })
        });
        //makes editor display in the html below
        let view = new EditorView(document.getElementById("post-box"),{state} );
        editorReference.current = view;
        return () => {
            view.destroy();
            editorReference.current = null;
        };
    }, []);

    async function handleSubmit(e){
        e.preventDefault();
        const view = editorReference.current;
        //convert to markdown
        const body = defaultMarkdownSerializer.serialize(
            view.state.doc
        );
        //save post
        const saved = await onPublish(title, body);
        //clear the form (the editor box) once it is successfully psoted
        if (saved && !view.isDestroyed) {
            setTitle("");
            view.updateState(
                EditorState.create({
                    schema, plugins: view.state.plugins
                })
            );
        }
    }
    return (
        <div className={"post-editor"}>
            <h3>Create a post</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title" >Title</label>
                <input id = "title"
                       value={title}
                       onChange={e => setTitle(e.target.value)}
                       required
                       />
                <div id = "post-box" />
                    <button type = "submit" className = "Publish">
                        Publish
                    </button>
            </form>
        </div>
    );
}
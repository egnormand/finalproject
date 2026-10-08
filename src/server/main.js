import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import {randomBytes} from "node:crypto";
import {MongoClient, ObjectId} from "mongodb";
import cookie from "cookie-session";
import {configureAuthentication} from "./auth.js";


dotenv.config();
const app = express();


const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie({
    name: "session",
    keys: [sessionSecret],
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
}));


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASS}@${process.env.HOST}/?appName=WebwareCluster`;
const client = new MongoClient(uri);


let signinCollection = null;
let loginChallenges = null;


await client.connect();
const database = client.db("WebwareDatabase");
signinCollection = database.collection("UserInfo");
loginChallenges = database.collection("LoginChallenges");
const forumPostsCollection = database.collection("Posts");
await loginChallenges.createIndex({expiresAt: 1}, {expireAfterSeconds: 0});
const forumsCollection = database.collection("Forums");


configureAuthentication(app, {
    signinCollection,
    loginChallenges,
    appBaseUrl,
    sessionSecret,
});


app.use((req, res, next) => {
    if (signinCollection && loginChallenges) return next();
    return res.status(503).send("Authentication storage is unavailable.");
});


function requireAuth(req, res, next) {
  if (req.session?.login && req.session.user) return next();
  return res.status(401).json({ message: "Sign in to view forums." });
}


await forumsCollection.createIndex({id: 1}, {unique: true});


/*
const forums = [
  { id: "webware", name: "Webware" },
  { id: "test", name: "Test" },
];
*/


//ACCTINFO STUFF
app.get("/current-user", async (req, res) => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }




  const user = await signinCollection.findOne(
    { email: req.session.user },
    { projection: { _id: 1, name: 1, email: 1, passwordHash: 1, joinedForums: 1 } }
  );




  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }




  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    joinedForums: Array.isArray(user.joinedForums) ? user.joinedForums : [],
  });
});




app.use( (req,res,next) => {
  if( signinCollection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})




app.post('/update', async (req, res) => {
    try {
        const { _id, field, value } = req.body;

        const result = await signinCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { [field]: value } }
        );

        console.log("Update result:", result);

        res.json(result);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/acctPageForums", async (req, res) => {
    try {
        const user = req.session?.user
            ? await signinCollection.findOne({ email: req.session.user })
            : null;

        const joinedForums = user?.joinedForums || [];

        const forums = await forumsCollection
            .find({ id: { $in: joinedForums } })
            .sort({ name: 1 })
            .toArray();

        res.json(forums.map(forum => ({
            id: forum.id,
            name: forum.name
        })));

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Could not load forums" });
    }
});


































//gets forums that a user is in
app.get("/api/forums", async (req, res) => {
    try {
        const user = req.session?.user ? await signinCollection.findOne({email: req.session.user}) : null;
        const joinedForums = user?.joinedForums || [];
        const forums = await forumsCollection.find({}).sort({name: 1}).toArray();
        res.json(forums.map(forum => ({
            id: forum.id,
            name: forum.name,
            joined: joinedForums.includes(forum.id)
        })));
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Could not load forums"})
    }
})


//user join/leave forum logic
app.put("/api/forums/:id/members", async (req, res) => {


    if (!req.session.user) {
        return res.status(401).json({message: "You are not logged in!"});
    }
    const {joined} = req.body;
    try {
        const forum = await forumsCollection.findOne({
            id: req.params.id
        });
        if (!forum) {
            return res.status(401).json({message: "No forum found"});
        }
        let update;
        if (joined) {
            update = {
                $addToSet: {joinedForums: forum.id}
            }
        } else {
            update = {
                $pull: {joinedForums: forum.id}
            }
        }
        ;
        const result = await signinCollection.updateOne({email: req.session.user}, update)




        res.json({joined});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Could not load forums"})
    }
});
//create a new forum
app.post("/api/forums", async (req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({
            message: "Sign in to create a forum."
        });
    }
    const {name} = req.body;
    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({message: "Enter a forum name."});
    }
    const forum = {
        id: randomBytes(8).toString("hex"),
        name: name.trim()
    };
    try {
        await forumsCollection.insertOne(forum);
        await signinCollection.updateOne(
            {email: req.session.user},
            {$addToSet: {joinedForums: forum.id}}
        )
        res.status(201).json({
            id: forum.id,
            name: forum.name,
            joined: true
        });
    } catch (error) {
        console.error("Could not load forums:", error);
        return res.status(500).json({message: "Could not load forum."});
    }
})


app.get("/api/posts", async (req, res) => {
    const forumId = req.query.forumId;
    res.set("Cache-Control", "no-store");

    try {
        const user = req.session?.login && req.session.user ?
            await signinCollection.findOne(
                {email:req.session.user},
                {projection: {pinnedPosts: 1}}
            )
            : null;
        const pinnedPosts = new Set(user?.pinnedPosts || []);
        const posts = await forumPostsCollection.find({forumId}).sort({createdAt: -1, _id: -1}).toArray();

        return res.json(posts.map(post => ({
            ...post,
            comments: post.comments || [],
            pinned: pinnedPosts.has(post._id.toString())
        })));
    } catch (error) {
        console.error("Could not load forum posts:", error.message);
        return res.status(500).json({message: "Could not load forum posts."});
    }
});


app.post("/api/posts", async (req, res) => {
    const {forumId, title, body} = req.body ?? {};


    if (typeof title !== "string" || !title.trim() || typeof body !== "string" || !body.trim()) {
        return res.status(400).json({message: "Enter a title and post body."});
    }


    const post = {
        forumId,
        title: title.trim(),
        body: body.trim(),
        author: req.session?.user || "Author",
        createdAt: new Date(),
    };


    try {
        if (typeof forumId !== "string" || !(await forumsCollection.findOne({id: forumId}))) {
            return res.status(400).json({message: "Choose a valid forum."});
        }
        const user = req.session?.user ? await signinCollection.findOne({email: req.session.user}) : null;
        post.authorName = user?.name || "Author";
        const result = await forumPostsCollection.insertOne(post);
        return res.status(201).json({_id: result.insertedId, ...post});
    } catch (error) {
        console.error("Could not create forum post:", error.message);
        return res.status(500).json({message: "Could not create forum post."});
    }
});

// Saving and removing pin functionality for users
app.patch("/api/posts/:id/pin", requireAuth, async (req, res) => {
    const {pinned} = req.body ?? {};

    try {
        const post = await forumPostsCollection.findOne(
            {_id: new ObjectId(req.params.id)},
            {projection: {_id: 1}}
        );
        
        //Store IDs as strings
        const postId = post._id.toString();
        const update = pinned
            ? {$addToSet: {pinnedPosts: postId}}
            : {$pull: {pinnedPosts: postId}};
        const result = await signinCollection.updateOne(
            {email: req.session.user},
            update
        );
        return res.json({pinned});
    } catch (error){
        console.error(error);

        return res.status(500).json({
            message: "Could not save pin."
        });
    }


})


app.post("/api/posts/:id/comments", requireAuth, async (req, res) => {
    const {body} = req.body ?? {};

    try {
        const user = await signinCollection.findOne(
            {email: req.session.user},
            {projection: {name: 1}}
        );

        if (!user) {
            return res.status(401).json({
                message: "Account not found. Please sign in again."
            });
        }

        const comment = {
            _id: new ObjectId(),
            body: body.trim(),
            authorName: user.name || "User"
        }

        const result = await forumPostsCollection.updateOne(
            {_id: new ObjectId(req.params.id)},
            {$push: {comments: comment}}
        )
        return res.status(201).json(comment); 
       } catch (error) {
            console.log(error);

            return res.status(500).json({
                message: "Could not save comment."
            })
       }

}) 
app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(401).json({message: "Not a post"});
    }
    try {
        const result = await forumPostsCollection.deleteOne({_id: new ObjectId(req.params.id),  author: req.session.user});
        if (result.deletedCount === 0) {
            return res.status(401).json({message: "Not your post"});
        }
        return res.status(200).json({message: "Post deleted"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Could not delete post."});
    }
})



const port = Number(process.env.PORT || 3000);
ViteExpress.listen(app, port, () => console.log(`Server is listening on port ${port}...`));

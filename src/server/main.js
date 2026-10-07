import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import {createHash, randomBytes} from "node:crypto";
import {MongoClient} from "mongodb";
import cookie from "cookie-session";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();

const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

const mailTransport = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    : null;

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

app.use((req, res, next) => {
    if (signinCollection && loginChallenges) return next();
    return res.status(503).send("Authentication storage is unavailable.");
});

function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

async function sendEmailChallenge(user) {
    if (!mailTransport) {
        const error = new Error("Email verification is not configured. Contact the administrator.");
        error.statusCode = 503;
        throw error;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const verificationUrl = new URL("/auth/email/verify", appBaseUrl);
    verificationUrl.searchParams.set("token", rawToken);

    await loginChallenges.deleteMany({email: user.email});
    await loginChallenges.insertOne({email: user.email, tokenHash, expiresAt});

    try {
        await mailTransport.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: "Your Webware sign-in link",
            text: `Use this link to finish signing in. It expires in one hour:\n\n${verificationUrl}`,
        });
    } catch (error) {
        await loginChallenges.deleteOne({tokenHash});
        throw error;
    }
}

app.get("/auth/email/verify", async (req, res) => {
    if (typeof req.query.token !== "string" || !/^[a-f0-9]{64}$/i.test(req.query.token)) {
        return res.status(400).send("This sign-in link is invalid or expired.");
    }

    const challenge = await loginChallenges.findOneAndDelete({
        tokenHash: hashToken(req.query.token),
        expiresAt: {$gt: new Date()},
    });
    if (!challenge) return res.status(400).send("This sign-in link is invalid or expired.");

    req.session.login = true;
    req.session.user = challenge.email;
    return res.send("Email verified. You are signed in and can close this tab.");
});

await forumsCollection.createIndex({id: 1}, {unique: true});

/*
const forums = [
  { id: "webware", name: "Webware" },
  { id: "test", name: "Test" },
];
*/


//gets forums that a user is in
app.get("/api/forums", async (req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({
            message: "Sign in to create a forum."
        });
    }
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
    try {
        const posts = await forumPostsCollection.find({forumId}).sort({createdAt: -1, _id: -1}).toArray();
        return res.json(posts);
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

app.post("/createAcct", async (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!name || !email || password.length < 8) {
        return res.status(400).json({message: "Enter your name, a valid email, and a password with at least 8 characters."});
    }

    try {
        if (await signinCollection.findOne({email})) {
            return res.status(409).json({message: "An account already exists for that email."});
        }

        const user = {
            name,
            email,
            passwordHash: await bcrypt.hash(password, 12),
            createdAt: new Date(),
        };
        const result = await signinCollection.insertOne(user);
        user._id = result.insertedId;
        await sendEmailChallenge(user);
        return res.status(202).json({message: "Check your email for a sign-in link. It expires in one hour."});
    } catch (error) {
        console.error("Account creation failed:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : "Could not create the account. Please try again.",
        });
    }
});

app.post("/login", async (req, res) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    try {
        const user = await signinCollection.findOne({email});
        const passwordMatches = user?.passwordHash
            ? await bcrypt.compare(password, user.passwordHash)
            : Boolean(user?.password && user.password === password);
        if (!passwordMatches) {
            return res.status(401).json({message: "Email or password is incorrect."});
        }

        if (!user.passwordHash) {
            const passwordHash = await bcrypt.hash(password, 12);
            await signinCollection.updateOne(
                {_id: user._id},
                {$set: {passwordHash}, $unset: {password: ""}},
            );
        }

        await sendEmailChallenge(user);
        return res.status(202).json({message: "Check your email for a sign-in link. It expires in one hour."});
    } catch (error) {
        console.error("Password sign-in failed:", error.message);
        return res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : "Could not sign in. Please try again.",
        });
    }
});


ViteExpress.listen(app, 3000, () => console.log("Server is listening on port 3000..."));

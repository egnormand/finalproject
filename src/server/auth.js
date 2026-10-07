import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export function configureAuthentication(app, {
    signinCollection,
    loginChallenges,
    appBaseUrl,
    sessionSecret,
}) {
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

        await loginChallenges.deleteMany({ email: user.email });
        await loginChallenges.insertOne({ email: user.email, tokenHash, expiresAt });

        try {
            await mailTransport.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: user.email,
                subject: "Your Webware sign-in link",
                text: `Use this link to finish signing in. It expires in one hour:\n\n${verificationUrl}`,
            });
        } catch (error) {
            await loginChallenges.deleteOne({ tokenHash });
            throw error;
        }
    }

    app.get("/session", (req, res) => {
        if (req.session?.login && req.session.user) {
            return res.json({ email: req.session.user });
        }
        return res.json({ email: null });
    });

    app.get("/auth/email/verify", async (req, res) => {
        if (typeof req.query.token !== "string" || !/^[a-f0-9]{64}$/i.test(req.query.token)) {
            return res.status(400).send("This sign-in link is invalid or expired.");
        }

        const challenge = await loginChallenges.findOneAndDelete({
            tokenHash: hashToken(req.query.token),
            expiresAt: { $gt: new Date() },
        });
        if (!challenge) return res.status(400).send("This sign-in link is invalid or expired.");

        req.session.login = true;
        req.session.user = challenge.email;
        return res.send("Email verified. You are signed in and can close this tab.");
    });

    app.post("/createAcct", async (req, res) => {
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";
        if (!name || !email || password.length < 8) {
            return res.status(400).json({
                message: "Enter your name, a valid email, and a password with at least 8 characters.",
            });
        }

        try {
            if (await signinCollection.findOne({ email })) {
                return res.status(409).json({ message: "An account already exists for that email." });
            }

            const user = {
                name,
                email,
                passwordHash: await bcrypt.hash(password, 12),
                createdAt: new Date(),
                joinedForums: []
            };
            const result = await signinCollection.insertOne(user);
            user._id = result.insertedId;
            await sendEmailChallenge(user);
            return res.status(202).json({
                message: "Check your email for a sign-in link. It expires in one hour.",
            });
        } catch (error) {
            console.error("Account creation failed:", error.message);
            return res.status(error.statusCode || 500).json({
                message: error.statusCode
                    ? error.message
                    : "Could not create the account. Please try again.",
            });
        }
    });

    app.post("/login", async (req, res) => {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";

        try {
            const user = await signinCollection.findOne({ email });
            const passwordMatches = user?.passwordHash
                ? await bcrypt.compare(password, user.passwordHash)
                : Boolean(user?.password && user.password === password);
            if (!passwordMatches) {
                return res.status(401).json({ message: "Email or password is incorrect." });
            }

            if (!user.passwordHash) {
                const passwordHash = await bcrypt.hash(password, 12);
                await signinCollection.updateOne(
                    { _id: user._id },
                    { $set: { passwordHash }, $unset: { password: "" } },
                );
            }

            await sendEmailChallenge(user);
            return res.status(202).json({
                message: "Check your email for a sign-in link. It expires in one hour.",
            });
        } catch (error) {
            console.error("Password sign-in failed:", error.message);
            return res.status(error.statusCode || 500).json({
                message: error.statusCode
                    ? error.message
                    : "Could not sign in. Please try again.",
            });
        }
    });

    app.post("/logout", (req, res) => {
        req.session = null;
        return res.sendStatus(204);
    });

    return { mailTransport, sessionSecret };
}

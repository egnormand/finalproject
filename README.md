# WPI Forums

WPI Forums is a student-focused web application for creating and joining discussion forums, publishing posts, and discussing posts with comments. The app uses React in the browser, an Express server for its API and authentication, MongoDB Atlas for persistence, and email sign-in links for verified sessions.

This repository is a course-project prototype. The setup and deployment steps below describe the current code; the security notes at the end identify work that should be completed before using it with real users or sensitive information.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Run and build](#run-and-build)
- [How sign-in works](#how-sign-in-works)
- [Application structure](#application-structure)
- [Data storage](#data-storage)
- [HTTP API](#http-api)
- [Deployment on Render](#deployment-on-render)
- [Troubleshooting](#troubleshooting)
- [Current limitations and security](#current-limitations-and-security)
- [Project status](#project-status)

## Features

- Create an account with a name, email address, and password.
- Sign in using an email and password, then complete sign-in using a time-limited email link.
- Automatically establish a session and open the forum interface after a valid verification link is opened.
- Browse forums, create a forum, join it, and leave a forum.
- Publish forum posts using the rich-text editor; post content is stored as Markdown.
- Comment on posts, pin posts to a personal list, and delete posts authored by the signed-in user.
- View account details and access account profile controls.
- Sign out and clear the browser session.

The intended audience is students, but the current implementation does not restrict registration to a particular school's email domain.

## Technology

- Node.js with ECMAScript modules
- React 19 and Vite 6
- Express 5 and `vite-express`
- MongoDB Atlas and the official MongoDB Node.js driver
- `cookie-session` for browser sessions
- `bcryptjs` for password hashing
- Nodemailer for SMTP email delivery
- Bootstrap and Bootstrap Icons
- ProseMirror packages for the post editor

## Requirements

- Node.js 20 or newer; the project has been built with Node.js 24.
- npm, included with Node.js.
- A MongoDB Atlas cluster and a database user with read/write access.
- An SMTP account that can send the sign-in verification emails.
- Git, if cloning the repository.

## Local setup

1. Clone the repository and enter the project directory:

   ```sh
   git clone https://github.com/egnormand/finalproject.git
   cd finalproject
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the project root using the [Environment variables](#environment-variables) template below. The `.env` file is ignored by Git; do not commit credentials or secrets.

4. Configure the MongoDB Atlas network access list to allow connections from your development machine. Use the Atlas database username and password, not your Atlas website login.

5. Start the development server:

   ```sh
   npm run dev
   ```

6. Open `http://localhost:3000` in a browser. The server uses port `3000` by default and uses the value of `PORT` when one is provided.

The server connects to Atlas during startup. If the database connection fails, the app will not start successfully. The application creates the required collections as they are first written and creates indexes for expiring sign-in challenges and forum IDs.

## Environment variables

The server loads `.env` from the project root through `dotenv`. Set these values in local `.env` and in the deployment provider's environment-variable settings.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_USER` | Yes | MongoDB Atlas database username. |
| `PASS` | Yes | Password for that MongoDB database user. |
| `HOST` | Yes | Atlas cluster hostname, such as `cluster-name.example.mongodb.net`; do not include a URI scheme. |
| `SESSION_SECRET` | Recommended | Long, random secret used to sign session cookies. If omitted, a new random value is generated on each server start and existing sessions become invalid. |
| `APP_BASE_URL` | Yes for email links | Base URL used to construct verification links, for example `http://localhost:3000` locally or the full `https://` Render service URL in production. Do not append a route or trailing path. |
| `SMTP_HOST` | Yes for email sign-in | SMTP server hostname. |
| `SMTP_PORT` | Yes for email sign-in | SMTP port; defaults to `587` if omitted. Port `465` uses implicit TLS automatically. |
| `SMTP_SECURE` | No | Set to `true` to enable implicit TLS. Normally leave unset for port `587`. |
| `SMTP_USER` | Yes for email sign-in | SMTP account username. |
| `SMTP_PASS` | Yes for email sign-in | SMTP account password or provider-specific app password. |
| `SMTP_FROM` | No | Sender address shown on verification emails. Defaults to `SMTP_USER`. |
| `PORT` | No | HTTP listening port. Defaults to `3000`; Render provides this automatically. |
| `NODE_ENV` | No | Set to `production` in deployment. This enables the secure cookie option. |

Example `.env` template (replace every placeholder; never use these placeholder values as real credentials):

```dotenv
MONGO_USER=your_atlas_database_user
PASS=your_atlas_database_password
HOST=your-cluster.mongodb.net
SESSION_SECRET=replace_with_a_long_random_secret
APP_BASE_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=Webware Forums <no-reply@example.com>
```

The MongoDB connection string is assembled in `src/server/main.js` in the form `mongodb+srv://MONGO_USER:PASS@HOST/`. If the database password contains URI-reserved characters, percent-encode them before placing the password in the connection string.

Email/password account creation and sign-in require all of `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`. Without them, the server returns an email-configuration error when a user tries to sign in. Verification links expire after one hour.

## Run and build

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the development server with Nodemon watching `src/server`. |
| `npm run build` | Creates the optimized client build in `dist/`. |
| `npm start` | Starts the production server. Set `NODE_ENV=production` and run `npm run build` before deployment. |

The `npm start` script uses the Unix-style `NODE_ENV=production` syntax. On Windows PowerShell, start the production server with:

```powershell
npm run build
$env:NODE_ENV = "production"
node src/server/main.js
```

For a local development server on a different port in PowerShell:

```powershell
$env:PORT = "3100"
npm run dev
```

There is currently no automated test script in `package.json`. A successful `npm run build` checks that the client bundle compiles, but it does not test the API, database, email delivery, or browser workflows.

## How sign-in works

1. A user creates an account or submits their existing email and password.
2. The server checks the password and sends a one-time sign-in link by SMTP. Passwords for newly created accounts are hashed with bcrypt.
3. The link contains a random token. Only its SHA-256 hash and expiration time are stored in MongoDB.
4. Opening a valid link consumes its challenge, creates a signed, HTTP-only session cookie, and redirects the browser to `/`.
5. The client checks `/session`. If the session is valid, the forum renders; otherwise the sign-in screen renders.
6. A session lasts up to 24 hours. Production cookies use the `secure` option, so production must be served over HTTPS.

## Application structure

```text
.
|-- index.html                 # Vite HTML entry point
|-- package.json               # Dependencies and npm scripts
|-- proposal.md                # Original course-project proposal
|-- public/images/             # Images served as static assets
|-- src/
|   |-- client/
|   |   |-- App.jsx            # Session-aware application shell
|   |   |-- SignIn.jsx         # Sign-in and account creation forms
|   |   |-- Forum.jsx          # Forum navigation, posts, membership
|   |   |-- PostEditor.jsx     # ProseMirror Markdown editor
|   |   |-- Comments.jsx       # Post comments
|   |   |-- AccountPage.jsx    # Account details and profile controls
|   |   |-- *.css              # Client styles
|   |   `-- main.jsx           # React entry point
|   `-- server/
|       |-- main.js            # Express routes, MongoDB connection, listener
|       `-- auth.js            # Account, email challenge, session routes
`-- vite.config.js             # Vite and React configuration
```

`src/client/models/schemas.js` contains an older Mongoose schema definition. The active server uses the MongoDB Node.js driver and does not import that file; the active document shapes are described below.

## Data storage

The application uses the `WebwareDatabase` database and these MongoDB collections:

| Collection | Purpose | Current document data |
| --- | --- | --- |
| `UserInfo` | User accounts and per-user state. | Name, email, password hash, creation date, joined forum IDs, and pinned post IDs. |
| `LoginChallenges` | One-time email verification challenges. | Email, SHA-256 token hash, and expiration time. An automatic TTL index removes expired challenges. |
| `Forums` | Forum directory. | Unique string ID and forum name. |
| `Posts` | Forum posts and comments. | Forum ID, title, Markdown body, author details, creation date, and comments. |

Forums are not pre-seeded. After signing in, users can create a forum or join an existing one. Comments are embedded in their post documents.

## HTTP API

The React client and Express server are served from the same origin. Requests use browser session cookies automatically.

| Method and path | Purpose |
| --- | --- |
| `GET /session` | Returns the signed-in email or `null`. |
| `POST /createAcct` | Creates an account and emails a sign-in link. |
| `POST /login` | Validates email/password and emails a sign-in link. |
| `GET /auth/email/verify?token=...` | Consumes a valid sign-in challenge, sets the session, and redirects to `/`. |
| `POST /logout` | Clears the current session. |
| `GET /current-user` | Returns the current account details. |
| `POST /update` | Updates a user account field. See the security notes below. |
| `GET /api/forums` | Lists forums and whether the current user has joined each. |
| `GET /api/acctPageForums` | Lists forums joined by the current user. |
| `POST /api/forums` | Creates a forum and joins its creator to it. |
| `PUT /api/forums/:id/members` | Joins or leaves a forum. |
| `GET /api/posts?forumId=...` | Lists posts for a forum. |
| `POST /api/posts` | Creates a post. |
| `PATCH /api/posts/:id/pin` | Pins or unpins a post for the signed-in user. |
| `POST /api/posts/:id/comments` | Adds a comment. |
| `DELETE /api/posts/:id` | Deletes a post authored by the signed-in user. |

## Deployment on Render

Create a Render Web Service connected to this repository and configure:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment:** `NODE_ENV=production`
- **Environment:** `APP_BASE_URL` set to the complete public HTTPS URL of the Render service.
- **Environment:** `MONGO_USER`, `PASS`, `HOST`, `SESSION_SECRET`, and all required `SMTP_*` values from the environment table.

Render supplies `PORT`; the server listens on that value. Add the Render service's outbound access to the MongoDB Atlas network access configuration as required by the Atlas setup. After the service is live, test account creation, email delivery, opening the verification URL, forum creation, posting, commenting, and sign-out using the deployed HTTPS URL.

Keep all credentials in Render's environment settings. Do not add `.env` to the repository, issue tracker, or deployment logs. Changing `APP_BASE_URL` is necessary if the public service URL changes, or emailed links will point to the wrong host.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| Server cannot connect to MongoDB | Check `MONGO_USER`, `PASS`, and `HOST`; verify the database user's permissions and Atlas network access list. |
| Sign-in says email is not configured | Set `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`, then restart the server. |
| Verification email does not arrive | Check the SMTP provider credentials, sender restrictions, spam folder, and server logs. |
| Verification link is invalid or expired | Challenges expire after one hour and are one-time use. Request a new sign-in link. |
| Link opens the app but sign-in does not persist | Verify that the browser accepts cookies, `APP_BASE_URL` matches the service origin, and HTTPS is used when `NODE_ENV=production`. |
| Deployed verification link uses localhost | Set `APP_BASE_URL` to the public Render HTTPS URL and request a new sign-in link. |
| App listens on the wrong port | Use the `PORT` value shown by the host; locally, `PORT` is optional and defaults to `3000`. |

## Current limitations and security

This application is a prototype and should not be treated as production-hardened. In particular, review and fix the following before accepting real users or sensitive data:

- `GET /current-user` currently includes the password hash in its JSON response. Password hashes should never be sent to the browser.
- `POST /update` accepts a database field name from the request and does not verify that the request is authenticated. Restrict allowed fields, require a valid session, and hash password changes server-side.
- `POST /api/posts` does not currently require a valid session, even though the normal client flow is behind sign-in.
- Account profile edits are not consistently validated, and changing an email address does not repeat the email-verification process.
- Add automated tests for authentication, authorization, API validation, and the main browser flows. The current project has no test command.
- There are no direct messages, due-date reminders, or desktop notifications in the current implementation. They were ideas in the original proposal, not completed features.
- The environment may contain old OAuth-related settings, but the current sign-in implementation uses email/password plus SMTP verification links; it does not use Auth0 or Google OAuth.

Use a unique, strong `SESSION_SECRET`, keep MongoDB and SMTP credentials private, and use HTTPS in production. The session cookie is HTTP-only and SameSite=Lax; this alone does not make every API route safe from unauthorized access.

## Project status

The current app includes the core forum and email-link authentication flows described above. The client production bundle has been built successfully with `npm run build`; Vite may warn that the JavaScript bundle exceeds its recommended size. There is no CI workflow or automated test suite configured in this repository.
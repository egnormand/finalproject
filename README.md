# WPI Forums
Nicholas Houghton, Emma Normand, Becca Eiferman, Isaiah Balthazar, Luigi Cardaropoli 

WPI Forums is a student focused web application for creating and joining discussion forums, publishing posts, and discussing posts with comments. The app uses React in the browser, an Express server for its API and authentication, MongoDB Atlas, and email sign-in links for verified sessions.

This repository is a course-project prototype. The setup and deployment steps below describe the current code; the security notes at the end identify work that should be completed before using it with real users or sensitive information.

https://finalproject-ag9e.onrender.com
## Instructions to use

## Features

- Create an account with a name, email address, and password.
- Sign in using an email and password, then complete sign-in using a time-limited email link.
- Reload the original page after clicking the email link in the same browser
- Browse forums, create a forum, join it, and leave a forum.
- Publish forum posts using the rich-text editor; post content is stored as Markdown.
- Comment on posts, pin posts to a personal list, and delete posts authored by the signed-in user.
- View account details and access account profile controls.
- Sign out and clear the browser session.

## How sign-in works

1. A user creates an account or submits their existing email and password.
2. The server checks the password and sends a one-time sign-in link by SMTP. Passwords for newly created accounts are hashed with bcrypt.
3. The link contains a random token. Only its SHA-256 hash and expiration time are stored in MongoDB.
4. Opening a valid link consumes its challenge, creates a signed, HTTP-only session cookie, and redirects the browser to `/`.
5. The client checks `/session`. If the session is valid, the forum renders; otherwise the sign-in screen renders.
6. A session lasts up to 24 hours. Production cookies use the `secure` option, so production must be served over HTTPS.

## Technology

- Node.js
- MongoDB 
- `cookie-session` for browser sessions
- `bcryptjs` for password hashing
- Nodemailer for SMTP email delivery
- Bootstrap and Bootstrap Icons
- ProseMirror packages for the post editor

## Challenges

## Group Members Responsibilities:
- Becca: Worked on the functionality of the Account Information page. Created pop-ups allowing the user to edit their first name, last name, and email. Read from the database to display a user’s joined forums on the bottom of the page and on the side buttons. Added functionalities so that the joined forums could be viewed when clicked on and removed when the “Leave” button is clicked.
- Emma: 
- Nicholas: 
- Isaiah:
- Luigi

## Project Video:




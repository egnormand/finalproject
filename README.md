# WPI Forums
Nicholas Houghton, Emma Normand, Becca Eiferman, Isaiah Balthazar, Luigi Cardaropoli 

WPI Forums is a student focused web application for creating and joining discussion forums, publishing posts, and discussing posts with comments. The app uses React in the browser, an Express server for its API and authentication, MongoDB Atlas, and email sign-in links for verified sessions.

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
4. Opening a valid link consumes its challenge, creates a signed, HTTP-only session cookie, and redirects the browser to /.
5. The client checks /session. If the session is valid, the forum renders; otherwise the sign-in screen renders.
6. A session lasts up to 24 hours. Production cookies use the secure option, so production must be served over HTTPS.

## Technology

- Node.js for running the backend of the application. Express was used to create API routes which were connected to MongoDB in order to retrieve stored data.
- MongoDB 
- cookie-session for browser sessions: cookie-session is used for browser sessions because it stores session data in a signed, HTTP-only cookie so the app can keep track of logged-in users securely and efficiently without storing large session data on the server.
- bcryptjs for password hashing: bcryptjs is used for password hashing because it creates a salted, adaptive hash that is slow to brute-force, making it a secure way to protect user passwords before storing them in the database.
- Nodemailer for SMTP email delivery: Nodemailer is used for SMTP email delivery because it provides a simple and reliable way for a Node.js application to send emails like account verification links, password resets, and notifications through an SMTP server.
- Bootstrap and Bootstrap Icons for organizing forum posts in cards, and other components within the forum page and for button styling to reduce the amount of hand written CSS. I used icons for the comment and pin buttons to add more aesthetics to the forum posts.
- ProseMirror packages for the post editor

## Challenges

## Group Members Responsibilities:
- Becca: Worked on the functionality of the Account Information page. Created pop-ups allowing the user to edit their first name, last name, and email. Read from the database to display a user’s joined forums on the bottom of the page and on the side buttons. Added functionalities so that the joined forums could be viewed when clicked on and removed when the “Leave” button is clicked.
- Emma: 
- Nicholas: 
- Isaiah: Worked on the overall styling and design for the Forum page. Created a pop up to allow users to submit new posts. Added the ability to add comments to different posts on the forum and have them stored in the database so they persist for all users. Added pin functionality. Users can pin posts to the top of their feed and pins are specific to each users account and they persist as well.
- Luigi: For the login setup, use cookie-session to manage authenticated browser sessions, bcryptjs to securely hash and verify user passwords, and Nodemailer to send SMTP-based email verification or password reset links for a complete and secure login flow.

## Project Video:
https://www.youtube.com/watch?v=RBpiQKZ0QHU



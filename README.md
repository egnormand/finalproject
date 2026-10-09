# WPI Forums
Nicholas Houghton, Emma Normand, Becca Eiferman, Isaiah Balthazar, Luigi Cardaropoli 

WPI Forums is a web application where students can create and join different forums, create posts, and reply to others through comments. The application uses React in the browser, Node.js for server functionality, and MongoDB for persistent storage. Users can sign in with their name, email, and password, and verify their login through an SSO email. 

After signing in you can view forums you can click explore forums to join a forum, post to create a new post, and comment to comment on someone elses post. After creating a post you can also delete it, or pin a post.  You can view your account info in the top right, as well as sign out. 

For sign in use a non WPI/outlook email as safelinks may invalidate the cookie not allowing you to sign in. Please check your spam folder if you do not see the email. 

https://finalproject-ag9e.onrender.com
## Instructions to use

- To use the website first visit the link above. 
- Since this uses SSO, you will need to create an account with a name, email address (Use a non-wpi/outlook email for signup as microsoft safelinks invalidates the cookie making the link "invalid"), and password. (password needs to be 8 characters)
- Open the signin link sent to your email in the same browser, and it will  bring you to the logged in forum page (Please check your spam folder, or "other" section in Outlook if you do not see the email)
- You can click the explore forums button on the left to see forums you have not joined. Select one to join it. 
- After you have joined a forum, you can view the posts on it. You can also click the new forum button after entering a forum name on the left to create a forum
- When you have joined a forum, you can click new post and enter a title and then body message, then publish. You can also leave a forum
- You can use comments to reply to someone's post and pins to pin posts to the top for your account. You can also delete posts you own
- You can also view your account details in the top right and change your name, email, and view the forums you are associated with. 


## Technology

- MongoDB is used for persistent storage to store users, forums, posts, and comments. We access the database through the express server. Posts contain a forum ID to make sure they are associated with a specific forum and each user has a joined forums array to determine what forums they are apart of. 
- Node.js for running the backend of the application. Express was used to create API routes which were connected to MongoDB in order to retrieve and display stored data.
- cookie-session for browser sessions: cookie-session is used for browser sessions because it stores session data in a signed, HTTP-only cookie so the app can keep track of logged-in users securely and efficiently without storing large session data on the server.
- bcryptjs for password hashing: bcryptjs is used for password hashing because it creates a salted, adaptive hash that is slow to brute-force, making it a secure way to protect user passwords before storing them in the database.
- Nodemailer for SMTP email delivery: Nodemailer is used for SMTP email delivery because it provides a simple and reliable way for a Node.js application to send emails like account verification links, password resets, and notifications through an SMTP server.
- ProseMirror packages was used to show the text editor for creating a post. It renders it in markdown and allows you to bold and italicize text. 
- Bootstrap and Bootstrap Icons for organizing forum posts in cards, and other components within the forum page and for button styling to reduce the amount of hand written CSS. I used icons for the comment and pin buttons to add more aesthetics to the forum posts.

## Challenges
- Some challenges we faced were getting the SSO to work on Render as our initial smtp attempts were blocked, and we had to debug this together
- We also had some challenges with hooking up posts to a users account as the signin logic and post creation logic were not implemented at the same time. 
- We also had to work together through merge conflicts if multiple people were working on similar files and both needed to merge their changes

## Group Members Responsibilities:
- Becca: Worked on the functionality of the Account Information page. Created pop-ups allowing the user to edit their first name, last name, and email. Read from the database to display a user’s joined forums on the bottom of the page and on the side buttons. Added functionalities so that the joined forums could be viewed when clicked on and removed when the “Leave” button is clicked.
- Emma: 
- Isaiah: Worked on the overall styling and design for the Forum page. Created a pop up to allow users to submit new posts. Added the ability to add comments to different posts on the forum and have them stored in the database so they persist for all users. Added pin functionality. Users can pin posts to the top of their feed and pins are specific to each users account and they persist as well.
- Nicholas: Worked on the main forum display page. Implemented & customized prosemirror packages as the text editor when authoring a post. Created routes, backend, and frontend logic for creating and viewing forum posts, creating forums, exploring and joining/leaving forums, and deleting a post you have created. Worked on basic styling and layout of the forum page. Also connected the users name to display as the author title for a post. 
- Luigi: For the login setup, use cookie-session to manage authenticated browser sessions, bcryptjs to securely hash and verify user passwords, and Nodemailer to send SMTP-based email verification or password reset links for a complete and secure login flow.

## Project Video:
https://www.youtube.com/watch?v=RBpiQKZ0QHU



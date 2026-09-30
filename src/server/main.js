import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";
import cookie from "cookie-session";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use( express.json() );
app.use(express.urlencoded({ extended:true }) );
app.use( cookie({
  name: 'session',
  keys: ['key1', 'key2']
}));


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASS}@${process.env.HOST}/?appName=WebwareCluster`
console.log( 'uri:', uri )
const client = new MongoClient( uri )

let signin_collection = null

await client.connect()
signin_collection = await client.db("WebwareDatabase").collection("UserInfo")

app.get("/user_docs", async (req, res) => {
        if (signin_collection !== null) {
            const docs = await signin_collection.find({}).toArray()
            res.json( docs )
        }
    })

app.use( (req,res,next) => {
  if( signin_collection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

app.post( '/createAcct', async (req,res)=> {
  console.log( req.body )
  
  const user = await signin_collection.findOne({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })

  if(user){
    console.log( "User Already Exists" );
    res.sendStatus(401);
  }

  const new_user = await signin_collection.insertOne({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })
  console.log( "Account Created" )
  req.session.login = true;
  req.session.user = req.body.email
  res.sendStatus(200);
})


app.post( '/login', async (req,res)=> {
  console.log( req.body )
  
  const user = await signin_collection.findOne({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })

  if(user){
    console.log( "Sign-In Sucsessful" )
    req.session.login = true;
    req.session.user = user.email;
    res.sendStatus(200);
  
  }else{
    // password incorrect, redirect back to login page
    console.log( "Sign-In Failed" )
    res.sendStatus(401);
  }
})


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);

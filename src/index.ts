import express from "express";
import dotenv from "dotenv";
import path from "path";

// Initialise the environment
dotenv.config();
const app = express();
const port = process.env.PORT || 8080; // get port from env, otherwise take default

// Configure Express to use EJS
app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world! " + process.env.TEST);
} );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
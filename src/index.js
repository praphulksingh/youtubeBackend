/* important thing to kept in mind while connecting database
1. Always wrap connection code of database in a try and catch or resolve and reject.
2. Assume your database in in another continent ,so always use aync and await  for the promises.
  */


// import mongoose from "mongoose";
// import express from "express";
// import { DB_NAME } from "./constants";

// const app=express();
// const port=process.env.PORT
// /*below code is  used to connect the database with our application and this is IIFE and a ; used before the IIFE to avoid any error*/
// ;(async()=>{
//     try{
//         await mongoose.connect(`${MONGODB_URI} /${DB_NAME}`);
//         //app.on catch for any error while connecting to database
//         app.on(error,(error)=>{
//             console.log("Error while connecting to the database" ,error);
//             throw error
//         })
//         //app.listen  will listen on given port or default port
//         app.listen(port,()=>{
//             console.log("App is listening on port"  + port)
//         })
//         }
//     catch(error){
//         console.log("An error occurred while starting up the server",error);
//         throw error
//     }    
// })()


import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from  "./app.js";

dotenv.config({
    path: './.env'
})

const port=process.env.PORT || 8000


try {
  connectDB()
.then(()=>{
  app.listen(port, ()=>{
    console.log("App is listening on PORT",port)
  })
})
.catch((error)=>{
  console.log("Error  occured while establishing a connection with MongoDB" , error)
})
} catch (error) {
  console.log("Error  occured while initializing the server ", error);
}


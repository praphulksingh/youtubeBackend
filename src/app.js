import express from "express";
import cors from  "cors";
import cookieParser from "cookie-parser";


const app=express();
/* using cors in backend to allow access from server
//The app.use() function is used to mount the specified middleware function(s) at the path that is being specified. It is mostly used to set up middleware for your application.
app.use() uses middleware in it.
app.use() is used to congifure setting to receve data from multiple sources eg url, json, cookies etc */
//here we are telling the  browser that our site can be accessed by specified website
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))

/*here we are accepting json file upto 16 kb */
app.use(express.json({limit:"16kb"}))

/*here we are receving data from url and we use urlencoded to convert url into data
in most of the case extented is not required*/
app.use(express.urlencoded({extended:true,limit:"16kb"}))

/*here we are using static to store some files like pdf,images etc in our file in public folder */
app.use(express.static("public"))

/*cookieParser is used to collect cookies from the browser(req) and set cookies for response(res)*/
app.use(cookieParser())


//routes is usually import after  all middleware because if any middleware throw an error then it will stop executing other code
import userRouter from "./routes/user.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js"
import tweetRouter from "./routes/tweet.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export default app;
import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req, res) => {
// steps to create tweet
//1. get user data from the body 

    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "Content field is required");
    }
    console.log(content)
    //2. save the new tweet in the database with user id as a reference

    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    });

    if (!tweet) {
        throw new apiError(500, "Server error while creating a tweet");
    }
//3.  send back the response with status and message
    return res
        .status(200)
        .json(new apiResponse(200, tweet, 'Tweeted successfully'));
});


const getAllTweets = asyncHandler(async (req, res) => {
    //collecting all the tweets from logedin user
    /*Tweet.find() find the tweet from database */
    //TODO:show like and comments count also
    const tweets = await Tweet.find();
    return res
        .status(200)
        .json(new apiResponse(
        200,
        tweets,
        "tweets fetched successfully"
    ))
})
const getUserTweets = asyncHandler(async (req, res) => {
    const userId=req.params.userId
    //TODO:show like and comments count also
    const isValid =mongoose.isValidObjectId(userId);
    if (!isValid) {
        throw new apiError(400,"Please provide valid id")
    }
// finding the owner from the tweets
    const tweets =await Tweet.find({owner : userId })

    return res.status(200).json(new apiResponse(200,  tweets, "user tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
/*taking tweet id through params and than validating the id */
    const tweetId=req.params.tweetId
    //console.log(tweetId)
    const isValid =mongoose.isValidObjectId(tweetId);
    if (!isValid) {
        throw new apiError(400,"Please provide valid id")
    }
/* taking  the data from body of request*/
    const {updatedcontent}=req.body
    console.log(updatedcontent)
    if (!updatedcontent) {
        throw new apiError(400,"Please provide updated content")
    }
   /*finding the tweet by id */
    const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new apiError(402,"tweet doenst find!")
        }
    //uodating the tweet in database
    tweet.content=updatedcontent
    const updatedtweet=await tweet.save()

    return res
    .status(200)
    .json(new apiResponse(200,  updatedtweet, "Updated Successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    // Route to delete a tweet
    const tweetId=req.params.tweetId
    console.log(tweetId)
    const isValid =mongoose.isValidObjectId(tweetId);
    if (!isValid) {
        throw new apiError(400,"Please provide valid  id")
    }
    
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new apiError(402,"tweet doenst find!")
        }

        // Delete the tweet
    await Tweet.findByIdAndDelete(tweetId);

        // Send a success response
    return res
    .status(200)
    .json(new apiResponse(400,  null, "Deleted Successfully"));
 
})


export {
    createTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
    deleteTweet
}
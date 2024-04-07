import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
//connect comments to videos
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, 'Invalid Video ID')
    }

    const comment=await Comment.find({videos: videoId})

    if (!comment) {
        throw new apiError(401,"No comments found")
    }

    return res
    .status(200)
    .json(new apiResponse(200,comment,"comments are fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: show video on the comment
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, 'Invalid Video ID')
    }
    
    const {usercomment}=req.body
    if (!usercomment) {
        throw new apiError(401,"No usercomments found")
    }


    const comment=await  Comment.create({content: usercomment})

    if (!comment) {
        throw new apiError(401,"No comments created")
    }

    return res
    .status(200)
    .json(new apiResponse(200,comment,"comments are created successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
     const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, 'Invalid commentId ')
    }
    
    const {updatedcomment}=req.body
    if (!updatedcomment) {
        throw new apiError(401,"No usercomments found")
    }


    const comment=await  Comment.findByIdAndUpdate(commentId,{content: updatedcomment}, {new: true})

    if (!comment) {
        throw new apiError(401,"No comments found")
    }
    

    return res
    .status(200)
    .json(new apiResponse(200,comment,"comments are created successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, 'Invalid commentId ')
    }
    
    const comment=await  Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new apiError(401,"No comments found")
    }
    

    return res
    .status(200)
    .json(new apiResponse(200,"comments are deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
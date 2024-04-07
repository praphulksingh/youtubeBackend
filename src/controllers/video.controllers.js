import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    
    const { title, description} = req.body
    if (![title,description]){
        throw new apiError(400,"Please fill all fields")
        }

    const videoLocalFile= req.files?.videoFile[0]?.path;


    let thumbnailLocalFile;
  if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0 ) {
    thumbnailLocalFile= req.files.thumbnail[0].path;
  }
  

    if (!videoLocalFile) {
        throw new apiError(400, 'video is required');
    }
//upoading local file on cloudinary
  const video=await uploadOnCloudinary(videoLocalFile);
  const thumbnail=await uploadOnCloudinary(thumbnailLocalFile);

   
    if (!video) {
       throw new apiError(401, 'vidoe is required'); 
    }

//5.create user object - create entry in db
   const vidoeObj=await Video.create({
        title,
        description,
        owner:req.user._id,
        duration:video.duration,
        videoFile:video.url,
        thumbnail:thumbnail?thumbnail.url:""
    })



    const createdVideo=await Video.findById(vidoeObj._id)
    if (!createdVideo) {
        throw new apiError(500, "server error while  creating a video");
    }

// 8.return response   
    return res.status(201).json(
        new apiResponse(200,createdVideo,"user regestered successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO:-show comments , like in the video
    const videoId  = req.params.videoId
    
    const isValid=isValidObjectId(videoId)
    if (!isValid) {
        throw new apiError(400, 'Invalid video ID') 
    }
    let video = await Video.findById(videoId)
    return res.status(200)
    .json(new apiResponse(200, video, 'video found'))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400,"Please provide valid id")
    }

    const {title,description}=req.body
    if (!(title || description)) {
        throw new apiError(400,"Please provide all fields")
    }

    const thumbnailLocalPath=req.file?.path

  if (!thumbnailLocalPath) {
    throw new apiError(201,"Image field is required")
  }    
   const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

  if (!thumbnail.url) {
    throw new apiError(201,"Failed to Upload thumbnail on Cloudinary Server")
  }

    
    const video=await Video.findByIdAndUpdate(
    videoId,
    {
      $set:{
        title,
        description,
        thumbnail:thumbnail?thumbnail.url:""
      }
    },{new:true}
    )

    return res.status(200)
    .json(new apiResponse(200,
      video,"Video updated Successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, 'Invalid video ID') 
    }
    await Video.findByIdAndDelete(videoId);

    return res.status(200)
    .json(new apiResponse(200, 'video deleted successfully'))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO:toggle publish status
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const  {userid}  = req.body;

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Please provide a valid channelId");
  }
  if (!isValidObjectId(userid)) {
    throw new apiError(400, "Please provide a valid userId");
  }

  if (userid.toString() === channelId.toString()) {
    throw new apiError(400, "Bro you cannot subscribe yourself");
  }

  const subscription=await Subscription.find({subscriber:userid , channel:channelId})

  if (subscription.length<1) {
    await Subscription.create({
      subscriber: userid,
      channel: channelId,
      
   });
  }else{
    await Subscription.deleteOne({
        subscriber: userid,
        channel: channelId,
     });
  }

  return res.status(200).json(
    new apiResponse(
      200,
      null,//TODO: unable to send data to frontend of subscriber
      subscription.length<1 ? "subscribed" : "unsubscribed"
    )
  );
});

// controller to return subscriber list of a channel


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new apiError(401, "Invalid channel Id")
    }
    const channel=await Subscription.find({subscriber:channelId})
    
    return res
    .status(200)
    .json(new apiResponse(200,channel  ,"fetched subscribers successfully"))
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
     const {subscriberId} = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(401, "Invalid subscriber Id")
    }
    const channel=await Subscription.find({channel:subscriberId})
    
    return res
    .status(200)
    .json(new apiResponse(200,channel  ,"fetched channnel subscribed successfully"))
    
})
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
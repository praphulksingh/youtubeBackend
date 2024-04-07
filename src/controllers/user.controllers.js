import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import {User} from "../models/user.model.js";
import uploadOnCloudinary from '../utils/cloudinary.js'
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generatingAccessAndrefreshTokens= async (userId)=>{
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()//db methods
    const refreshToken=user.generateRefreshToken()
    /*storing refresh token in db
    below we are using user instead of User to access or modified db*/
    user.refreshToken=refreshToken;
    user.save({validateBeforeSave:false}) //Avoid validating token on save, as we just created it
    return {accessToken,refreshToken};
  } catch (error) {
    throw new apiError(500, "Somethign went wrong while generating tokens")
  }
}


/*here we are passing a async function in asyncHandler than sending a status and json file */
const userRegister=asyncHandler(async (req,res)=>{
    /* Steps to register user detail and auntheticate 
    1.get the user details from frontend
    2.Validation - not empty ..etc
    3.Check if email already exist : email , username
    4.check for image , check for avatar
    image should be uploaded to local storage than it should be uploaded to cloudinary and url should be stored
    5.create user object - create entry in db
    6.remove password and refresh token field from response
    7.Check for user creation
    8.return response
     */

    // .body get data from form and json file
    const{fullname,email,username,password}=req.body
    
// 2.Validation - not empty ..etc
    if ([fullname,email,username,password]
        .some((field)=>field?.trim()==="")) 
        {
        throw new apiError(400,"Please fill all fields")
        }

//   3.Check if email already exist : email , username
//.find and .findOne  methods used for search from the database
   const existedUser=await User.findOne({
        $and:[{email},{username}],
       // $or:[{email},{username}]
    })

    if (existedUser) {
        throw new apiError(409, "username or email already exists")
    }
    
// 4.check for image , check for avatar
//multer give .files access because we added multer
  const avatarLocalFile= req.files?.avatar[0]?.path
   
    //checking if user uploaded cover image or not 
  
  /*req.files: This checks if req object has a property named files. If it exists and is truthy, it proceeds to the next condition.
Array.isArray(req.files.coverImg): This checks if req.files.coverImg exists and is an array. If it's not an array, the condition evaluates to false.
req.files.coverImg.length > 0: This checks if the length of the req.files.coverImg array is greater than 0, meaning it contains at least one element. */
  let coverImgLocalFile;
  if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length>0 ) {
    coverImgLocalFile= req.files.coverImg[0].path;
  }
  

    if (!avatarLocalFile) {
        throw new apiError(400, 'Avatar is required');
    }
//upoading local file on cloudinary
  const avatar=await uploadOnCloudinary(avatarLocalFile);
  const coverImg=await uploadOnCloudinary(coverImgLocalFile);

   
    if (!avatar) {
       throw new apiError(401, 'Avatar is required'); 
    }

//5.create user object - create entry in db
   const user=await User.create({
        email,
        password,
        fullname,
        username:username.toLowerCase(),
        avatar:avatar.url,
       coverImg:coverImg?coverImg.url:""
    })
/*7.Check for user creation
//6.remove password and refresh token field from response
.select() select all fields so we have to deselect  them
// verifying user by id from database and then desecelting password and refreshToken*/
    const createdUser=await User.findById(user._id)?.select("-password -refreshToken")
    if (!createdUser) {
        throw new apiError(500, "server error while  creating a user");
    }

// 8.return response   
    return res.status(201).json(
        new apiResponse(200,createdUser,"user regestered successfully")
    )

})

//function to login the user 
const loginUser=asyncHandler(async(req, res)=>{
/*1.get data from req body
2.taking username or email from user
3.finding username or email  in DB
4.comparing passwords using bcrypt
5.generating access and refresh token
6.sending in cookie
*/
//1.get data from req body
const{email,username,password}=req.body
    //console.log(email);


//2.taking username or email from user
if(!(email || username)){
  throw new apiError(400, "username or email is required")
}

//3.finding username or email  in DB
const user=await User.findOne({
  $or:[{username} ,{ email}]
})

if (!user) {
  throw new apiError(400,"user does not exists")
}
//4.comparing passwords using bcrypt
const isPasswordValid=await user.isPasswordCorrect(password);

if (!isPasswordValid) {
   throw new apiError(401,'Invalid password')
}
//5.generating access and refresh token
const {accessToken,refreshToken}=await generatingAccessAndrefreshTokens(user._id)

//6.sending in cookie or response
//deselecting password and refreshtoken from sending
const logedInUser=await User.findById(user._id).select("-password -refreshToken")

//this means cookies can't be modiefied from frontend
const option={
  httpOnly:true,
  secure:true
}

//sending response
return res
.status(200)
.cookie("accessToken",accessToken,option)
.cookie("refreshToken",refreshToken,option)
.json(
  new apiResponse(200,
    {
      user:logedInUser,accessToken,refreshToken
    },
    "User logged in successfully"
    )
)



})



const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
       $unset: {
                refreshToken: 1 // this removes the field from document
            }
    },
    // jo return mai aapko response milega usme new updated value milegi
    {
      new:true,
    }
  )

  const option={
    httpOnly:true,
    secure:true
  }
  
  /*deleting accesstoken and refreshToken */
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new apiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken ||req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new apiError(401 ,"Refresh Token not found!" )
  }

  try {
    const decodedToken=jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
  
    const user=await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new apiError(401,"Invalid Refresh Token")
    }
  
    if (incomingRefreshToken!==user?.refreshToken) {
      throw new apiError(401,"refresh token expired or invalid")
    }
  
    const {accessToken,newRefreshToken}=await generatingAccessAndrefreshTokens(user._id)
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new apiResponse(200,{accessToken , refreshToken:newRefreshToken},
        "Access token refreshed")
    )
  } catch (error) {
    throw new apiError(401, "somthing went  wrong when trying to verify the token")
  }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body;

  const user= await User.findById(req.user?._id)
  //console.log(user)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(401, 'the old password is incorrect')
  }

  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new apiResponse(200,{},'password changed successfully'))
}) 


const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new apiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
  })

const updateUserDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body

  if (!fullname || !email) {
    throw new apiError(201,'All fields are complusary')
  }

 const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },{new:true}
    ).select("-password")

    return res.status(200)
    .json(new apiResponse(200,
      user,"Profile updated Successfully"))
})

const updateUserCoverImg=asyncHandler(async (req,res) => {
  const coverImgLocalPath=req.file?.path

  if (!coverImgLocalPath) {
    throw new apiError(201,"Image field is required")
  }

  const coverImg=await uploadOnCloudinary(coverImgLocalPath)

  if (!coverImg.url) {
    throw new apiError(201,"Failed to Upload Image on Cloudinary Server")
  }
  
  const user=await User.findByIdAndUpdate(req.user?._id
    ,{
      $set:{
        coverImg:coverImg.url
      }
    },{new:true}).select("-password")

    return res.status(200).json(new apiResponse(200,user, "coverImg updated successfully"))
})
const updateUserAvatar=asyncHandler(async (req,res) => {
  const avatarLocalPath=req.file?.path

  if (!avatarLocalPath) {
    throw new apiError(201,"Image field is required")
  }

  const avatar=await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new apiError(201,"Failed to Upload Image on Cloudinary Server")
  }
  
  const user=await User.findByIdAndUpdate(req.user?._id
    ,{
      $set:{
        avatar:avatar.url
      }
    },{new:true}).select("-password")

    return res.status(200).json(new apiResponse(200,user,  "avatar updated successfully"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
  //destructuring username from req.params
  const {username}=req.params

  if  (!username?.trim()) {
    new apiError(401,"Username is missing")
  }
console.log(username.trim());
  const channel=await User.aggregate([
    {/* first pipeline
    matching the username in database through aggregation */
      $match:{
        username:username?.toLowerCase()
        
      }
      
    },
    {/* second pipeline
    finding all the subscriber of a channel (user)
    */
      $lookup:{
          from:"subscriptions" ,/*in db, model convert into pulral and lowercase */
          localField:"_id",//iss field ka _id hai
          foreignField:"channel",//kis field se lena hai
          as:"subscribers"//naam kya rkhna hai
      }
    },
    {/*third pipeline
    finding all the channels subscribed by a user */
      $lookup:{
          from:"subscriptions" ,/*in db, model convert into pulral and lowercase */
          localField:"_id",
          foreignField:"subscriber",
          as:"subscribedTo"
      }
    },
    {// fourth pipeline
     
      $addFields:{
        subscriberCount:{// counting all the subscriber of a channel
          $size: "$subscribers"
        },
        channelSubscribedToCount:{ //counting all channel subscribed by a channel
          $size:"$subscribedTo"
        },
        isSubscribed:{//checking if the channel is subscribed or not
          $cond:{//checking conditions
            /* $in works in array and object both to see if  an item exist or not
            */
           /*if: This likely belongs to the context of a query, probably within a Mongoose model or a MongoDB aggregation pipeline.

{$in: [req.user?._id, "$subscribers.subscriber"]}: This is a query condition using the $in operator. The $in operator in MongoDB checks if the value on the left side exists in the array on the right side. In this case, it seems like a conditional check.

req.user?._id: This part is likely to retrieve the _id of the current user making the request. The ? here is the conditional operator which checks if req.user exists, and if it does, it accesses its _id property.

"$subscribers.subscriber": This part appears to be a reference to a field in the MongoDB document. It's using the MongoDB aggregation framework's syntax, where $subscribers.subscriber is probably a field path. This could represent an array of subscribers within a document. */
            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {/*project only gives selected value */
      $project:{
        fullname:1,
        username:1,
        subscriberCount:1,
        channelSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImg:1,
        email:1

      }
    }
    
  ])
//console.log(channel);
  /*if channel has no subscriber than don't show */
  if (!channel?.length) {
    throw new apiError(404,'Channel Not Found')
  }
  return res
  .status(200)
  .json(new apiResponse(200,channel[0],"user channel fetched successfully"))
})

const getWatchHistory=asyncHandler(async (req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{//we are in users model
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{//we are in videos model
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {//values we want to displayed
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {//extracting first value from lookup
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(new apiResponse(200,user[0].watchHistory,"Watch History fetched successfully"))
})

export {
  userRegister ,
   loginUser ,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateUserDetails,
   updateUserAvatar,
   updateUserCoverImg,
   getUserChannelProfile,
   getWatchHistory
  } ;

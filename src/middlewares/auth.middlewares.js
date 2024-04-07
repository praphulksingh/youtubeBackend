
/*constructing the custom middleware for accessing assess token from frontend
(used for logout function)*/
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import  {User}  from "../models/user.model.js";
/*if any parameter is not getting used in a function than we can replace it by _  to make code more clean  -like below code*/
export const verifyJwt=asyncHandler(async(req,res,next)=>{
   try {
    /*req mai agar cookie hai toh accessToken de do OR req header mai agr Authorization hai toh Bearer ko "" replace kr do 
    * Authorization ek part hai jo header mai jata hai access token lekr
    * Bearer <access-token> uska properties jisme access token hoa hai
    */
     const token=req.cookies?.accessToken || req.header( "Authorization")?.replace("Bearer ", "");
 
     if (!token) {
         throw new apiError(401,"unauthorised request")
     }
 /*Jwt.verify() verify token with access token stored in .env */
     const decodedToken=jwt.verify(token, process.env.ACCESS_TOKKEN_SECRET)
 /*here _id is from generatingAccessAndrefreshTokens() from user.model.js */
     const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if (!user) {
         //TODO:dicuss about frontend
         throw new apiError(401,"Invalid Access Token")
     }
 /*adding user to req.user */
     req.user=user;
     next()
   } catch (error) {
    throw new apiError(402, error?.message || "Invalid Access Token");
   }
})



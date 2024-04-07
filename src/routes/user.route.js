import { Router } from "express";
import { getWatchHistory, loginUser,logoutUser } from "../controllers/user.controllers.js";
import {verifyJwt}   from "../middlewares/auth.middlewares.js";
import {userRegister} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { refreshAccessToken } from "../controllers/user.controllers.js";
import { changeCurrentPassword } from "../controllers/user.controllers.js";
import { getCurrentUser } from "../controllers/user.controllers.js";
import { updateUserDetails } from "../controllers/user.controllers.js";
import { updateUserCoverImg } from "../controllers/user.controllers.js";
import { updateUserAvatar } from "../controllers/user.controllers.js";
import { getUserChannelProfile } from "../controllers/user.controllers.js";

const router=Router();

 router.route("/register").post(
    /*upload is a middlewear 
    adding middleweare in register page to extract avatar and coverImg to upload it on local storage
    */
    upload.fields([
        {
            name:'avatar',
            maxCount:1,
        },
        {
            name:'coverImg',
            maxCount:1
        }
        ])

    ,userRegister)

router.route("/login").post(loginUser);

//secured routes (user should be logIn)
router.route("/logout").post(verifyJwt ,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account").patch(verifyJwt, updateUserDetails)
//patch update only the given fields
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJwt, upload.single("coverImg"), updateUserCoverImg)
/* because we are taking data (username) from params ,to take data from params we use        "/c/mrsingh"*/
router.route("/c/:username").get(verifyJwt, getUserChannelProfile)
router.route("/watchHistory").get(verifyJwt, getWatchHistory)

export default router;
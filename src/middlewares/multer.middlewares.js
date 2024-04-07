/*middleware is a middle-man  */
/*multer is package used for handling middlewares
In our case we are  using multer to handle file uploads on localstotage from user*/

import multer from "multer";
import apiError from "../utils/apiError.js";
//diskstorage()  is a storage engine provided by multer
let storage;
try {
  storage = multer.diskStorage({
  
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
} catch (error) {
  throw new apiError(401,"multer is not working")
}
export const upload = multer({ storage, })
import {v2 as cloudinary} from 'cloudinary';

/*"mongoose-aggregate-paginate-v2" (v2) uploads file to cloudinary
    In our case we are uploading file from local storage to cloudinary
*/
import fs from "fs";



cloudinary.config({ 
  cloud_name: 'dloehipgm', 
  api_key: '272431417114889', 
  api_secret: '7mqSDpGQ5kSBJC5tZcEoIvPoQkM',
});
//* i think the catch part of the code is not correct
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export default uploadOnCloudinary;
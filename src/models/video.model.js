import mongoose,{Schema,model} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema=new Schema({
    videoFile:{
        type:String, //cloudinary cloud
        required:[true,'Please provide a file'],

    },
    thumbnail:{
        type:String, //cloudinary cloud
        required:true

    },
    owner:{
            type:Schema.Types.ObjectId,
            ref:'User'
    },
    title:{
        type:String,
        required:true

    },
    description:{
        type:String,
        required:true

    },
    duration:{
        type:Number, //cloudinary cloud
        required:true

    },
    views:{
        type:Number,
        default:0,
       

    },
    isPublished:{
        type:Boolean,
        default:true

    },
},{timestamps:true});
//adding plugins in our model
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model( "Video",videoSchema);
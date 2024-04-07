import mongoose,{Schema} from 'mongoose';
import jwt from "jsonwebtoken"; //generate tokkens
import bcrypt from "bcrypt"; //encrypt password
const userSchema=new Schema({
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
//if we want to enable searching of the field than  use this option.
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,

    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,

    },
    avatar:{
        type:String, //cloudinary url store
        required:true,
    },
    coverImg:{
        type:String,
        //required:true,
    },
    password:{
        type:String,
        required:[true, "password is required"],    
    },
    refreshToken:{
        type:String, 
    },
    
},{
    timestamps:true
});
/*below code is used to encrypt password before saving to database 
here we can't use arrow function because arrow function does'nt  have 'this' keyword.
userSchema.pre('event',async function(next){
    this.password=bcrypt.hash(this.password,10) //10:what type of encryption you want to use
    next()
    //next() means  continue the execution of other hooks and save data
})
*/
userSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
})

/*designing methods to check password */
userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
   /*here argument password is user entered password and this.password is accessing from db*/
}

//generating access token
userSchema.methods.generateAccessToken=function(){
    //jwt.sign( )  method is used for generating token
    return jwt.sign({
        //payloads
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    //access_secret key
    process.env.ACCESS_TOKKEN_SECRET,
    { //access_expiry key
        expiresIn:process.env.ACCESS_TOKKEN_EXPIRY
    }
    )
}
//*we are giving only arguments to the jwt.sign()
userSchema.methods.generateRefreshToken=function(){
    //jwt.sign( )  method is used for generating token
    return jwt.sign({
        //payloads
        _id:this._id,
    },
    //access_secret key
    process.env.REFRESH_TOKEN_SECRET,
    { //access_expiry key
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User=mongoose.model("User",userSchema);



/*Access token is used to validate user and access token is a short lived token 
whereas Refresh token is long lived token and once user validate with the help of refresh token user can extend validity, token life may be differ */
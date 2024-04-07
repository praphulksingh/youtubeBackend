/* explaining below function
const asyncHandler=(fun)=>{async(req,res,next)=>{}}
//this function is handle by try and catch method
*/
/*
const asyncHandler=(func)=>async(req,res,next)=>{
    try {
        await func(req,res,next)
        
    } catch (error) {
        res.status(error.code ||500)
        //.json code send response to fronted 
        .json({
            success:false,
            error:error.message,
        })
    }
}
export default asyncHandler;
*/

//this function is handled by Promise

const asyncHandler=(func)=>((req,res,next)=>{
    Promise.resolve(func(req,res,next)).catch(error=>next(error))
})
export default  asyncHandler;


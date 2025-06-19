export const deleteCookie=(req,res)=>{
     let cookie=req.cookies.authToken;

     if(cookie){
        res.clearCookie('authToken', {
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    
    });
       res.status(200).json({
            status: 200,
            message: "Cookie deleted successfully"
        });
     }else{
         res.status(200).json({
            status: 200,
            message: "Cookie deleted successfully"
        });
     }
}


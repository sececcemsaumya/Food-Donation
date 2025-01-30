const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next) => {
    const token = req?.header("Authorization")?.split(" ")[1]
    if(!token){
        return res.status(401).json({message: "Access denied. No token provided."});
    }
    else{
        try{
            const decoded = JsonWebTokenError.verify(token,"Secret_key");
            req.user = decoded
            next()
        }catch(error){
            return res.status(401).json({message: "Invalid token"});
        }
    }
}

module.exports = authMiddleware ;
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')


/** Function checks if the user is an authorized user/ is logged in */
const protect = asyncHandler( async (req,res, next) =>{
    let token;

    //check if there is 'Authorization' in our request header and the authorization starts with 'Bearer'
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try {
            token = req.headers.authorization.split(" ")[1];

            //decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //find user in db without the password using the decoded token
            req.user = await User.findById(decoded.id).select("-password");

            next()
        } catch (error){
            res.status(401);
            throw new Error("Not authorized, token failed"); 
        }
    }

    if(!token){
        res.status(401);
        throw new Error("Not authorized, no token");
    }
})

module.exports = { protect }


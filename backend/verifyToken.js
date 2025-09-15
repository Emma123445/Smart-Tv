const router = require("express").Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if(err) {
                return res.status(403).json("Token invalide");
            }
            req.user = user; 
            next();
        });
    }else {
        return res.status(401).json("Vous n'êtes pas authentifié");
    }
}
module.exports = verifyToken;
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

dotenv.config();
const jwt__Key = process.env.YGG_TOKEN;

const verifyToken = (req, res, next) => {
    var jwtToken = req.header('auth-token')
    console.log({jwtToken})

    if (!jwtToken) {
        res.status(401).json({
            id: 5,
            statusCode: 401,
            message: "Token validation failed...."
        })
    } else {
        try {
            const data = jwt.verify(jwtToken, jwt__Key);
            req.credentials = data.credentials;
            next();
        } catch (error) {
            console.log({error})
            res.status(401).json({
                id: 5,
                statusCode: 401,
                message: 'Token validation error....'
            })
        }
    }
}

// Exporting the module to be used by other modules

module.exports = verifyToken; // Exporting the verifytoken function for routing

// CommerceFox verifier codebase finished
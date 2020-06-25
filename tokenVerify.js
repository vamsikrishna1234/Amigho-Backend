
const jwt = require('jsonwebtoken');
const privateKey = require('./key');

module.exports = (req, res, next) => {

    // reading the token from the header and verifying the token
    var bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        var bearerToken = bearerHeader.split(" ")[1];

        /**
         * verifying the JWT token using the PK, if err occurs
         * forbidden request 403 code
         */
        jwt.verify(bearerToken, privateKey, (err, payload) => {
            if(err) res.status(403).json({message : err.message});
            else next()
        })

    }else res.status(403).json({message : "Forbidden"});
}

const jwt = require('jsonwebtoken'); // Ensure jwt module is required

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header
    console.log(token);

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET); // Verify the token using the secret key
        req.userId = decoded.id; // Attach the decoded user ID to the request object
        console.log("ID:", req.userId);
        console.log("Decoded", decoded);
        
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(403).json({ error: 'Forbidden: Invalid or expired token.' }); // Handle errors (invalid/expired token)
    }
};

module.exports = {authenticateToken};

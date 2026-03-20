const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
let token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Handle case where token is undefined or null
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: "Invalid token format" });
  }

  if (token.startsWith('Bearer ')) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(401).json({ message: "Token failed" });
  }
};

import jwt from "jsonwebtoken";
// import User from "../model/userModel";

const isAuth = async (req, res, next) => {
  try {
    let { token } = req.cookies;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Unauthorized: No token provided" });
    }
    let verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(400).json({ message: "Unauthorized: Invalid token" });
    }
    // req.userId = verifyToken.userId;
    req.userId = { _id: verifyToken.userId };
    // req.user = { _id: verifyToken.userId };
    // req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: `Auth failed: ${error}` });
  }
};

export default isAuth;

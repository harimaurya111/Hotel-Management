import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {

  try {
    const { userId } = getAuth(req);
    // console.log("userId:", userId); // 👈 check this
    // console.log("Authorization header:", req.headers.authorization);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
   req.auth = { userId };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

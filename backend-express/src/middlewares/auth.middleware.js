import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (
      !payload ||
      typeof payload.sub !== "string" ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Account unavailable",
      });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}

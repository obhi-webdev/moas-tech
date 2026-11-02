import argon2 from "argon2";
import { User } from "../../models/user.model.js";
import { createAccessToken } from "../../utils/jwt.js";

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body || {};

    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Valid identifier and password are required",
      });
    }

    const value = identifier.trim();

    const user = await User.findOne(
      value.includes("@")
        ? { email: value.toLowerCase() }
        : { phone: value }
    ).select("+password");

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Invalid login credentials",
      });
    }

    const validPassword = await argon2.verify(
      user.password,
      password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid login credentials",
      });
    }

    const accessToken = createAccessToken(user);

    return res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
}

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  console.log("Protect middleware called");
  try {
    // Get token from cookies
    const token = req.cookies.jwt;
    console.log("Token from cookies:", token ? "Present" : "Missing");

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", decoded);

      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");
      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      if (!user.isActive) {
        return res
          .status(401)
          .json({ message: "Not authorized, user is inactive" });
      }

      // Enforce password change flow
      const originalUrl = req.originalUrl || "";
      const isChangePassword =
        req.method === "POST" &&
        originalUrl.includes("/api/auth/change-password");
      if (user.mustChangePassword && !isChangePassword) {
        return res.status(403).json({
          message:
            "Password reset required. Please change your password to continue.",
          mustChangePassword: true,
        });
      }

      // Add user to request object
      req.user = user;
      console.log("User attached to request:", req.user._id);
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Authorize middleware called");
    console.log("User role:", req.user.role);
    console.log("Required roles:", roles);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

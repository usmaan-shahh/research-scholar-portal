import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");

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
    // Flatten the roles array if it's nested
    const flatRoles = roles.flat();

    console.log("=== Authorization Debug ===");
    console.log("User:", req.user);
    console.log("User role:", req.user?.role);
    console.log("Required roles:", flatRoles);
    console.log("Route:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Is authorized:", flatRoles.includes(req.user?.role));
    console.log("==========================");

    if (!flatRoles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role} is not authorized to access this route`,
        userRole: req.user?.role,
        requiredRoles: flatRoles,
        route: req.originalUrl,
        method: req.method,
      });
    }

    next();
  };
};

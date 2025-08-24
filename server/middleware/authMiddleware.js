import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

export const authorize = (...roles) => {
  return (req, res, next) => {
    const flatRoles = roles.flat();

    console.log("=== Authorization Debug ===");
    console.log("User:", req.user);
    console.log("User role:", req.user?.role);
    console.log("Required roles:", flatRoles);
    console.log("Route:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Is authorized:", flatRoles.includes(req.user?.role));
    console.log("User ID:", req.user?._id);
    console.log("User department:", req.user?.department);
    console.log("User departmentCode:", req.user?.departmentCode);
    console.log("==========================");

    if (!flatRoles.includes(req.user?.role)) {
      console.log("❌ AUTHORIZATION FAILED for user:", req.user?.role);
      console.log("❌ Required roles:", flatRoles);
      console.log("❌ Route:", req.originalUrl);
      console.log("❌ Method:", req.method);

      return res.status(403).json({
        message: `User role ${req.user?.role} is not authorized to access this route`,
        userRole: req.user?.role,
        requiredRoles: flatRoles,
        route: req.originalUrl,
        method: req.method,
        userId: req.user?._id,
        userDepartment: req.user?.department,
        userDepartmentCode: req.user?.departmentCode,
      });
    }

    console.log("✅ AUTHORIZATION SUCCESS for user:", req.user?.role);
    next();
  };
};

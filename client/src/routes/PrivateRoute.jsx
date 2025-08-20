import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  console.log("PrivateRoute - User:", user);
  console.log("PrivateRoute - Location:", location.pathname);
  console.log("PrivateRoute - mustChangePassword:", user?.mustChangePassword);

  if (!isAuthenticated || !user) {
    console.log("PrivateRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce password change for users with mustChangePassword flag
  // Only allow access to change-password route
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    console.log(
      "PrivateRoute - Password change required, redirecting to change-password"
    );
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("PrivateRoute - Role not allowed, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("PrivateRoute - Access granted");
  return children;
};

export default PrivateRoute;

import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce password change for users with mustChangePassword flag
  // Only allow access to change-password route
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;

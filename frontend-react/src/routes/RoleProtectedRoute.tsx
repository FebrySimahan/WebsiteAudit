import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { authUtils } from "../services/api";


interface RoleProtectedRouteProps {
  allowedRoles?: string[];
  deniedRoles?: string[];
  allowedUserIds?: number[];
  deniedUserIds?: number[];
}


const RoleProtectedRoute = ({ allowedRoles = [], deniedRoles = [], allowedUserIds = [], deniedUserIds = [] }: RoleProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("denied");
        return;
      }

      const user = await authUtils.getUser();
      const userRole = user?.level_role;
      const userId = user?.id;

      if (!userRole) {
        setStatus("denied");
        return;
      }

      if (deniedRoles.length > 0 && deniedRoles.includes(userRole)) {
        setStatus("denied");
        return;
      }


      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        setStatus("denied");
        return;
      }

      if (allowedUserIds.length > 0 && !allowedUserIds.includes(userId)) {
        setStatus("denied");
        return;
      }

      setStatus("allowed");
    };

    checkRole();
  }, [allowedRoles, deniedRoles, allowedUserIds, deniedUserIds]);

  if (status === "loading") return <p className="text-center mt-10">Loading...</p>;
  if (status === "denied") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default RoleProtectedRoute;

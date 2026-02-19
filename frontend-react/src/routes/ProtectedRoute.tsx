import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { authUtils } from "../services/api";


const ProtectedRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (authUtils.isLoggedIn()) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, []);

  if (isAuth === null) return <p className="text-center mt-10">Loading...</p>;

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

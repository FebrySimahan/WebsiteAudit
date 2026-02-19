import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authUtils } from "../../services/api";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      await authUtils.logout();
      navigate("/login", { replace: true });
    };
    logout();
  }, [navigate]);

  return <p className="text-center mt-10">Logging out...</p>;
};

export default Logout;

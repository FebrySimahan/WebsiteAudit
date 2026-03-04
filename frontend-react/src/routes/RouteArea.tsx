import { Navigate } from "react-router-dom";

const RouteArea = () => {
  const cached = sessionStorage.getItem("cached_user");

  const validRoles = ['KTI', 'KSO', 'KBO', 'KSA', 'KBL', 'KSL', 'TLU', 'KSR', 'KBF', 'KSF', 'PE'];

  if (cached) {
    try {
      const { data } = JSON.parse(cached);
      const role = data?.level_role || data?.level;
      const userId = data?.id;

      // Atur navigasi login -> dashboardnya disini, buat antar page pakai App.tsx
      if (role === "DIREKSI" || role === "DIR" || role === "KOM") {
        return <Navigate to="/direksi-dashboard" replace />;
      } else if (userId === 39 || userId === 70) {
        return <Navigate to="/auditor-dashboard" replace />;
      } else if (validRoles.includes(role)) {
        return <Navigate to={`/auditee-dashboard`} replace />;
      } else {
        return <p className="text-red-500 text-center">Not found 404, Hubungi IT</p>;
      }
    } catch (error) {
      return <Navigate to="/login" replace />;
    }
  }
  return <Navigate to="/login" replace />;
};

export default RouteArea;


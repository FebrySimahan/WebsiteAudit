import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import RouteArea from "./routes/RouteArea";
import LoginPage from "./Pages/AuthPage/LoginPage";
import Logout from "./Pages/AuthPage/Logout";
import DireksiDashboard from "./Pages/DireksiPage/DireksiDashboard";
import DireksiPermintaanData from "./Pages/DireksiPage/DireksiPermintaanData";
import DireksiTemuanData from "./Pages/DireksiPage/DireksiTemuanData";
import AuditorDashboard from "./Pages/AuditorPage/AuditorDashboard";
import AuditorSuratTugas from "./Pages/AuditorPage/AuditorSuratTugas";
import AuditorPermintaanData from "./Pages/AuditorPage/AuditorPermintaanData";
import AuditorTemuan from "./Pages/AuditorPage/AuditorTemuan";
import AuditeeDashboard from "./Pages/AuditeePage/AuditeeDashboard";
import ScoreboardAuditee from "./Pages/Scoreboard/ScoreboardAuditee";
import ScoreboardDireksi from "./Pages/Scoreboard/ScoreboardDireksi";
import ScoreboardAuditor from "./Pages/Scoreboard/ScoreboardAuditor";
import AuditeeTemuan from "./Pages/AuditeePage/AuditeeTemuan";
import AuditeeIkhtisarTemuan from "./Pages/AuditeePage/AuditeePermintaanData";

const validRoles = ['KTI', 'KSO', 'KBO', 'KSA', 'KBL', 'KSL', 'TLU', 'KSR', 'KBF', 'KSF', 'PE'];



function App() {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RouteArea />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/scoreboard-direksi" element={<ScoreboardDireksi />} />
        <Route path="/scoreboard-auditee" element={<ScoreboardAuditee />} />
        <Route path="/scoreboard-auditor" element={<ScoreboardAuditor />} />
      </Route>

      {/* cuman dirkom */}
      <Route element={<RoleProtectedRoute allowedRoles={["DIREKSI", "DIR", "KOM"]} />}>
        <Route path="/direksi-dashboard" element={<DireksiDashboard />} />
        <Route path="/direksi/permintaan-data" element={<DireksiPermintaanData />} />
        <Route path="/direksi/temuan-data" element={<DireksiTemuanData />} />
      </Route>
      {/* user id 39 70 itu punya pak lilik sm kak muthia. tar kalo berubah diganti */}
      <Route element={<RoleProtectedRoute allowedUserIds={[39, 70]} />}>
        <Route path="/auditor-dashboard" element={<AuditorDashboard />} />
        <Route path="/auditor/surat-tugas" element={<AuditorSuratTugas />} />
        <Route path="/auditor/permintaan-data" element={<AuditorPermintaanData />} />
        <Route path="/auditor/temuan" element={<AuditorTemuan />} />
      </Route>
      {/* role apapun itu selain dirkom sama 2 user id  */}
      <Route element={<RoleProtectedRoute deniedRoles={["DIREKSI", "DIR", "KOM"]} deniedUserIds={[39, 70]} allowedRoles={validRoles} />}>
        <Route path="/auditee-dashboard" element={<AuditeeDashboard />} />
        <Route path="/auditee/temuan" element={<AuditeeTemuan />} />
        <Route path="/auditee/ikhtisar-temuan" element={<AuditeeIkhtisarTemuan />} />
      </Route>


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

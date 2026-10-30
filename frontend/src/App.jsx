import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateCase from "./pages/CreateCase";
import CaseDetails from "./pages/CaseDetails";
import UploadEvidence from "./pages/UploadEvidence";
import Timeline from "./pages/Timeline";
import ShareCase from "./pages/ShareCase";
import EvidenceDetails from "./pages/EvidenceDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-case" element={<CreateCase />} />
      <Route path="/case/:id" element={<CaseDetails />} />
      <Route path="/case/:id/upload" element={<UploadEvidence />} />
      <Route path="/case/:id/timeline" element={<Timeline />} />
      <Route path="/case/:id/share" element={<ShareCase />} />
      <Route path="/case/:id/evidence/:evidenceId" element={<EvidenceDetails />} />
    </Routes>
  );
}

export default App;
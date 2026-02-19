import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SafetyProvider } from "./context/SafetyContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import MapDashboard from "./pages/MapDashboard";
import RouteComparison from "./pages/RouteComparison";
import PrivacyPage from "./pages/PrivacyPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapDashboard />} />
            <Route path="/routes" element={<RouteComparison />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SafetyProvider>
    </AuthProvider>
  );
}

export default App;

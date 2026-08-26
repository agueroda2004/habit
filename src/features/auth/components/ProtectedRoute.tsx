import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "../../../app/LoadingScreen";

export function ProtectedRoute() {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "../../../app/LoadingScreen";

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingScreen />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

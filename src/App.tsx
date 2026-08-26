import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/AppLayout";
import { AppToaster } from "./shared/ui/Toaster";
import { useSessionSync } from "./features/auth/hooks/useSessionSync";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "./features/auth/components/PublicOnlyRoute";
import { LoginPage } from "./features/auth/components/LoginPage";
import { DashboardPage } from "./features/dashboard/components/DashboardPage";
import { HistoryPage } from "./features/history/components/HistoryPage";
import { StatisticsPage } from "./features/statistics/components/StatisticsPage";
import { SettingsPage } from "./features/settings/components/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function SessionBridge() {
  useSessionSync();
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <SessionBridge />
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<div className="p-10 text-center font-bold text-zinc-400">Página no encontrada</div>} />
        </Routes>
        <AppToaster />
      </HashRouter>
    </QueryClientProvider>
  );
}

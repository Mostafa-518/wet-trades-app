import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DataProvider } from "@/contexts/DataContext";
import { TableSkeleton } from "@/components/ui/table-skeleton";

// Lazy load components for better performance
const Index = lazy(() => import("@/pages/Index"));
const Projects = lazy(() => import("@/pages/Projects").then(m => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail").then(m => ({ default: m.ProjectDetail })));
const Subcontractors = lazy(() => import("@/pages/Subcontractors").then(m => ({ default: m.Subcontractors })));
const SubcontractorDetail = lazy(() => import("@/pages/SubcontractorDetail").then(m => ({ default: m.SubcontractorDetail })));
const Trades = lazy(() => import("@/pages/Trades").then(m => ({ default: m.Trades })));
const TradeDetail = lazy(() => import("@/pages/TradeDetail").then(m => ({ default: m.TradeDetail })));
const Responsibilities = lazy(() => import("@/pages/Responsibilities").then(m => ({ default: m.Responsibilities })));
const Subcontracts = lazy(() => import("@/pages/Subcontracts").then(m => ({ default: m.Subcontracts })));
const SubcontractDetail = lazy(() => import("@/pages/SubcontractDetail").then(m => ({ default: m.SubcontractDetail })));
const Report = lazy(() => import("@/pages/Report").then(m => ({ default: m.Report })));
const FilteredSubcontracts = lazy(() => import("@/pages/FilteredSubcontracts").then(m => ({ default: m.FilteredSubcontracts })));
const Users = lazy(() => import("@/pages/Users").then(m => ({ default: m.Users })));
const UserDetail = lazy(() => import("@/pages/UserDetail").then(m => ({ default: m.UserDetail })));
const Profile = lazy(() => import("@/pages/Profile").then(m => ({ default: m.Profile })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Alerts = lazy(() => import("@/pages/Alerts").then(m => ({ default: m.Alerts })));
const RoleManagementPage = lazy(() => import("@/pages/RoleManagement").then(m => ({ default: m.RoleManagementPage })));
const ActivityLog = lazy(() => import("@/pages/ActivityLog").then(m => ({ default: m.ActivityLog })));
const RateEstimator = lazy(() => import("@/pages/RateEstimator").then(m => ({ default: m.RateEstimator })));

// Loading fallback component
const PageLoading = () => <div className="p-6"><TableSkeleton columns={5} rows={3} /></div>;

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PageErrorBoundary pageName="Login">
              <Login />
            </PageErrorBoundary>
          } />
          <Route path="/signup" element={
            <PageErrorBoundary pageName="Sign Up">
              <SignUp />
            </PageErrorBoundary>
          } />
        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary>
                    <Suspense fallback={<PageLoading />}>
                      <Index />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Dashboard">
                    <Suspense fallback={<PageLoading />}>
                      <Dashboard />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/projects"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Projects">
                    <Suspense fallback={<PageLoading />}>
                      <Projects />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Project Detail">
                    <Suspense fallback={<PageLoading />}>
                      <ProjectDetail />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/subcontractors"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Subcontractors">
                    <Suspense fallback={<PageLoading />}>
                      <Subcontractors />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/subcontractors/:id"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Subcontractor Detail">
                    <Suspense fallback={<PageLoading />}>
                      <SubcontractorDetail />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/trades"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Trades">
                    <Suspense fallback={<PageLoading />}>
                      <Trades />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/trades/:id"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Trade Detail">
                    <Suspense fallback={<PageLoading />}>
                      <TradeDetail />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/responsibilities"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Responsibilities">
                    <Suspense fallback={<PageLoading />}>
                      <Responsibilities />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/subcontracts"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Subcontracts">
                    <Suspense fallback={<PageLoading />}>
                      <Subcontracts />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/subcontracts/:id"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Subcontract Detail">
                    <Suspense fallback={<PageLoading />}>
                      <SubcontractDetail />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/subcontracts/filtered"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Filtered Subcontracts">
                    <Suspense fallback={<PageLoading />}>
                      <FilteredSubcontracts />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/report"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Report">
                    <Suspense fallback={<PageLoading />}>
                      <Report />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/users"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Users">
                    <Suspense fallback={<PageLoading />}>
                      <Users />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/users/:id"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="User Detail">
                    <Suspense fallback={<PageLoading />}>
                      <UserDetail />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Profile">
                    <Suspense fallback={<PageLoading />}>
                      <Profile />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/alerts"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Alerts">
                    <Suspense fallback={<PageLoading />}>
                      <Alerts />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Role Management">
                    <Suspense fallback={<PageLoading />}>
                      <RoleManagementPage />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/activity-log"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="Activity Log">
                    <Suspense fallback={<PageLoading />}>
                      <ActivityLog />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/rate-estimator"
          element={
            <AuthGuard>
              <DashboardLayout>
                <DataProvider>
                  <PageErrorBoundary pageName="AI Rate Estimator">
                    <Suspense fallback={<PageLoading />}>
                      <RateEstimator />
                    </Suspense>
                  </PageErrorBoundary>
                </DataProvider>
              </DashboardLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
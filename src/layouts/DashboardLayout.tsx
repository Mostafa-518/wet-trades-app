import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { AlertBadge } from "@/components/AlertBadge";
import { RealtimeStatus } from "@/components/RealtimeStatus";
import {
  Menu,
  X,
  Home,
  FolderOpen,
  Users,
  Wrench,
  ClipboardList,
  FileText,
  Bell,
  BarChart3,
  UserCheck,
  Shield,
  History,
  Calculator,
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userProfile, isLoading } = useUserProfile();
  const { canManageUsers, hasPermission } = usePermissions();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigationItems = [
    { to: ROUTES.DASHBOARD, label: "Dashboard", icon: Home },
    { to: ROUTES.PROJECTS, label: "Projects", icon: FolderOpen, permission: 'manage_projects' },
    { to: ROUTES.SUBCONTRACTORS, label: "Subcontractors", icon: Users, permission: 'manage_subcontractors' },
    { to: ROUTES.TRADES, label: "Trades", icon: Wrench, permission: 'manage_trades' },
    {
      to: ROUTES.RESPONSIBILITIES,
      label: "Responsibilities",
      icon: ClipboardList,
      permission: 'manage_responsibilities'
    },
    { to: ROUTES.SUBCONTRACTS, label: "Subcontracts", icon: FileText, permission: 'manage_subcontracts' },
    { to: ROUTES.ALERTS, label: "Alerts", icon: Bell },
    { to: ROUTES.REPORT, label: "Reports", icon: BarChart3, permission: 'view_reports' },
    { to: ROUTES.RATE_ESTIMATOR, label: "AI Rate Estimator", icon: Calculator },
    ...(canManageUsers ? [
      { to: ROUTES.USERS, label: "Users", icon: UserCheck, permission: 'manage_users' },
      { to: ROUTES.ROLE_MANAGEMENT, label: "Role Management", icon: Shield, permission: 'manage_users' },
      { to: ROUTES.ACTIVITY_LOG, label: "Activity Log", icon: History, permission: 'manage_users' },
    ] : []),
  ].filter(item => !item.permission || hasPermission(item.permission as any));

  return (
    <div className="flex flex-col bg-gray-100  h-screen">
      <div className="flex flex-1 h-80vh overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "w-64 lg:w-80" : "w-16"
          } flex-shrink-0 bg-gray-50 border-r border-gray-200 transition-all duration-300`}
        >
          <div className="h-full px-4 py-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {isSidebarOpen && (
                <Link to="/" className="text-2xl font-bold text-primary">
                  Wet Trades
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="ml-auto"
              >
                {isSidebarOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>

            <nav className="flex flex-col space-y-2 flex-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.to ||
                  (item.to !== ROUTES.DASHBOARD &&
                    pathname.startsWith(item.to));

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 ${
                      isActive
                        ? "bg-gray-100 text-foreground"
                        : "text-muted-foreground"
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {isSidebarOpen && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`group flex items-center w-full rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors ${
                      !isSidebarOpen ? "justify-center" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={userProfile?.avatar_url || ""} />
                      <AvatarFallback>
                        {!isLoading ? (
                          (
                            userProfile?.full_name?.charAt(0) || "U"
                          ).toUpperCase()
                        ) : (
                          <Skeleton className="h-8 w-8 rounded-full" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {isSidebarOpen && (
                      <span className="ml-3 flex-1 text-left">
                        {!isLoading ? (
                          userProfile?.full_name || "User"
                        ) : (
                          <Skeleton className="h-4 w-20" />
                        )}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
            <div></div> {/* Empty left side */}
            <div className="flex items-center gap-4">
              <RealtimeStatus />
              <AlertBadge />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={userProfile?.avatar_url || ""} />
                      <AvatarFallback>
                        {!isLoading ? (
                          (
                            userProfile?.full_name?.charAt(0) || "U"
                          ).toUpperCase()
                        ) : (
                          <Skeleton className="h-8 w-8 rounded-full" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-left">
                      {!isLoading ? (
                        userProfile?.full_name || "User"
                      ) : (
                        <Skeleton className="h-4 w-20" />
                      )}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>

      {/* Full Width Footer */}
      <footer className="h-12 w-full border-t py-4 text-left my-auto text-sm text-gray-500 bg-white">
        ©️ {new Date().getFullYear()} Developed by{" "}
        <span className="font-semibold text-gray-700">Eng. Mostafa Ashraf</span>
      </footer>
    </div>
  );
}
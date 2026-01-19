import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Layouts
import { GuestLayout } from "@/layouts/GuestLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProviderLayout } from "@/layouts/ProviderLayout";

// Guest Pages (eager load for fast initial render)
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Lazy load other pages for better performance
const Search = lazy(() => import("@/pages/Search"));
const UnitDetails = lazy(() => import("@/pages/UnitDetails"));
const Bookings = lazy(() => import("@/pages/Bookings"));

// Admin Pages (lazy loaded)
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminReservations = lazy(() => import("@/pages/admin/Reservations"));
const AdminUnits = lazy(() => import("@/pages/admin/Units"));
const AdminTasks = lazy(() => import("@/pages/admin/Tasks"));
const AdminCalendar = lazy(() => import("@/pages/admin/Calendar"));
const FrontDesk = lazy(() => import("@/pages/admin/FrontDesk"));
const Housekeeping = lazy(() => import("@/pages/admin/Housekeeping"));
const Cashier = lazy(() => import("@/pages/admin/Cashier"));
const RoomTypes = lazy(() => import("@/pages/admin/RoomTypes"));
const Rooms = lazy(() => import("@/pages/admin/Rooms"));
const Properties = lazy(() => import("@/pages/admin/Properties"));
const Profiles = lazy(() => import("@/pages/admin/Profiles"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

// Provider Pages (lazy loaded)
const ProviderAuth = lazy(() => import("@/pages/provider/ProviderAuth"));
const ProviderDashboard = lazy(() => import("@/pages/provider/ProviderDashboard"));
const ProviderProperties = lazy(() => import("@/pages/provider/ProviderProperties"));
const ProviderUnits = lazy(() => import("@/pages/provider/ProviderUnits"));
const ProviderReports = lazy(() => import("@/pages/provider/ProviderReports"));
const ProviderSettings = lazy(() => import("@/pages/provider/ProviderSettings"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">جاري التحميل...</p>
    </div>
  </div>
);

// Query Client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Guest Routes */}
                  <Route element={<GuestLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/unit/:id" element={<UnitDetails />} />
                    <Route path="/bookings" element={<Bookings />} />
                  </Route>
                  
                  {/* Auth Route */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Provider Routes */}
                  <Route path="/provider/auth" element={<ProviderAuth />} />
                  <Route path="/provider" element={<ProviderLayout />}>
                    <Route index element={<ProviderDashboard />} />
                    <Route path="properties" element={<ProviderProperties />} />
                    <Route path="units" element={<ProviderUnits />} />
                    <Route path="reports" element={<ProviderReports />} />
                    <Route path="settings" element={<ProviderSettings />} />
                  </Route>
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="front-desk" element={<FrontDesk />} />
                    <Route path="reservations" element={<AdminReservations />} />
                    <Route path="calendar" element={<AdminCalendar />} />
                    <Route path="housekeeping" element={<Housekeeping />} />
                    <Route path="cashier" element={<Cashier />} />
                    <Route path="room-types" element={<RoomTypes />} />
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="properties" element={<Properties />} />
                    <Route path="profiles" element={<Profiles />} />
                    <Route path="units" element={<AdminUnits />} />
                    <Route path="tasks" element={<AdminTasks />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

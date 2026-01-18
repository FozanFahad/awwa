import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import { GuestLayout } from "@/layouts/GuestLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProviderLayout } from "@/layouts/ProviderLayout";

// Guest Pages
import Index from "@/pages/Index";
import Search from "@/pages/Search";
import UnitDetails from "@/pages/UnitDetails";
import Bookings from "@/pages/Bookings";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminReservations from "@/pages/admin/Reservations";
import AdminUnits from "@/pages/admin/Units";
import AdminTasks from "@/pages/admin/Tasks";
import AdminCalendar from "@/pages/admin/Calendar";
import FrontDesk from "@/pages/admin/FrontDesk";
import Housekeeping from "@/pages/admin/Housekeeping";
import Cashier from "@/pages/admin/Cashier";
import RoomTypes from "@/pages/admin/RoomTypes";
import Rooms from "@/pages/admin/Rooms";
import Profiles from "@/pages/admin/Profiles";
import Settings from "@/pages/admin/Settings";

// Provider Pages
import ProviderAuth from "@/pages/provider/ProviderAuth";
import ProviderDashboard from "@/pages/provider/ProviderDashboard";
import ProviderProperties from "@/pages/provider/ProviderProperties";
import ProviderUnits from "@/pages/provider/ProviderUnits";
import ProviderSettings from "@/pages/provider/ProviderSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
                <Route path="profiles" element={<Profiles />} />
                <Route path="units" element={<AdminUnits />} />
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

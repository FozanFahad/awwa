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

// Guest Pages
import Index from "@/pages/Index";
import Search from "@/pages/Search";
import UnitDetails from "@/pages/UnitDetails";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminReservations from "@/pages/admin/Reservations";
import AdminUnits from "@/pages/admin/Units";
import AdminTasks from "@/pages/admin/Tasks";
import AdminCalendar from "@/pages/admin/Calendar";

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
              </Route>
              
              {/* Auth Route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="units" element={<AdminUnits />} />
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="calendar" element={<AdminCalendar />} />
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

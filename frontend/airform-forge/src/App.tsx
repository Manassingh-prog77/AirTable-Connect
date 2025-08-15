import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import FormPreview from "./pages/FormPreview";
import PublicForm from "./pages/PublicForm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/forms/new" element={
            <ProtectedRoute>
              <FormBuilder />
            </ProtectedRoute>
          } />
          <Route path="/forms/:id/edit" element={
            <ProtectedRoute>
              <FormBuilder />
            </ProtectedRoute>
          } />
          <Route path="/forms/:id/preview" element={
            <ProtectedRoute>
              <FormPreview />
            </ProtectedRoute>
          } />
          <Route path="/form/:publicId" element={<PublicForm />} />
          <Route path="/public/forms/:publicId" element={<PublicForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

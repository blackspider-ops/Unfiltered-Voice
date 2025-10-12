import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import { Header } from "@/components/Header";
import { GoToTopButton } from "@/components/GoToTopButton";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import MeetNiyatiPage from "./pages/MeetNiyatiPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const statusCode = (error as { status: number }).status;
          if (statusCode >= 400 && statusCode < 500) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/meet-niyati" element={<MeetNiyatiPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/mental-health" element={<CategoryPage />} />
                    <Route path="/current-affairs" element={<CategoryPage />} />
                    <Route path="/creative-writing" element={<CategoryPage />} />
                    <Route path="/books" element={<CategoryPage />} />
                    <Route path="/unsubscribe" element={<UnsubscribePage />} />
                    <Route path="/:category/:slug" element={<PostPage />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <GoToTopButton />
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

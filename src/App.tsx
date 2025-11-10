import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AppLoader } from "@/components/AppLoader";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { IncomingHelperRequestAlert } from "@/components/safe/IncomingHelperRequestAlert";
import { cacheManager } from "@/utils/cacheManager";
import Index from "./pages/Index";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Shop from "./pages/Shop";
import Ask from "./pages/Ask";
import QuestionDetail from "./pages/QuestionDetail";
import AskProfile from "./pages/AskProfile";
import ProductDetail from "./pages/ProductDetail";
import SellerProfile from "./pages/SellerProfile";
import Cart from "./pages/Cart";
import { SOSSubCategories } from "./pages/SOSSubCategories";
import CircleDetailWrapper from "./components/CircleDetailWrapper";
import CirclePostDetail from "./pages/CirclePostDetail";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import CreateVideo from "./pages/CreateVideo";
import CreateCircle from "./pages/CreateCircle";
import CreateShop from "./pages/CreateShop";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import UpdateNotifier from "@/components/UpdateNotifier";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    <Route path="/shop" element={<ProtectedRoute><Shop activeTab="shop" onTabSelect={() => {}} onOpenCreate={() => {}} /></ProtectedRoute>} />
    <Route path="/shop/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
    <Route path="/seller/:sellerId" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
    <Route path="/ask" element={<ProtectedRoute><Ask activeTab="ask" onTabSelect={() => {}} onOpenCreate={() => {}} /></ProtectedRoute>} />
    <Route path="/ask/profile" element={<ProtectedRoute><AskProfile /></ProtectedRoute>} />
    <Route path="/ask/question/:questionId" element={<ProtectedRoute><QuestionDetail /></ProtectedRoute>} />
    <Route path="/create/post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
    <Route path="/create/video" element={<ProtectedRoute><CreateVideo /></ProtectedRoute>} />
    <Route path="/create/circle" element={<ProtectedRoute><CreateCircle /></ProtectedRoute>} />
    <Route path="/create/shop" element={<ProtectedRoute><CreateShop /></ProtectedRoute>} />
    <Route path="/sos/:category" element={<ProtectedRoute><SOSSubCategories /></ProtectedRoute>} />
    <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
    <Route path="/circle/:id" element={<ProtectedRoute><CircleDetailWrapper /></ProtectedRoute>} />
    <Route path="/circle/:circleId/post/:postId" element={<ProtectedRoute><CirclePostDetail /></ProtectedRoute>} />
    <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear cache and ensure fresh data on app load
    const initializeApp = async () => {
      try {
        // Check if version has changed
        const versionChanged = cacheManager.checkVersion();
        
        if (versionChanged) {
          console.log('App version changed, clearing caches...');
          // Clear React Query cache
          queryClient.clear();
          // Update to new version
          cacheManager.updateVersion();
        }
        
        // Always invalidate queries on app load to fetch fresh data
        await queryClient.invalidateQueries();
        
        // Check for service worker updates
        const hasUpdate = await cacheManager.checkForUpdates();
        if (hasUpdate) {
          console.log('Service worker update available');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <AppLoader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <UpdateNotifier />
            <InstallPrompt />
            <NotificationPermissionPrompt />
            <IncomingHelperRequestAlert />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Shop from "./pages/Shop";
import Ask from "./pages/Ask";
import QuestionDetail from "./pages/QuestionDetail";
import ProductDetail from "./pages/ProductDetail";
import SellerProfile from "./pages/SellerProfile";
import { SOSSubCategories } from "./pages/SOSSubCategories";
import CircleDetailWrapper from "./components/CircleDetailWrapper";
import CirclePostDetail from "./pages/CirclePostDetail";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import CreateCircle from "./pages/CreateCircle";
import CreateShop from "./pages/CreateShop";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import UpdateNotifier from "@/components/UpdateNotifier";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <CartProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <UpdateNotifier />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/shop" element={<Shop activeTab="shop" onTabSelect={() => {}} onOpenCreate={() => {}} />} />
          <Route path="/shop/product/:id" element={<ProductDetail />} />
          <Route path="/seller/:sellerId" element={<SellerProfile />} />
            <Route path="/ask" element={<Ask activeTab="ask" onTabSelect={() => {}} onOpenCreate={() => {}} />} />
            <Route path="/ask/question/:questionId" element={<QuestionDetail />} />
            <Route path="/create/post" element={<CreatePost />} />
            <Route path="/create/circle" element={<CreateCircle />} />
            <Route path="/create/shop" element={<CreateShop />} />
            <Route path="/sos/:category" element={<SOSSubCategories />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/circle/:id" element={<CircleDetailWrapper />} />
            <Route path="/circle/:circleId/post/:postId" element={<CirclePostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;

import React, { useState } from 'react';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { ShopFeed } from '../components/shop/ShopFeed';
import { ShopSearch } from '../components/shop/ShopSearch';
import { ShopCategories } from '../components/shop/ShopCategories';
import { TrendingItemsCarousel } from '../components/shop/TrendingItemsCarousel';
import { InstallPrompt } from '../components/InstallPrompt';
import { CartModal } from '../components/shop/CartModal';
import { CheckoutModal } from '../components/shop/CheckoutModal';
import { OrderConfirmationModal } from '../components/shop/OrderConfirmationModal';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

type TabKey = "home" | "circles" | "add" | "ask" | "safe" | "shop";

interface ShopProps {
  activeTab: TabKey;
  onTabSelect: (tab: TabKey) => void;
  onOpenCreate: () => void;
}

const Shop: React.FC<ShopProps> = ({ activeTab, onTabSelect, onOpenCreate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { openCart, getCartCount } = useCart();

  return (
    <div className="min-h-[100dvh] mx-auto bg-background text-foreground selection:bg-secondary/40 max-w-[480px] relative border-l border-r border-border/20 font-sans safe-area-bottom" data-testid="shop-page">
      <InstallPrompt />
      <div className="relative safe-area-top">
        <Header 
          onNotifications={() => alert("Notifications")}
          onMessages={() => alert("Messages")}
        />
      </div>
      
      <main className="pb-28 safe-area-bottom">
        <div className="mobile-px mobile-py space-y-4">
          <ShopSearch 
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <ShopCategories 
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
        
        <div className="mobile-px">
          <TrendingItemsCarousel />
        </div>
        
        <ShopFeed 
          searchQuery={searchQuery}
          category={selectedCategory}
        />
      </main>

      {/* Floating Cart Button - Touch-optimized */}
      <Button
        onClick={openCart}
        className="fixed bottom-24 right-4 z-50 touch-target-large rounded-full shadow-elegant hover:shadow-glow transition-all duration-200 bg-primary hover:bg-primary/90 active:scale-95"
        size="icon"
      >
        <ShoppingCart className="h-6 w-6" />
        {getCartCount() > 0 && (
          <Badge className="absolute -top-1 -right-1 min-w-[1.5rem] h-6 flex items-center justify-center text-xs font-semibold bg-destructive text-destructive-foreground border-2 border-background">
            {getCartCount()}
          </Badge>
        )}
      </Button>
      
      <FooterNav
        active={activeTab}
        onSelect={onTabSelect}
        onOpenCreate={onOpenCreate}
      />
      
      {/* Modals */}
      <CartModal />
      <CheckoutModal />
      <OrderConfirmationModal />
    </div>
  );
};

export default Shop;
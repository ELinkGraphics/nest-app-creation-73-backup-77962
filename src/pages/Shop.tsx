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
    <div className="min-h-[100dvh] mx-auto bg-white text-foreground selection:bg-secondary/40 max-w-[480px] relative border-l border-r border-gray-200 font-sans" data-testid="shop-page">
      <InstallPrompt />
      <div className="relative">
        <Header 
          onNotifications={() => alert("Notifications")}
          onMessages={() => alert("Messages")}
        />
      </div>
      
      <main className="pb-24">
        <div className="p-4 space-y-4">
          <ShopSearch 
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <ShopCategories 
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
        
        <TrendingItemsCarousel />
        
        <ShopFeed 
          searchQuery={searchQuery}
          category={selectedCategory}
        />
      </main>

      {/* Floating Cart Button */}
      <Button
        onClick={openCart}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <ShoppingCart className="h-6 w-6" />
        {getCartCount() > 0 && (
          <Badge className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 text-xs bg-red-500 text-white border-2 border-white">
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
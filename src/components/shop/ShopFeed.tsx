import React, { useState, useEffect } from 'react';
import { ShopPostCard } from './ShopPostCard';
import { mockShopItems } from '../../data/shop';
import { ShopItem } from '../../types/shop';
import { useCart } from '../../contexts/CartContext';
import { toast } from '../ui/use-toast';

interface ShopFeedProps {
  searchQuery: string;
  category: string;
}

export const ShopFeed: React.FC<ShopFeedProps> = ({ searchQuery, category }) => {
  const [items, setItems] = useState<ShopItem[]>(mockShopItems);
  const { addToCart, openCart, openCheckout } = useCart();

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleShare = (itemId: string) => {
    // Share functionality
    console.log('Sharing item:', itemId);
  };

  const handleQuickBuy = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      addToCart(item);
      openCheckout();
      toast({
        title: "Item added to cart",
        description: `${item.title} has been added and checkout opened`,
      });
    }
  };

  const handleAddToCart = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      addToCart(item);
      toast({
        title: "Added to cart",
        description: `${item.title} has been added to your cart`,
      });
    }
  };

  const handleFollowSeller = (sellerId: string) => {
    setItems(prev => prev.map(item => 
      item.seller.id === sellerId 
        ? { ...item, seller: { ...item.seller, following: !item.seller.following } }
        : item
    ));
  };

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <ShopPostCard
          key={item.id}
          item={item}
          onLike={handleLike}
          onShare={handleShare}
          onQuickBuy={handleQuickBuy}
          onAddToCart={handleAddToCart}
          onFollowSeller={handleFollowSeller}
        />
      ))}
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No items found matching your criteria</p>
        </div>
      )}
    </div>
  );
};
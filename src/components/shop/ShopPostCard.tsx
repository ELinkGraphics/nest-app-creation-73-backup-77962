import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Heart, Share2, ShoppingCart, Zap, Clock, Users, MessageCircle } from 'lucide-react';
import { ShopItem } from '../../types/shop';
import { cn } from '../../lib/utils';

interface ShopPostCardProps {
  item: ShopItem;
  onLike: (itemId: string) => void;
  onShare: (itemId: string) => void;
  onQuickBuy: (itemId: string) => void;
  onAddToCart: (itemId: string) => void;
  onFollowSeller: (sellerId: string) => void;
}

export const ShopPostCard: React.FC<ShopPostCardProps> = ({
  item,
  onLike,
  onShare,
  onQuickBuy,
  onAddToCart,
  onFollowSeller
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleCardClick = () => {
    navigate(`/shop/product/${item.id}`);
  };

  // Calculate time left for flash sales
  useEffect(() => {
    if (item.flashSale && item.flashSale.endTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(item.flashSale!.endTime).getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [item.flashSale]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const discountPercentage = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <Card 
      className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Seller Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
              {item.seller.name[0]}
            </div>
            <div>
              <p className="font-medium text-username">{item.seller.name}</p>
              <p className="text-timestamp text-muted-foreground">
                {item.seller.rating}★ • {item.seller.followers} followers
              </p>
            </div>
          </div>
          <Button
            variant={item.seller.following ? "secondary" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFollowSeller(item.seller.id);
            }}
            className="h-8 px-3"
          >
            {item.seller.following ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative">
        <img 
          src={item.images[0]} 
          alt={item.title}
          className="w-full h-64 object-cover"
        />
        
        {/* Flash Sale Timer */}
        {item.flashSale && timeLeft !== null && timeLeft > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white">
              -{discountPercentage}%
            </Badge>
          </div>
        )}
        
        {/* Quick Buy Overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <Button
            onClick={() => onQuickBuy(item.id)}
            className="bg-white text-black hover:bg-gray-100"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Buy
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-post-title leading-tight">{item.title}</h3>
          <div className="text-right">
            <p className="font-bold text-post-content text-primary">${item.price}</p>
            {item.originalPrice && (
              <p className="text-timestamp text-muted-foreground line-through">
                ${item.originalPrice}
              </p>
            )}
          </div>
        </div>
        
        <p className="text-muted-foreground text-post-content mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Category and Stock */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-badge">
            {item.category}
          </Badge>
          {item.stock <= 5 && (
            <Badge variant="destructive" className="text-badge">
              Only {item.stock} left!
            </Badge>
          )}
        </div>

        {/* Social Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(item.id)}
              className={cn(
                "flex items-center gap-1 text-action-label transition-colors",
                item.liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", item.liked && "fill-current")} />
              {item.likes}
            </button>
            <button
              onClick={() => onShare(item.id)}
              className="flex items-center gap-1 text-action-label text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {item.shares}
            </button>
            <span className="flex items-center gap-1 text-action-label text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {item.comments}
            </span>
          </div>
          
          {item.groupBuy && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {item.groupBuy.currentParticipants}/{item.groupBuy.minParticipants}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item.id);
            }}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onQuickBuy(item.id);
            }}
            className="flex-1"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </div>

        {/* Group Buy Progress */}
        {item.groupBuy && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-xs mb-1">
              <span>Group Buy Progress</span>
              <span>{item.groupBuy.currentParticipants}/{item.groupBuy.minParticipants}</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ 
                  width: `${(item.groupBuy.currentParticipants / item.groupBuy.minParticipants) * 100}%` 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.groupBuy.minParticipants - item.groupBuy.currentParticipants} more needed for group discount!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
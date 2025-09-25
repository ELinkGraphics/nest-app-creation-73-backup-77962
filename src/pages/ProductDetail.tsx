import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, MessageCircle, MapPin, Shield, Truck, RotateCcw, Flag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import FooterNav from '@/components/FooterNav';
import { mockShopItems } from '@/data/shop';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
  images?: string[];
}

const mockReviews: Review[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    rating: 5,
    comment: 'Excellent quality! Exactly as described. Fast shipping and great communication from the seller.',
    timestamp: '2 days ago',
    helpful: 12,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop']
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    rating: 4,
    comment: 'Good condition as stated. Minor wear but nothing major. Would buy from this seller again.',
    timestamp: '1 week ago',
    helpful: 8
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    rating: 5,
    comment: 'Amazing product! Better than expected. Highly recommend!',
    timestamp: '2 weeks ago',
    helpful: 15
  }
];

import { type TabKey } from '@/hooks/useAppNav';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  // Find the product
  const product = mockShopItems.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    mockReviews.filter(review => review.rating === rating).length
  );

  // Get similar products
  const similarProducts = mockShopItems
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/shop')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-2"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 active:bg-transparent active:text-primary">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="relative">
        <div className="aspect-[4/3] bg-muted max-h-80">
          <img
            src={product.images?.[selectedImageIndex] || product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-primary' : 'border-muted'
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        {/* Title and Price */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={product.condition === 'new' ? 'default' : 'secondary'}>
              {product.condition}
            </Badge>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          
          <h1 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{product.name}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {renderStars(averageRating)}
              <span className="text-sm text-muted-foreground ml-1">
                ({mockReviews.length} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/seller/${product.seller.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="flex-shrink-0">
                <AvatarImage src={product.seller.avatar} />
                <AvatarFallback>{product.seller.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate">{product.seller.name}</h3>
                  {product.seller.verified && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {renderStars(product.seller.rating, 'sm')}
                  <span className="truncate">({product.seller.reviews})</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 text-xs px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle message action
                }}
              >
                <MessageCircle className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Message</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-medium capitalize">{product.condition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium">{product.brand || 'Generic'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.location}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Shipping & Returns</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-primary" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3 h-3 text-primary" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-primary" />
                  <span>Buyer protection guaranteed</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4 space-y-4">
            {/* Rating Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center mb-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {mockReviews.length} reviews
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((rating, index) => (
                      <div key={rating} className="flex items-center gap-2 text-xs">
                        <span>{rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${(ratingCounts[index] / mockReviews.length) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground">
                          {ratingCounts[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Individual Reviews */}
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.user.name}</span>
                          {review.user.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-xs text-muted-foreground">
                            {review.timestamp}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {review.comment}
                        </p>
                        
                        {review.images && (
                          <div className="flex gap-2 mb-2">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt=""
                                className="w-16 h-16 rounded object-cover"
                              />
                            ))}
                          </div>
                        )}
                        
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          👍 Helpful ({review.helpful})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {similarProducts.map((item) => (
                <Card 
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/shop/product/${item.id}`)}
                >
                  <CardContent className="p-2">
                    <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-medium text-xs line-clamp-2 mb-1 leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary">${item.price}</span>
                      <div className="flex items-center gap-1">
                        {renderStars(item.rating, 'sm')}
                        <span className="text-[10px] text-muted-foreground">
                          ({item.reviews})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-6 py-4 pb-20">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {/* Quantity Selector */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="px-2 py-1 min-w-[30px] text-center text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button 
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>

      <FooterNav 
        active="home"
        onSelect={() => {}}
        onOpenCreate={() => {}}
      />
    </div>
  );
};

export default ProductDetail;
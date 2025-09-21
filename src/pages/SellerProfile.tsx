import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageCircle, Shield, MapPin, Calendar, TrendingUp, Package, DollarSign, Users, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import FooterNav from '@/components/FooterNav';
import { mockShopItems } from '@/data/shop';

// Mock seller data that matches the shop items
const mockSellers = {
  'seller1': {
    id: 'seller1',
    name: 'TechGuru Store',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    verified: true,
    rating: 4.8,
    totalReviews: 234,
    joinedDate: '2022-03-15',
    location: 'San Francisco, CA',
    description: 'Premium electronics retailer specializing in latest gadgets and accessories. We pride ourselves on quality products and excellent customer service.',
    phone: '+1 (555) 123-4567',
    email: 'contact@techgurustore.com',
    stats: {
      totalSales: 15420,
      revenue: 847500,
      activeListings: 156,
      followers: 15420,
      responseRate: 98,
      responseTime: '< 2 hours'
    },
    badges: ['Top Seller', 'Fast Shipping', 'Verified Business']
  },
  'seller2': {
    id: 'seller2',
    name: 'Fashion Forward',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=150&h=150&fit=crop&crop=face',
    verified: false,
    rating: 4.6,
    totalReviews: 145,
    joinedDate: '2021-08-20',
    location: 'New York, NY',
    description: 'Curated fashion collection featuring both vintage finds and contemporary pieces.',
    phone: '+1 (555) 987-6543',
    email: 'hello@fashionforward.com',
    stats: {
      totalSales: 8930,
      revenue: 234800,
      activeListings: 89,
      followers: 8930,
      responseRate: 95,
      responseTime: '< 4 hours'
    },
    badges: ['Fashion Expert', 'Eco Friendly']
  },
  'seller3': {
    id: 'seller3',
    name: 'Green Living Co',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    verified: true,
    rating: 4.9,
    totalReviews: 187,
    joinedDate: '2023-01-10',
    location: 'Seattle, WA',
    description: 'Sustainable living products and smart home solutions for eco-conscious consumers.',
    phone: '+1 (555) 456-7890',
    email: 'info@greenlivingco.com',
    stats: {
      totalSales: 12340,
      revenue: 456700,
      activeListings: 67,
      followers: 12340,
      responseRate: 99,
      responseTime: '< 1 hour'
    },
    badges: ['Eco Certified', 'Smart Home Expert']
  }
};

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  timestamp: string;
  product: string;
}

const mockSellerReviews: Review[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    rating: 5,
    comment: 'Excellent seller! Fast shipping and great communication. Product exactly as described.',
    timestamp: '2 days ago',
    product: 'iPhone 15 Pro'
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    rating: 5,
    comment: 'Professional service and high-quality products. Highly recommend this seller!',
    timestamp: '1 week ago',
    product: 'MacBook Pro'
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    rating: 4,
    comment: 'Good experience overall. Item arrived quickly and in good condition.',
    timestamp: '2 weeks ago',
    product: 'AirPods Pro'
  }
];

const SellerProfile: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');

  const seller = sellerId ? mockSellers[sellerId as keyof typeof mockSellers] : null;

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Seller not found</h2>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  // Get seller's listings - match by seller ID
  const sellerListings = mockShopItems.filter(item => item.seller.id === seller.id);

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Seller Profile</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Seller Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={seller.avatar} />
            <AvatarFallback>{seller.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-lg truncate">{seller.name}</h2>
              {seller.verified && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              {renderStars(seller.rating, 'sm')}
              <span className="text-sm text-muted-foreground">
                {seller.rating} ({formatNumber(seller.totalReviews)} reviews)
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="w-3 h-3" />
              <span>{seller.location}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Joined {new Date(seller.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {seller.badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">${formatNumber(seller.stats.revenue)}</div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{formatNumber(seller.stats.totalSales)}</div>
              <div className="text-xs text-muted-foreground">Items Sold</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{seller.stats.activeListings}</div>
              <div className="text-xs text-muted-foreground">Active Listings</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{formatNumber(seller.stats.followers)}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Active Listings ({sellerListings.length})</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {sellerListings.map((item) => (
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
                      <Badge variant={item.condition === 'new' ? 'default' : 'secondary'} className="text-[10px]">
                        {item.condition}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">About the Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {seller.description}
                </p>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>{seller.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{seller.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{seller.location}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Rate:</span>
                      <span className="font-medium">{seller.stats.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="font-medium">{seller.stats.responseTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Customer Reviews</h3>
              <div className="flex items-center gap-1">
                {renderStars(seller.rating, 'sm')}
                <span className="text-sm text-muted-foreground ml-1">
                  {seller.rating} ({formatNumber(seller.totalReviews)})
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {mockSellerReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.user.name}</span>
                          <span className="text-xs text-muted-foreground">• {review.timestamp}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-xs text-muted-foreground">
                            for {review.product}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <FooterNav 
        active="home"
        onSelect={() => {}}
        onOpenCreate={() => {}}
      />
    </div>
  );
};

export default SellerProfile;
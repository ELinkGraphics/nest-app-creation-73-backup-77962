import React from 'react';
import { MapPin, Calendar, Users, Globe, Lock, Crown, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Circle } from '@/hooks/useCircles';

interface CircleAboutProps {
  circle: Circle;
}

const CircleAbout: React.FC<CircleAboutProps> = ({ circle }) => {
  const mockStats = {
    totalPosts: 156,
    totalEvents: 8,
    totalResources: 23,
    monthlyActivity: 89
  };

  const mockRules = [
    'Be respectful and professional in all interactions',
    'Share relevant content that adds value to the community',
    'No spam, self-promotion without permission, or off-topic posts',
    'Respect privacy and confidentiality when discussing business matters',
    'Help create an inclusive environment for all members'
  ];

  const mockTags = ['startup', 'technology', 'entrepreneurship', 'networking', 'funding', 'product-development'];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Description */}
      <Card className="mx-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            About This Circle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed mb-4">
            {circle.description} This is a community-driven space where entrepreneurs, 
            developers, and innovators come together to share knowledge, collaborate on projects, 
            and support each other's growth in the tech industry.
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {mockTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="mx-0">
        <CardHeader>
          <CardTitle>Circle Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mockStats.totalPosts}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mockStats.totalEvents}</p>
              <p className="text-sm text-muted-foreground">Events Hosted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mockStats.totalResources}</p>
              <p className="text-sm text-muted-foreground">Resources Shared</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mockStats.monthlyActivity}%</p>
              <p className="text-sm text-muted-foreground">Monthly Activity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circle Info */}
      <Card className="mx-0">
        <CardHeader>
          <CardTitle>Circle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {circle.created_at ? new Date(circle.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Members</p>
              <p className="text-sm text-muted-foreground">
                {(circle.members_count || 0).toLocaleString()} active members
              </p>
            </div>
          </div>
          
          {circle.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{circle.location}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {circle.is_private ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Globe className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Privacy</p>
              <p className="text-sm text-muted-foreground">
                {circle.is_private ? 'Private - Invite only' : 'Public - Anyone can join'}
              </p>
            </div>
          </div>
          
          {circle.is_premium && (
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Membership</p>
                <p className="text-sm text-muted-foreground">Premium circle - Subscription required</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card className="mx-0">
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {mockRules.map((rule, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground">{rule}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Creator Info */}
      {circle.creator && (
        <Card className="mx-0">
          <CardHeader>
            <CardTitle>Circle Creator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {circle.creator.avatar_url ? (
                <img 
                  src={circle.creator.avatar_url} 
                  alt={circle.creator.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                  {circle.creator.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{circle.creator.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  @{circle.creator.username}
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CircleAbout;
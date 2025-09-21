import React, { useState } from 'react';
import { Search, UserPlus, Crown, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CircleMembersProps {
  circle: any;
}

const CircleMembers: React.FC<CircleMembersProps> = ({ circle }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const mockMembers = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      title: 'Circle Creator',
      role: 'creator',
      joinDate: '2023-01-15',
      posts: 45,
      isOnline: true
    },
    {
      id: '2',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      title: 'Senior Developer',
      role: 'moderator',
      joinDate: '2023-02-20',
      posts: 23,
      isOnline: true
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      title: 'Product Manager',
      role: 'member',
      joinDate: '2023-03-10',
      posts: 12,
      isOnline: false
    },
    {
      id: '4',
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      title: 'UX Designer',
      role: 'member',
      joinDate: '2023-04-05',
      posts: 8,
      isOnline: true
    },
    {
      id: '5',
      name: 'Luna Park',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
      title: 'Marketing Lead',
      role: 'member',
      joinDate: '2023-05-12',
      posts: 15,
      isOnline: false
    }
  ];

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'creator':
        return <Badge variant="default">Creator</Badge>;
      case 'moderator':
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Members ({mockMembers.length})</h3>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Invite
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members Grid */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow mx-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-foreground truncate flex-shrink-0 max-w-[150px]">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getRoleIcon(member.role)}
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {member.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="truncate">Joined {member.joinDate}</span>
                      <span className="flex-shrink-0">{member.posts} posts</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {member.role !== 'creator' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-xs px-2">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Load More */}
      {filteredMembers.length >= 5 && (
        <div className="text-center mt-6">
          <Button variant="outline">Load More Members</Button>
        </div>
      )}
    </div>
  );
};

export default CircleMembers;
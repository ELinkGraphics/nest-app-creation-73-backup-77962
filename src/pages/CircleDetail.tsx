import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, MessageCircle, Bell, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FooterNav from '@/components/FooterNav';
import CirclePosts from '@/components/circles/CirclePosts';
import CircleServices from '@/components/circles/CircleServices';
import CircleEvents from '@/components/circles/CircleEvents';
import CircleResources from '@/components/circles/CircleResources';
import CircleMembers from '@/components/circles/CircleMembers';
import CircleAbout from '@/components/circles/CircleAbout';
import { mockCircles } from '@/data/circles';
import { type TabKey } from '@/hooks/useAppNav';
interface CircleDetailProps {
  activeTab?: TabKey;
  onTabSelect?: (tab: TabKey) => void;
  onOpenCreate?: () => void;
}
const CircleDetail: React.FC<CircleDetailProps> = ({
  activeTab = "circles",
  onTabSelect = () => {},
  onOpenCreate = () => {}
}) => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [circleActiveTab, setCircleActiveTab] = useState('posts');
  const circle = mockCircles.find(c => c.id === id);
  if (!circle) {
    return <div className="min-h-[100dvh] w-full max-w-[480px] mx-auto bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Circle Not Found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>;
  }
  return <div className="min-h-[100dvh] w-full max-w-[480px] mx-auto bg-background text-foreground relative border-l border-r border-border pb-24">
      {/* Header with Banner and Profile */}
      <div className="relative">
        {/* Banner Background */}
        <div className="h-48 overflow-hidden relative">
          <img src={circle.coverImage} alt={circle.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Back Button */}
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 z-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* More Options Button */}
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 z-10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile Image - Centered and Overlapping */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-48">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-background shadow-lg">
            {circle.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="pt-14 px-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{circle.name}</h1>
          {circle.isExpert && <Badge variant="secondary">Expert</Badge>}
        </div>
        <p className="text-muted-foreground mb-4 leading-relaxed">{circle.description}</p>
        
        <div className="flex items-center justify-center gap-6 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{circle.members.toLocaleString()} members</span>
          </div>
          {circle.location && <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{circle.location}</span>
            </div>}
        </div>
      </div>

      {/* Creator Section */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {circle.creator.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate text-sm sm:text-base">
                {circle.creator.name}
              </p>
              <p className="text-sm text-muted-foreground">Circle Creator</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm">
              {circle.isJoined ? 'Joined' : 'Join Circle'}
            </Button>
            
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-border">
        <Tabs value={circleActiveTab} onValueChange={setCircleActiveTab} className="w-full">
          <div className="px-4 pt-4 flex items-center justify-between">
            <TabsList className="grid grid-cols-4 h-9 flex-1 mr-2">
              <TabsTrigger value="posts" className="text-xs px-1">Posts</TabsTrigger>
              <TabsTrigger value="services" className="text-xs px-1">Services</TabsTrigger>
              <TabsTrigger value="events" className="text-xs px-1">Events</TabsTrigger>
              <TabsTrigger value="about" className="text-xs px-1">About</TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCircleActiveTab('resources')}>
                  Resources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCircleActiveTab('members')}>
                  Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="min-h-[400px]">
            <TabsContent value="posts">
              <CirclePosts circle={circle} />
            </TabsContent>
            <TabsContent value="services">
              <CircleServices circle={circle} />
            </TabsContent>
            <TabsContent value="events">
              <CircleEvents circle={circle} />
            </TabsContent>
            <TabsContent value="resources">
              <CircleResources circle={circle} />
            </TabsContent>
            <TabsContent value="members">
              <CircleMembers circle={circle} />
            </TabsContent>
            <TabsContent value="about">
              <CircleAbout circle={circle} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer Navigation */}
      <FooterNav active={activeTab} onSelect={onTabSelect} onOpenCreate={onOpenCreate} />
    </div>;
};
export default CircleDetail;
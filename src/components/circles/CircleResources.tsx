import React, { useState } from 'react';
import { Download, FileText, Video, Image, Lock, Star, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CircleResourcesProps {
  circle: any;
}

const CircleResources: React.FC<CircleResourcesProps> = ({ circle }) => {
  const [filter, setFilter] = useState('all');

  const mockResources = [
    {
      id: '1',
      title: 'Startup Funding Guide 2024',
      description: 'Complete guide to raising seed and Series A funding',
      type: 'PDF',
      size: '2.5 MB',
      downloads: 156,
      isPremium: false,
      author: 'Sarah Chen',
      date: '2024-01-10',
      rating: 4.8,
      icon: FileText
    },
    {
      id: '2',
      title: 'Pitch Deck Masterclass',
      description: 'Video series on creating compelling pitch decks',
      type: 'Video',
      size: '450 MB',
      downloads: 89,
      isPremium: true,
      author: 'Sarah Chen',
      date: '2024-01-08',
      rating: 4.9,
      icon: Video
    },
    {
      id: '3',
      title: 'Market Research Template',
      description: 'Excel template for conducting market research',
      type: 'Excel',
      size: '1.2 MB',
      downloads: 203,
      isPremium: false,
      author: 'Alex Kumar',
      date: '2024-01-05',
      rating: 4.7,
      icon: FileText
    },
    {
      id: '4',
      title: 'UI Design Assets Pack',
      description: 'Collection of startup-focused design assets',
      type: 'ZIP',
      size: '15 MB',
      downloads: 67,
      isPremium: true,
      author: 'Emma Rodriguez',
      date: '2024-01-03',
      rating: 4.6,
      icon: Image
    }
  ];

  const filteredResources = filter === 'all' 
    ? mockResources 
    : filter === 'free' 
    ? mockResources.filter(r => !r.isPremium)
    : mockResources.filter(r => r.isPremium);

  const getIconComponent = (IconComponent: any) => {
    return <IconComponent className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Resources</h3>
        <Button size="sm">
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        <div className="max-h-[500px] overflow-y-auto">
          <TabsContent value={filter} className="space-y-4 mt-4 pr-2">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow mx-0">
                <CardHeader className="pb-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      {getIconComponent(resource.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <CardTitle className="text-base font-semibold leading-tight line-clamp-2 flex-1">
                          {resource.title}
                        </CardTitle>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {resource.isPremium && (
                            <Badge variant="default" className="text-xs">
                              <Lock className="h-2 w-2 mr-1" />
                              Premium
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {resource.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="truncate">by {resource.author}</span>
                        <span>{resource.size}</span>
                        <span>{resource.downloads} downloads</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{resource.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1 text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      {resource.isPremium ? 'Unlock' : 'Download'}
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">Preview</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </div>
      </Tabs>

      <Card className="border-dashed mt-4 mx-0">
        <CardContent className="p-4 text-center">
          <h4 className="font-medium mb-2">Share Your Resources</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upload helpful documents, videos, or tools for the community
          </p>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-1" />
            Upload Resource
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CircleResources;
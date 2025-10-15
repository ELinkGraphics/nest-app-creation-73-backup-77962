import React, { useState } from 'react';
import { Calendar, Clock, Users, Video, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CircleEventsProps {
  circle: any;
  isOwner: boolean;
}

const CircleEvents: React.FC<CircleEventsProps> = ({ circle, isOwner }) => {
  const [filter, setFilter] = useState('upcoming');

  const mockEvents = [
    {
      id: '1',
      title: 'Startup Pitch Workshop',
      description: 'Learn how to craft compelling pitches for investors',
      date: '2024-01-20',
      time: '2:00 PM PST',
      duration: '2 hours',
      attendees: 24,
      maxAttendees: 30,
      type: 'Workshop',
      platform: 'Zoom',
      price: 0,
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Q&A with Sarah Chen',
      description: 'Ask anything about scaling tech startups',
      date: '2024-01-25',
      time: '11:00 AM PST',
      duration: '1 hour',
      attendees: 45,
      maxAttendees: 50,
      type: 'Q&A',
      platform: 'Google Meet',
      price: 25,
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Networking Mixer',
      description: 'Virtual networking event for all circle members',
      date: '2024-01-15',
      time: '6:00 PM PST',
      duration: '90 min',
      attendees: 32,
      maxAttendees: 40,
      type: 'Networking',
      platform: 'Teams',
      price: 0,
      status: 'past'
    }
  ];

  const filteredEvents = mockEvents.filter(event => event.status === filter);

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Events</h3>
        {isOwner && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Create Event
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow mx-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant="outline">{event.type}</Badge>
                      {event.price > 0 && <Badge variant="default">${event.price}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>{event.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.attendees}/{event.maxAttendees}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button size="sm" className="flex-1">
                    {event.price > 0 ? 'Register' : 'Join Event'}
                  </Button>
                  <Button variant="outline" size="sm">Add to Calendar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="opacity-75 mx-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{event.date}</span>
                      <span>{event.attendees} attended</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button variant="outline" size="sm">View Recording</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <Card className="border-dashed mx-0">
            <CardContent className="p-6 text-center">
              <h4 className="font-medium mb-2">Suggest an Event</h4>
              <p className="text-sm text-muted-foreground mb-4">
                What kind of events would you like to see in this circle?
              </p>
              <Button variant="outline">Submit Suggestion</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CircleEvents;
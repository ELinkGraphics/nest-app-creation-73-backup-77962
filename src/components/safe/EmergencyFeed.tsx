import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Users, MessageCircle, Navigation } from 'lucide-react';
import { mockEmergencies } from '@/data/emergencies';

export const EmergencyFeed: React.FC = () => {
  const getTypeColor = (type: string) => {
    const colors = {
      medical: 'bg-red-100 text-red-800 border-red-200',
      safety: 'bg-orange-100 text-orange-800 border-orange-200',
      fire: 'bg-red-100 text-red-800 border-red-200',
      accident: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      natural: 'bg-blue-100 text-blue-800 border-blue-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-red-100 text-red-800',
      responding: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Active Emergencies</h2>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {mockEmergencies.filter(e => e.status === 'active').length} Active
        </Badge>
      </div>

      {mockEmergencies.map((emergency) => (
        <Card key={emergency.id} className="p-4 border-l-4 border-l-red-500">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {emergency.requester.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{emergency.requester.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(emergency.type)}>
                      {emergency.type}
                    </Badge>
                    <Badge className={getStatusColor(emergency.status)}>
                      {emergency.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {emergency.timeAgo}
              </div>
            </div>

            <p className="text-gray-700 text-sm">{emergency.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {emergency.distance}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {emergency.helpers} helpers
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {emergency.messages} messages
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              {emergency.status === 'active' && (
                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                  I can help
                </Button>
              )}
            </div>

            {emergency.helpers > 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <div className="flex -space-x-1">
                  {[...Array(Math.min(emergency.helpers, 3))].map((_, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="text-xs bg-green-100 text-green-800">
                        H{i + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-green-800">
                  {emergency.helpers} helper{emergency.helpers !== 1 ? 's' : ''} responding
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}

      {mockEmergencies.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Active Emergencies</h3>
            <p className="text-sm">Your community is safe right now</p>
          </div>
        </Card>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Clock, Users, MessageCircle, Navigation, Radio, Map, Heart, Shield, Flame, Car, Tornado, Zap } from 'lucide-react';
import { mockEmergencies } from '@/data/emergencies';
import { SOSMap } from './SOSMap';

export const SOSNearbyView: React.FC = () => {
  const [showMap, setShowMap] = useState(false);

  const getUrgencyColor = (priority: string) => {
    const colors = {
      low: 'bg-amber-100 text-amber-800 border-amber-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getUrgencyDot = (priority: string) => {
    const colors = {
      low: 'bg-amber-500',
      medium: 'bg-orange-500',
      high: 'bg-red-500',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      medical: 'bg-gradient-to-br from-red-500 to-red-600',
      safety: 'bg-gradient-to-br from-orange-500 to-orange-600',
      fire: 'bg-gradient-to-br from-red-600 to-red-700',
      accident: 'bg-gradient-to-br from-blue-500 to-blue-600',
      natural: 'bg-gradient-to-br from-purple-500 to-purple-600',
      other: 'bg-gradient-to-br from-gray-500 to-gray-600',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      medical: Heart,
      safety: Shield,
      fire: Flame,
      accident: Car,
      natural: Tornado,
      other: Zap,
    };
    return icons[type as keyof typeof icons] || Zap;
  };

  const activeEmergencies = mockEmergencies.filter(e => e.status === 'active');

  return (
    <div className="space-y-4">
      {/* Header with Live Badge and Map Toggle */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500 text-white animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
          <h2 className="text-lg font-semibold text-gray-900">
            {activeEmergencies.length} Active Nearby
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
          className="text-xs"
        >
          <Map className="h-4 w-4 mr-1" />
          {showMap ? 'List' : 'Map'}
        </Button>
      </div>

      {showMap ? (
        <div className="px-4">
          <SOSMap />
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {activeEmergencies.map((emergency) => (
            <Card key={emergency.id} className="p-4 border-l-4 border-l-red-500">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`h-12 w-12 rounded-xl ${getTypeColor(emergency.type)} shadow-lg flex items-center justify-center text-white backdrop-blur-sm`}>
                        {React.createElement(getTypeIcon(emergency.type), { className: "h-6 w-6" })}
                      </div>
                      <div className={`absolute -top-1 -right-1 h-4 w-4 ${getUrgencyDot(emergency.priority)} rounded-full border-2 border-white shadow-sm`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emergency.requester.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getUrgencyColor(emergency.priority)}>
                          {emergency.priority} priority
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {emergency.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {emergency.timeAgo}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                  {emergency.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    {emergency.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-500" />
                    {emergency.helpers} helping
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-purple-500" />
                    {emergency.messages} messages
                  </div>
                  {emergency.estimatedResponseTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      ETA: {emergency.estimatedResponseTime}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <Users className="h-4 w-4 mr-1" />
                    I can help
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Navigation className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Helper Status */}
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
                      {emergency.helpers > 3 && (
                        <div className="h-6 w-6 bg-green-200 border-2 border-white rounded-full flex items-center justify-center text-xs text-green-800 font-medium">
                          +{emergency.helpers - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-green-800 font-medium">
                      {emergency.helpers} helper{emergency.helpers !== 1 ? 's' : ''} responding
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {activeEmergencies.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Active Emergencies</h3>
                <p className="text-sm">Your community is safe right now</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
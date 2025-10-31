import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Users, Clock, Target, Zap, Plus, Minus, Heart, Shield, Flame, Car, Tornado, AlertTriangle, Share2 } from 'lucide-react';
import { useSOSAlerts } from '@/hooks/useSOSAlerts';
import { useSOSHelpers } from '@/hooks/useSOSHelpers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface SOSMapProps {
  userLat?: number | null;
  userLng?: number | null;
}

export const SOSMap: React.FC<SOSMapProps> = ({ userLat, userLng }) => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const { latitude: userLat2, longitude: userLng2, refreshLocation } = useGeolocation();
  const currentUserLat = userLat || userLat2;
  const currentUserLng = userLng || userLng2;
  const { alerts } = useSOSAlerts(currentUserLat, currentUserLng);
  const { respondToAlert } = useSOSHelpers();

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Fetch all active helpers with their current locations
  const { data: activeHelpers } = useQuery({
    queryKey: ['active-helpers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helper_profiles')
        .select(`
          user_id,
          location_lat,
          location_lng,
          availability_status,
          profiles:user_id (
            full_name,
            avatar_url,
            initials,
            avatar_color
          )
        `)
        .eq('is_available', true)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Real-time subscription for map updates
  useEffect(() => {
    const channel = supabase
      .channel('map-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_alerts',
        },
        () => {
          // Refetch alerts when changes occur
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'helper_profiles',
        },
        () => {
          // Refetch helpers when location updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const activeEmergencies = alerts.filter(e => e.status === 'active');

  const getUrgencyColor = (priority: string) => {
    const colors = {
      low: 'bg-yellow-500',
      medium: 'bg-orange-500',
      high: 'bg-red-500',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      medical: Heart,
      safety: Shield,
      fire: Flame,
      accident: Car,
      natural: Tornado,
      other: AlertTriangle,
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  const selectedEmergencyData = alerts.find(e => e.id === selectedEmergency);

  const handleShareLocation = () => {
    if (currentUserLat && currentUserLng) {
      const locationUrl = `https://www.google.com/maps?q=${currentUserLat},${currentUserLng}`;
      navigator.clipboard.writeText(locationUrl);
      toast.success('Location copied to clipboard');
    } else {
      toast.error('Location not available');
    }
  };

  const handleNavigate = () => {
    if (selectedEmergencyData?.location_lat && selectedEmergencyData?.location_lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${selectedEmergencyData.location_lat},${selectedEmergencyData.location_lng}`,
        '_blank'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="relative h-80 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-gray-100">
          {/* Street Grid */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-px bg-gray-300 opacity-30"
                style={{ top: `${(i + 1) * 12.5}%` }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-px bg-gray-300 opacity-30"
                style={{ left: `${(i + 1) * 16.66}%` }}
              />
            ))}
          </div>

          {/* Emergency Markers */}
          {alerts.map((emergency, index) => {
            const IconComponent = getTypeIcon(emergency.sos_type);
            return (
              <button
                key={emergency.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  selectedEmergency === emergency.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                style={{
                  left: `${25 + (index * 15)}%`,
                  top: `${30 + (index * 12)}%`
                }}
                onClick={() => setSelectedEmergency(
                  selectedEmergency === emergency.id ? null : emergency.id
                )}
              >
                <div className={`relative`}>
                  <div className={`h-10 w-10 ${getUrgencyColor(emergency.urgency)} rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {emergency.urgency === 'high' && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-40" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Helper Markers - Real Data */}
          {activeHelpers?.map((helper: any, i) => {
            const profile = helper.profiles;
            return (
              <div
                key={helper.user_id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-5"
                style={{
                  left: `${20 + (i * 18)}%`,
                  top: `${25 + (i * 15)}%`
                }}
              >
                <div className="relative">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white text-xs font-semibold"
                    style={{ backgroundColor: profile?.avatar_color || '#10b981' }}
                  >
                    {profile?.initials || 'H'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            );
          })}

          {/* User Location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400 opacity-30 scale-150" />
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white shadow-md"
            onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 18))}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white shadow-md"
            onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 10))}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Location Button */}
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            onClick={() => refreshLocation()}
          >
            <Target className="h-4 w-4 mr-1" />
            {currentUserLat && currentUserLng ? 'Refresh Location' : 'Find Me'}
          </Button>
        </div>
      </Card>

      {/* Map Legend */}
      <Card className="p-3">
        <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          Map Legend
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-red-500 rounded-full border border-white flex items-center justify-center">
              <AlertTriangle className="h-2 w-2 text-white" />
            </div>
            <span>High Priority SOS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-orange-500 rounded-full border border-white flex items-center justify-center">
              <AlertTriangle className="h-2 w-2 text-white" />
            </div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-green-500 rounded-full border border-white flex items-center justify-center">
              <Users className="h-2 w-2 text-white" />
            </div>
            <span>Available Helpers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-blue-500 rounded-full border border-white" />
            <span>Your Location</span>
          </div>
        </div>
      </Card>

      {/* Emergency Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-red-600">
            {alerts.filter(e => e.status === 'active').length}
          </div>
          <div className="text-xs text-muted-foreground">Active</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-green-600">{activeHelpers?.length || 0}</div>
          <div className="text-xs text-muted-foreground">Helpers</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {activeHelpers && activeHelpers.length > 0 ? '~5m' : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">Avg Response</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleShareLocation}>
          <Share2 className="h-4 w-4 mr-1" />
          Share Location
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleNavigate}
          disabled={!selectedEmergencyData}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Navigate
        </Button>
      </div>

      {/* Selected Emergency Details */}
      {selectedEmergencyData && (
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{selectedEmergencyData.profiles?.full_name || 'Anonymous'}</h3>
                <Badge className={`${getUrgencyColor(selectedEmergencyData.urgency)} text-white text-xs`}>
                  {selectedEmergencyData.urgency} priority
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(selectedEmergencyData.created_at), { addSuffix: true })}</span>
            </div>
            
            <p className="text-sm text-gray-700">{selectedEmergencyData.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {selectedEmergencyData.distance ? `${selectedEmergencyData.distance} km` : selectedEmergencyData.location_address}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedEmergencyData.sos_type}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                I can help
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
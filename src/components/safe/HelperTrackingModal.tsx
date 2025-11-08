import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, Star, Clock, Navigation, X, Loader2 } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useAutoHelperRequest } from '@/hooks/useAutoHelperRequest';
import { useHelperRequests } from '@/hooks/useHelperRequests';
import { AutoRequestProgress } from './AutoRequestProgress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HelperTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string;
  alertLat: number;
  alertLng: number;
  helpers: any[];
}

export const HelperTrackingModal: React.FC<HelperTrackingModalProps> = ({
  isOpen,
  onClose,
  alertId,
  alertLat,
  alertLng,
  helpers,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const requesterMarker = useRef<mapboxgl.Marker | null>(null);
  const helperMarker = useRef<mapboxgl.Marker | null>(null);
  
  const { data: mapboxToken } = useMapboxToken();
  const { sentRequests } = useHelperRequests(alertId);
  const autoRequest = useAutoHelperRequest({
    helpers,
    alertId,
    userLat: alertLat,
    userLng: alertLng,
  });

  const [acceptedHelper, setAcceptedHelper] = useState<any>(null);
  const [helperLocation, setHelperLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Check for accepted helper
  useEffect(() => {
    const accepted = sentRequests?.find(req => req.status === 'accepted');
    if (accepted) {
      setAcceptedHelper(accepted);
      autoRequest.stopRequesting();
    }
  }, [sentRequests]);

  // Fetch helper's real-time location
  const { data: helperProfile } = useQuery({
    queryKey: ['helper-location', acceptedHelper?.helper_id],
    queryFn: async () => {
      if (!acceptedHelper) return null;

      const { data, error } = await supabase
        .from('helper_profiles')
        .select('user_id, location_lat, location_lng')
        .eq('user_id', acceptedHelper.helper_id)
        .single();

      if (error) throw error;

      // Fetch profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url, initials, avatar_color')
        .eq('id', data.user_id)
        .single();

      return { ...data, profiles: profile };
    },
    enabled: !!acceptedHelper,
    refetchInterval: 3000, // Update every 3 seconds
  });

  // Update helper location when data changes
  useEffect(() => {
    if (helperProfile?.location_lat && helperProfile?.location_lng) {
      setHelperLocation({
        lat: helperProfile.location_lat,
        lng: helperProfile.location_lng,
      });
    }
  }, [helperProfile]);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [alertLng, alertLat],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isOpen, mapboxToken, alertLat, alertLng]);

  // Add/Update requester marker
  useEffect(() => {
    if (!map.current || !alertLat || !alertLng) return;

    if (requesterMarker.current) {
      requesterMarker.current.setLngLat([alertLng, alertLat]);
    } else {
      const el = document.createElement('div');
      el.className = 'requester-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 bg-red-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>
        </div>
      `;

      requesterMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([alertLng, alertLat])
        .addTo(map.current);
    }
  }, [alertLat, alertLng]);

  // Add/Update helper marker
  useEffect(() => {
    if (!map.current || !helperLocation) return;

    if (helperMarker.current) {
      helperMarker.current.setLngLat([helperLocation.lng, helperLocation.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'helper-marker';
      const profile = helperProfile?.profiles;
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold" style="background-color: ${profile?.avatar_color || '#10b981'}">
            ${profile?.initials || 'H'}
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      `;

      helperMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([helperLocation.lng, helperLocation.lat])
        .addTo(map.current);
    }

    // Fit bounds to show both markers
    if (requesterMarker.current && helperMarker.current) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([alertLng, alertLat]);
      bounds.extend([helperLocation.lng, helperLocation.lat]);
      map.current?.fitBounds(bounds, { padding: 100 });
    }
  }, [helperLocation, helperProfile]);

  // Calculate distance and ETA
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = helperLocation
    ? calculateDistance(alertLat, alertLng, helperLocation.lat, helperLocation.lng)
    : null;
  
  const eta = distance ? Math.ceil(distance / 0.5) : null; // Assuming 30 km/h average speed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Helper Tracking</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden">
          {/* Map */}
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Helper Info Card */}
          {acceptedHelper && helperProfile && (
            <Card className="absolute top-4 left-4 right-4 z-10 p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-green-500">
                  <AvatarImage src={helperProfile.profiles?.avatar_url || ''} />
                  <AvatarFallback style={{ backgroundColor: helperProfile.profiles?.avatar_color }}>
                    {helperProfile.profiles?.initials || 'H'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        {helperProfile.profiles?.name || 'Helper'}
                      </h3>
                      <Badge className="bg-green-500 text-white mt-1">
                        On the way
                      </Badge>
                    </div>
                    {distance && eta && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {eta} min
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {distance.toFixed(1)} km away
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Tracking live location</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Request in Progress */}
          {autoRequest.isRequesting && !acceptedHelper && (
            <Card className="absolute bottom-4 left-4 right-4 z-10 p-4 shadow-lg bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                <div className="flex-1">
                  <h4 className="font-semibold">Requesting Helper...</h4>
                  <p className="text-sm text-muted-foreground">
                    Trying helper {autoRequest.currentHelperIndex}/{autoRequest.totalHelpers} • {autoRequest.timeRemaining}s remaining
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={autoRequest.stopRequesting}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* No Helper Yet - Start Request */}
          {!autoRequest.isRequesting && !acceptedHelper && (
            <Card className="absolute bottom-4 left-4 right-4 z-10 p-4 shadow-lg">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                onClick={autoRequest.startRequesting}
                disabled={!helpers || helpers.length === 0}
              >
                <Phone className="h-5 w-5 mr-2" />
                Request Helper Automatically
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                We'll contact nearby helpers one by one until someone accepts
              </p>
            </Card>
          )}
        </div>

        {/* Auto Request Progress Modal */}
        <AutoRequestProgress
          isRequesting={autoRequest.isRequesting}
          currentHelper={autoRequest.currentHelper}
          timeRemaining={autoRequest.timeRemaining}
          totalElapsed={autoRequest.totalElapsed}
          currentHelperIndex={autoRequest.currentHelperIndex}
          totalHelpers={autoRequest.totalHelpers}
          onCancel={autoRequest.stopRequesting}
        />
      </DialogContent>
    </Dialog>
  );
};

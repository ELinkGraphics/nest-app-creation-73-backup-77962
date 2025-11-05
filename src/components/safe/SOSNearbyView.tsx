import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Clock, Users, MessageCircle, Navigation, Radio, Map, Heart, Shield, Flame, Car, Tornado, Zap, CheckCircle, XCircle } from 'lucide-react';
import { SOSMapInteractive } from './SOSMapInteractive';
import { SOSMessaging } from './SOSMessaging';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSOSAlerts } from '@/hooks/useSOSAlerts';
import { useSOSHelpers } from '@/hooks/useSOSHelpers';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export const SOSNearbyView: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<Set<string>>(new Set());
  
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const { alerts, isLoading: alertsLoading, updateAlertStatus } = useSOSAlerts(latitude, longitude);
  const { respondToAlert, checkExistingResponse } = useSOSHelpers();

  // Get current user
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Check which alerts the current user has already responded to
  React.useEffect(() => {
    const checkUserResponses = async () => {
      if (!userId || !alerts) return;

      const responses = new Set<string>();
      for (const alert of alerts) {
        const hasResponded = await checkExistingResponse(alert.id, userId);
        if (hasResponded) {
          responses.add(alert.id);
        }
      }
      setUserResponses(responses);
    };

    checkUserResponses();
  }, [alerts, userId, checkExistingResponse]);

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
      lost: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      emergency: 'bg-gradient-to-br from-red-500 to-red-600',
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
      lost: MapPin,
      emergency: Zap,
      other: Zap,
    };
    return icons[type as keyof typeof icons] || Zap;
  };

  const handleRespond = async (alertId: string) => {
    if (!latitude || !longitude) {
      toast.error('Location not available');
      return;
    }
    
    respondToAlert.mutate(
      {
        alert_id: alertId,
        current_lat: latitude,
        current_lng: longitude,
      },
      {
        onSuccess: () => {
          toast.success('Response sent! Stay safe.', {
            icon: '✓',
            duration: 3000,
          });
          // Add to user responses immediately for better UX
          setUserResponses(prev => new Set(prev).add(alertId));
        },
        onError: () => {
          toast.error('Failed to send response. Please try again.');
        },
      }
    );
  };

  const handleResolveAlert = async (alertId: string) => {
    updateAlertStatus.mutate(
      { alertId, status: 'resolved' },
      {
        onSuccess: () => {
          toast.success('Emergency resolved successfully', { icon: '✓' });
        },
      }
    );
  };

  const handleCancelAlert = async (alertId: string) => {
    updateAlertStatus.mutate(
      { alertId, status: 'cancelled' },
      {
        onSuccess: () => {
          toast.success('Alert cancelled', { icon: '✓' });
        },
      }
    );
  };

  const handleNavigate = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    );
  };

  const isAlertCreator = (emergency: any) => {
    return userId && emergency.user_id === userId;
  };

  const activeEmergencies = alerts.filter(e => e.status === 'active');

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
          <SOSMapInteractive userLat={latitude} userLng={longitude} />
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {alertsLoading || locationLoading ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">Loading emergencies...</div>
            </Card>
          ) : activeEmergencies.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Active Emergencies</h3>
                <p className="text-sm">Your community is safe right now</p>
              </div>
            </Card>
          ) : (
            activeEmergencies.map((emergency) => (
              <Card key={emergency.id} className="p-4 border-l-4 border-l-red-500">
                <div className="space-y-3">
                   {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`h-12 w-12 rounded-xl ${getTypeColor(emergency.sos_type)} shadow-lg flex items-center justify-center text-white backdrop-blur-sm`}>
                          {React.createElement(getTypeIcon(emergency.sos_type), { className: "h-6 w-6" })}
                        </div>
                        <div className={`absolute -top-1 -right-1 h-4 w-4 ${getUrgencyDot(emergency.urgency)} rounded-full border-2 border-white shadow-sm ${emergency.urgency === 'high' ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {emergency.profiles?.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getUrgencyColor(emergency.urgency)}>
                            {emergency.urgency} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {emergency.sos_type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              emergency.status === 'active' 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : emergency.status === 'responding'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            {emergency.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(emergency.created_at), { addSuffix: true })}
                      </div>
                      {(Date.now() - new Date(emergency.created_at).getTime()) < 5 * 60 * 1000 && (
                        <Badge className="bg-red-500 text-white text-xs animate-pulse">NEW</Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                    {emergency.description}
                  </p>

                  {/* Photos */}
                  {emergency.photo_urls && emergency.photo_urls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {emergency.photo_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Emergency photo ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {emergency.distance && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        {emergency.distance} km away
                      </div>
                    )}
                    {emergency.location_address && (
                      <div className="flex items-center gap-1 truncate max-w-[150px]">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        {emergency.location_address}
                      </div>
                    )}
                    {emergency.helper_count > 0 && (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <Users className="h-3 w-3" />
                        {emergency.helper_count} responding
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isAlertCreator(emergency) ? (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        onClick={() => handleResolveAlert(emergency.id)}
                        disabled={updateAlertStatus.isPending}
                      >
                        {updateAlertStatus.isPending ? (
                          <div className="h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Mark Resolved
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleCancelAlert(emergency.id)}
                        disabled={updateAlertStatus.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {userResponses.has(emergency.id) ? (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-100 text-green-700 border-green-300 cursor-not-allowed"
                          disabled
                        >
                          ✓ Responding
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          onClick={() => handleRespond(emergency.id)}
                          disabled={respondToAlert.isPending || !latitude || !longitude}
                        >
                          {respondToAlert.isPending ? (
                            <div className="h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Users className="h-4 w-4 mr-1" />
                          )}
                          I can help
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleNavigate(emergency.location_lat, emergency.location_lng)}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedAlertId(emergency.id);
                          setShowMessaging(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Messaging Dialog */}
      <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Messages</DialogTitle>
          </DialogHeader>
          {selectedAlertId && (
            <SOSMessaging
              alertId={selectedAlertId} 
              onClose={() => setShowMessaging(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Bell, BellOff, Clock, MapPin } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const { preferences, updatePreferences } = useNotificationPreferences(userId || undefined);

  const [enabled, setEnabled] = useState(true);
  const [sosAlerts, setSosAlerts] = useState(true);
  const [helperResponses, setHelperResponses] = useState(true);
  const [alertUpdates, setAlertUpdates] = useState(true);
  const [emergencyContactAlerts, setEmergencyContactAlerts] = useState(true);
  const [maxDistance, setMaxDistance] = useState(10);
  const [quietHoursStart, setQuietHoursStart] = useState('');
  const [quietHoursEnd, setQuietHoursEnd] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (preferences) {
      setEnabled(preferences.enabled);
      setSosAlerts(preferences.sos_alerts);
      setHelperResponses(preferences.helper_responses);
      setAlertUpdates(preferences.alert_updates);
      setEmergencyContactAlerts(preferences.emergency_contact_alerts);
      setMaxDistance(preferences.max_distance_km);
      setQuietHoursStart(preferences.quiet_hours_start || '');
      setQuietHoursEnd(preferences.quiet_hours_end || '');
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences.mutate({
      enabled,
      sos_alerts: sosAlerts,
      helper_responses: helperResponses,
      alert_updates: alertUpdates,
      emergency_contact_alerts: emergencyContactAlerts,
      max_distance_km: maxDistance,
      quiet_hours_start: quietHoursStart || null,
      quiet_hours_end: quietHoursEnd || null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {enabled ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <Label className="font-semibold">Enable Notifications</Label>
                <p className="text-xs text-gray-600">Receive all notifications</p>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Notification Types</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">SOS Alerts Nearby</Label>
                <Switch
                  checked={sosAlerts}
                  onCheckedChange={setSosAlerts}
                  disabled={!enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Helper Responses</Label>
                <Switch
                  checked={helperResponses}
                  onCheckedChange={setHelperResponses}
                  disabled={!enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Alert Updates</Label>
                <Switch
                  checked={alertUpdates}
                  onCheckedChange={setAlertUpdates}
                  disabled={!enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Emergency Contact Alerts</Label>
                <Switch
                  checked={emergencyContactAlerts}
                  onCheckedChange={setEmergencyContactAlerts}
                  disabled={!enabled}
                />
              </div>
            </div>
          </div>

          {/* Distance Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <Label className="font-medium text-sm">Alert Distance Range</Label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[maxDistance]}
                onValueChange={([value]) => setMaxDistance(value)}
                min={1}
                max={50}
                step={1}
                disabled={!enabled || !sosAlerts}
                className="w-full"
              />
              <p className="text-sm text-gray-600 text-center">
                Notify me about alerts within <span className="font-semibold">{maxDistance} km</span>
              </p>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <Label className="font-medium text-sm">Quiet Hours</Label>
            </div>
            <p className="text-xs text-gray-600">
              Only receive critical (high urgency) alerts during these hours
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600">Start Time</Label>
                <Input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  disabled={!enabled}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">End Time</Label>
                <Input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  disabled={!enabled}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending}
            className="flex-1"
          >
            {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

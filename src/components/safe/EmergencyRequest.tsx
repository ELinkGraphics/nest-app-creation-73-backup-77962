import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Phone, Clock, Camera } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EMERGENCY_TYPES = [
  { id: 'medical', label: 'Medical Emergency', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'safety', label: 'Personal Safety', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'fire', label: 'Fire/Hazard', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'accident', label: 'Accident', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'natural', label: 'Natural Disaster', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'other', label: 'Other Emergency', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export const EmergencyRequest: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !description) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    // Reset form
    setSelectedType('');
    setDescription('');
    setLocation('');
    
    alert('Emergency request sent! Help is on the way.');
  };

  return (
    <div className="px-4 space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          For life-threatening emergencies, call 911 immediately
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Request Emergency Help</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Emergency Type</label>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedType === type.id 
                      ? type.color 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Describe the situation
            </label>
            <Textarea
              id="description"
              placeholder="Please provide details about what's happening..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Share Location
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Add Photo
            </Button>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Location sharing enabled - helpers can find you
            </span>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!selectedType || !description || isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Help Request...
              </div>
            ) : (
              'Send Emergency Request'
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Quick Emergency Contacts</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start text-blue-800 border-blue-300">
            <Phone className="h-4 w-4 mr-2" />
            Emergency Services - 911
          </Button>
          <Button variant="outline" className="w-full justify-start text-blue-800 border-blue-300">
            <Phone className="h-4 w-4 mr-2" />
            Poison Control - 1-800-222-1222
          </Button>
        </div>
      </Card>
    </div>
  );
};
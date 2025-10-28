import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, MapPin, Phone, Share2, Camera, Send, X, Heart, Shield, Search, Siren, Clock, Target, Users, User, Timer, AlertCircle, Baby, Bandage, Stethoscope, Home, Eye, UserX, Flame, Cloud, Car } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSOSAlerts } from '@/hooks/useSOSAlerts';

interface SOSCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sosType: string;
  subCategory?: string;
}

export const SOSCreationModal: React.FC<SOSCreationModalProps> = ({
  isOpen,
  onClose,
  sosType,
  subCategory
}) => {
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('high');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [shareLocation, setShareLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Category-specific fields
  const [personAge, setPersonAge] = useState('');
  const [personDescription, setPersonDescription] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [injuryType, setInjuryType] = useState('');
  const [consciousLevel, setConsciousLevel] = useState('');
  const [threatActive, setThreatActive] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  
  const { triggerHaptic } = useHapticFeedback();
  const { latitude, longitude, refreshLocation } = useGeolocation();
  const { createAlert } = useSOSAlerts();

  const urgencyLevels = [
    { 
      value: 'low', 
      label: 'Low', 
      color: 'bg-amber-500', 
      description: 'Non-urgent assistance needed',
      icon: Clock
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      color: 'bg-orange-500', 
      description: 'Moderate urgency',
      icon: AlertTriangle
    },
    { 
      value: 'high', 
      label: 'High', 
      color: 'bg-red-500', 
      description: 'Immediate attention required',
      icon: Siren
    }
  ];

  const sosTypes = {
    medical: { icon: Heart, label: 'Medical Emergency', color: 'text-red-600' },
    safety: { icon: Shield, label: 'Safety Alert', color: 'text-orange-600' },
    lost: { icon: Search, label: 'Lost Person', color: 'text-amber-600' },
    emergency: { icon: Siren, label: 'General Emergency', color: 'text-red-600' }
  };

  const currentType = sosTypes[sosType as keyof typeof sosTypes] || sosTypes.emergency;

  // Smart suggestions based on SOS type
  const getSuggestions = () => {
    switch (sosType) {
      case 'medical':
        return [
          'Chest pain or discomfort',
          'Difficulty breathing',
          'Severe headache',
          'Loss of consciousness',
          'Severe bleeding',
          'Broken bone suspected',
          'Allergic reaction',
          'Heart attack symptoms',
          'Stroke symptoms',
          'Severe abdominal pain',
          'Fall from height',
          'Car accident injuries',
          'Choking incident',
          'Diabetic emergency',
          'Overdose suspected'
        ];
      case 'lost':
        return [
          'Child missing from playground',
          'Elderly person with dementia',
          'Missing at shopping mall',
          'Lost while hiking',
          'Missing from school',
          'Wandered from home',
          'Lost at festival/event',
          'Missing from hospital',
          'Lost at beach/park',
          'Missing person has medical condition',
          'Person in wheelchair missing',
          'Missing with their pet',
          'Lost during family trip'
        ];
      case 'safety':
        return [
          'Suspicious person following me',
          'Domestic violence situation',
          'Threats being made',
          'Being harassed',
          'Unsafe building conditions',
          'Gas leak suspected',
          'Fire hazard present',
          'Aggressive animal',
          'Road accident blocking traffic',
          'Flooding in area',
          'Power lines down',
          'Chemical spill',
          'Violent behavior witnessed',
          'Unsafe workplace conditions'
        ];
      case 'emergency':
        return [
          'Natural disaster occurring',
          'Building collapse',
          'Multiple casualties',
          'Explosion heard',
          'Large fire spreading',
          'Severe weather emergency',
          'Bridge or road collapse',
          'Mass casualty incident',
          'Terrorist activity suspected',
          'Hazmat situation',
          'Evacuation needed',
          'Public safety threat',
          'Infrastructure failure'
        ];
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(false);

  const insertSuggestion = (suggestion: string) => {
    const currentText = sosType === 'lost' ? personDescription : description;
    const newText = currentText ? `${currentText}. ${suggestion}` : suggestion;
    
    if (sosType === 'lost') {
      setPersonDescription(newText);
    } else {
      setDescription(newText);
    }
    setSelectedSuggestion(true);
    setShowSuggestions(false);
    triggerHaptic('light');
  };

  const handleTextareaFocus = () => {
    console.log('Textarea focused, showSuggestions will be:', !selectedSuggestion);
    if (!selectedSuggestion) {
      setShowSuggestions(true);
    }
  };

  const handleTextareaBlur = () => {
    console.log('Textarea blurred, hiding suggestions in 150ms');
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const getRequiredFields = () => {
    switch (sosType) {
      case 'medical':
        return ['description'];
      case 'lost':
        return ['personDescription', 'lastSeen'];
      case 'safety':
        return ['description'];
      case 'emergency':
        return ['description'];
      default:
        return ['description'];
    }
  };

  const isFormValid = () => {
    const required = getRequiredFields();
    const values = {
      description,
      personDescription,
      lastSeen,
      injuryType,
      consciousLevel
    };
    
    return required.every(field => values[field as keyof typeof values]?.trim());
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    triggerHaptic('success');
    
    await createAlert.mutateAsync({
      sos_type: sosType,
      sub_category: subCategory,
      urgency,
      description,
      location_lat: latitude,
      location_lng: longitude,
      location_address: location,
      share_live_location: shareLocation,
      person_age: personAge,
      person_description: personDescription,
      last_seen: lastSeen,
      injury_type: injuryType,
      conscious_level: consciousLevel,
      threat_active: threatActive,
    });
    
    onClose();
    
    // Reset form
    setDescription('');
    setLocation('');
    setPersonAge('');
    setPersonDescription('');
    setLastSeen('');
    setInjuryType('');
    setConsciousLevel('');
    setUrgency('high');
    setPhotos([]);
  };

  const handleEmergencyCall = () => {
    triggerHaptic('heavy');
    window.open('tel:911', '_self');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setPhotos(prev => [...prev, ...files].slice(0, 3)); // Max 3 photos
      triggerHaptic('light');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    triggerHaptic('light');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-lg ${currentType.color} bg-opacity-10`}>
              <currentType.icon className={`h-6 w-6 ${currentType.color}`} />
            </div>
            {currentType.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Emergency Alert</p>
                <p className="text-xs">This will notify nearby helpers immediately.</p>
              </div>
            </div>
          </div>

          {/* Category-specific forms */}
          {sosType === 'medical' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="injury">What happened? *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        id="injury"
                        placeholder="Brief description (e.g., fell down stairs, chest pain, difficulty breathing)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={handleTextareaFocus}
                        rows={2}
                        className="resize-none pr-10"
                      />
                      <div className="absolute bottom-2 right-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="medical-photo-upload"
                        />
                        <label
                          htmlFor="medical-photo-upload"
                          className="flex items-center justify-center w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                        >
                          <Camera className="h-4 w-4 text-primary" />
                        </label>
                      </div>
                    </div>
                    
                    {/* Inline Suggestions */}
                    {showSuggestions && (
                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md border">
                        <span className="text-xs text-gray-600 w-full mb-1">Tap to add:</span>
                        {suggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertSuggestion(suggestion)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Person conscious?</Label>
                  <div className="flex gap-2">
                    {['Yes', 'No', 'Unclear'].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={consciousLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConsciousLevel(level)}
                        className="flex-1 text-xs"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Age (approx)</Label>
                  <Input
                    placeholder="e.g., 25"
                    value={personAge}
                    onChange={(e) => setPersonAge(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {sosType === 'lost' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="person-desc">Who is missing? *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        id="person-desc"
                        placeholder="Name, age, appearance, what they're wearing"
                        value={personDescription}
                        onChange={(e) => setPersonDescription(e.target.value)}
                        onFocus={handleTextareaFocus}
                        rows={2}
                        className="resize-none pr-10"
                      />
                      <div className="absolute bottom-2 right-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="lost-photo-upload-inline"
                        />
                        <label
                          htmlFor="lost-photo-upload-inline"
                          className="flex items-center justify-center w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                        >
                          <Camera className="h-4 w-4 text-primary" />
                        </label>
                      </div>
                    </div>
                    
                    {/* Inline Suggestions */}
                    {showSuggestions && (
                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md border">
                        <span className="text-xs text-gray-600 w-full mb-1">Tap to add:</span>
                        {suggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertSuggestion(suggestion)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last-seen">When & where last seen? *</Label>
                <Input
                  id="last-seen"
                  placeholder="e.g., 2 hours ago at Central Mall"
                  value={lastSeen}
                  onChange={(e) => setLastSeen(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  placeholder="Age of missing person"
                  value={personAge}
                  onChange={(e) => setPersonAge(e.target.value)}
                />
              </div>

            </>
          )}

          {sosType === 'safety' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="threat">What's the threat? *</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        id="threat"
                        placeholder="Brief description of the danger or threat"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={handleTextareaFocus}
                        rows={2}
                        className="resize-none pr-10"
                      />
                      <div className="absolute bottom-2 right-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="safety-photo-upload-inline"
                        />
                        <label
                          htmlFor="safety-photo-upload-inline"
                          className="flex items-center justify-center w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                        >
                          <Camera className="h-4 w-4 text-primary" />
                        </label>
                      </div>
                    </div>
                    
                    {/* Inline Suggestions */}
                    {showSuggestions && (
                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md border">
                        <span className="text-xs text-gray-600 w-full mb-1">Tap to add:</span>
                        {suggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertSuggestion(suggestion)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Threat still active?</span>
                </div>
                <Switch
                  checked={threatActive}
                  onCheckedChange={setThreatActive}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

            </>
          )}

          {sosType === 'emergency' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="emergency-desc">What's the emergency? *</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Textarea
                      id="emergency-desc"
                      placeholder="Brief description of the emergency situation"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={handleTextareaFocus}
                      rows={2}
                      className="resize-none pr-10"
                    />
                    <div className="absolute bottom-2 right-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="emergency-photo-upload"
                      />
                      <label
                        htmlFor="emergency-photo-upload"
                        className="flex items-center justify-center w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <Camera className="h-4 w-4 text-primary" />
                      </label>
                    </div>
                  </div>
                  
                  {/* Inline Suggestions */}
                  {showSuggestions && (
                    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md border">
                      <span className="text-xs text-gray-600 w-full mb-1">Tap to add:</span>
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertSuggestion(suggestion)}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>How many people affected?</Label>
                <div className="flex gap-2">
                  {['1', '2-5', '5+', 'Unknown'].map((count) => (
                    <Button
                      key={count}
                      type="button"
                      variant={personAge === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPersonAge(count)}
                      className="flex-1 text-xs"
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Enter or confirm your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-3"
                onClick={() => {
                  // Simulate getting current location
                  setLocation('Current Location: 123 Main St, San Francisco, CA');
                  triggerHaptic('light');
                }}
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-secondary" />
                <span className="text-sm">Share live location</span>
              </div>
              <Switch
                checked={shareLocation}
                onCheckedChange={setShareLocation}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          {/* Quick Action for Emergency Call */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            onClick={handleEmergencyCall}
          >
            <Phone className="h-4 w-4 mr-2" />
            Need Immediate Help? Call 911
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={!isFormValid() || createAlert.isPending}
            >
              {createAlert.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send SOS Alert
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
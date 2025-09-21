import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, MessageCircle, Phone, Star, Navigation } from 'lucide-react';

const HELPER_SKILLS = [
  'First Aid Certified',
  'CPR Certified',
  'Medical Professional',
  'Emergency Responder',
  'Local Guide',
  'Translator',
  'Vehicle Available',
  'Tools Available',
];

export const HelperResponse: React.FC = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');
  const [responseMessage, setResponseMessage] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const getAvailabilityColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      offline: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="px-4 space-y-6">
      {/* Helper Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Helper Status</h2>
          <Badge className={getAvailabilityColor(availability)}>
            {availability}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Availability Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['available', 'busy', 'offline'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAvailability(status as any)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    availability === status 
                      ? getAvailabilityColor(status)
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Skills & Certifications
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HELPER_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Response */}
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Currently Responding</h3>
          <Badge className="bg-blue-100 text-blue-800">En Route</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-semibold">
               JS
             </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">John Smith</p>
              <p className="text-sm text-gray-600">Medical Emergency - Chest pain</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  0.5 miles away
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ETA: 3 min
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline">
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
            <Button size="sm" variant="outline">
              <Navigation className="h-4 w-4 mr-1" />
              Navigate
            </Button>
          </div>

          <div>
            <label htmlFor="response" className="text-sm font-medium text-gray-700 mb-2 block">
              Update Status
            </label>
            <Textarea
              id="response"
              placeholder="Let them know your ETA or any updates..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={2}
            />
            <Button size="sm" className="mt-2 w-full">
              Send Update
            </Button>
          </div>
        </div>
      </Card>

      {/* Helper Stats */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-3">Your Helper Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">47</div>
            <div className="text-xs text-gray-600">Helped</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-yellow-600">4.9</span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">2.3</div>
            <div className="text-xs text-gray-600">Avg Response</div>
          </div>
        </div>
      </Card>

      {/* Recent Responses */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-3">Recent Responses</h3>
        <div className="space-y-3">
          {[
            { id: 1, type: 'Medical', status: 'Completed', time: '2 hours ago', rating: 5 },
            { id: 2, type: 'Accident', status: 'Completed', time: '1 day ago', rating: 5 },
            { id: 3, type: 'Safety', status: 'Completed', time: '3 days ago', rating: 4 },
          ].map((response) => (
            <div key={response.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{response.type} Emergency</p>
                <p className="text-xs text-gray-500">{response.time}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  {response.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{response.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
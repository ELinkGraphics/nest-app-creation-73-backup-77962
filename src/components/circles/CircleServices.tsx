import React from 'react';
import { Star, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CircleServicesProps {
  circle: any;
}

const CircleServices: React.FC<CircleServicesProps> = ({ circle }) => {
  const mockServices = [
    {
      id: '1',
      title: 'Startup Strategy Consultation',
      description: 'One-on-one strategy session to help scale your startup',
      price: 150,
      rating: 4.9,
      reviews: 42,
      duration: '60 min',
      category: 'Consulting'
    },
    {
      id: '2',
      title: 'Product Launch Workshop',
      description: 'Comprehensive workshop covering product launch strategies',
      price: 299,
      rating: 4.8,
      reviews: 28,
      duration: '3 hours',
      category: 'Workshop'
    },
    {
      id: '3',
      title: 'Tech Stack Review',
      description: 'Professional review of your technology stack and recommendations',
      price: 200,
      rating: 5.0,
      reviews: 15,
      duration: '90 min',
      category: 'Review'
    }
  ];

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Services & Offerings</h3>
        <Button size="sm">Request Custom Service</Button>
      </div>

      {mockServices.map((service) => (
        <Card key={service.id} className="hover:shadow-md transition-shadow mx-0">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{service.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground">({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{service.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                </div>
                <Badge variant="outline">{service.category}</Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Button size="sm" className="flex-1">Book Session</Button>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed mx-0">
        <CardContent className="p-6 text-center">
          <h4 className="font-medium mb-2">Need Something Custom?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Request a custom service tailored to your specific needs
          </p>
          <Button variant="outline">Submit Custom Request</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CircleServices;
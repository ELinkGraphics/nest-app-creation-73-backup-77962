import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubscribeCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onSubscribed: () => void;
}

export const SubscribeCircleModal: React.FC<SubscribeCircleModalProps> = ({
  isOpen,
  onClose,
  circleId,
  circleName,
  onSubscribed,
}) => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setIsSubscribing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_subscriptions')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          status: 'active',
        });

      if (error) {
        // If already subscribed, update status
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('circle_subscriptions')
            .update({ status: 'active', expires_at: null })
            .eq('circle_id', circleId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      toast({
        title: "Subscribed successfully!",
        description: `You now have access to premium content in ${circleName}`,
      });

      onSubscribed();
      onClose();
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Subscribe to {circleName}
          </DialogTitle>
          <DialogDescription>
            Get access to premium content and exclusive posts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">What you'll get:</h4>
            <ul className="space-y-2">
              {[
                'Access to all premium posts',
                'Exclusive content from circle owner',
                'Early access to announcements',
                'Support the circle community',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubscribing}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={isSubscribing} className="gap-2">
              <Crown className="w-4 h-4" />
              {isSubscribing ? 'Subscribing...' : 'Subscribe Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

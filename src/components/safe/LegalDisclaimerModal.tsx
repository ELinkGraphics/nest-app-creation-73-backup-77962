import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield } from 'lucide-react';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  type: 'helper' | 'requester';
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  type,
}) => {
  const [accepted, setAccepted] = React.useState(false);

  const helperTerms = {
    title: 'Helper Terms of Service & Liability Waiver',
    sections: [
      {
        title: 'Voluntary Participation',
        content: 'By responding to emergency alerts, you acknowledge that you are volunteering to help and are not required or obligated to respond to any alert.',
      },
      {
        title: 'No Professional Obligation',
        content: 'This platform does not replace professional emergency services (911, police, fire, medical). Always call professional emergency services for serious emergencies.',
      },
      {
        title: 'Liability Release',
        content: 'You agree to release, indemnify, and hold harmless the platform, its operators, and other users from any claims, damages, or losses arising from your participation as a helper, including but not limited to personal injury, property damage, or financial loss.',
      },
      {
        title: 'Personal Safety',
        content: 'You are solely responsible for your own safety. Do not put yourself in dangerous situations. If you feel unsafe, do not respond or immediately leave the situation and contact proper authorities.',
      },
      {
        title: 'Accuracy of Information',
        content: 'While we strive to provide accurate information, we cannot guarantee the accuracy of user-provided information. Use your judgment when responding to alerts.',
      },
      {
        title: 'Data Privacy',
        content: 'Your location and response information will be shared with the person requesting help. By accepting, you consent to this data sharing.',
      },
    ],
  };

  const requesterTerms = {
    title: 'Emergency Alert Terms of Service',
    sections: [
      {
        title: 'Legitimate Use Only',
        content: 'You agree to only use this service for genuine emergencies. Misuse, false alerts, or spam may result in immediate account suspension and potential legal action.',
      },
      {
        title: 'Not a Replacement for 911',
        content: 'This service is NOT a replacement for professional emergency services. For life-threatening emergencies, ALWAYS call 911 or your local emergency number FIRST.',
      },
      {
        title: 'No Guarantee of Response',
        content: 'We cannot guarantee that helpers will respond to your alert or arrive in time. This is a community-based service relying on volunteer helpers.',
      },
      {
        title: 'Liability Limitation',
        content: 'The platform and its operators are not liable for any harm, injury, or loss resulting from the use of this service, including but not limited to delayed responses, no responses, or actions taken by community helpers.',
      },
      {
        title: 'Data Sharing',
        content: 'Your alert information, including location and description, will be shared with nearby users. By sending an alert, you consent to this data sharing.',
      },
      {
        title: 'Account Suspension',
        content: 'Repeated false alerts, misuse, or violation of these terms may result in permanent account suspension.',
      },
    ],
  };

  const terms = type === 'helper' ? helperTerms : requesterTerms;

  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            {terms.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Important: Please Read Carefully</p>
                <p>
                  By using this service, you acknowledge the risks involved and agree to the following terms.
                </p>
              </div>
            </div>

            {terms.sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-gray-900">{section.title}</h4>
                <p className="text-sm text-gray-700">{section.content}</p>
              </div>
            ))}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <p className="text-xs text-gray-600">
                <strong>Emergency Services Disclaimer:</strong> This platform is a community
                support tool and does NOT provide professional emergency services. For
                life-threatening situations, always contact 911 or your local emergency services
                immediately.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label
              htmlFor="accept-terms"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I have read and agree to the {terms.title}. I understand the risks and limitations
              of this service.
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={onAccept}
              disabled={!accepted}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

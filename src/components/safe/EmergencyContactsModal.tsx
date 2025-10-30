import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Phone, UserPlus, Trash2, Star } from 'lucide-react';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { Switch } from '@/components/ui/switch';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const { contacts, isLoading, createContact, deleteContact } = useEmergencyContacts();

  const handleAdd = async () => {
    if (!contactName || !contactPhone) return;

    await createContact.mutateAsync({
      contact_name: contactName,
      contact_phone: contactPhone,
      relationship: relationship || undefined,
      is_primary: isPrimary,
    });

    // Reset form
    setContactName('');
    setContactPhone('');
    setRelationship('');
    setIsPrimary(false);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this contact?')) {
      deleteContact.mutate(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emergency Contacts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            These contacts will be notified when you create an SOS alert
          </p>

          {/* Add Contact Form */}
          {isAdding ? (
            <Card className="p-4 space-y-4 border-primary">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone Number *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  placeholder="e.g., Spouse, Parent, Friend"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is-primary">Primary Contact</Label>
                <Switch
                  id="is-primary"
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setContactName('');
                    setContactPhone('');
                    setRelationship('');
                    setIsPrimary(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!contactName || !contactPhone || createContact.isPending}
                  className="flex-1"
                >
                  {createContact.isPending ? 'Adding...' : 'Add Contact'}
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full"
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Emergency Contact
            </Button>
          )}

          {/* Contacts List */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading contacts...
              </p>
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contact.contact_name}</h4>
                        {contact.is_primary && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        {contact.contact_phone}
                      </div>
                      {contact.relationship && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {contact.relationship}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No emergency contacts added yet
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

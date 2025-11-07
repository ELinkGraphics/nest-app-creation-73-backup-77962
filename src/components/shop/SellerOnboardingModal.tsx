import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Store, User, Building2, FileText, ShieldCheck } from 'lucide-react';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface SellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SellerType = 'personal' | 'shop';
type OnboardingStep = 'type-selection' | 'personal-info' | 'shop-info';

export const SellerOnboardingModal: React.FC<SellerOnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<OnboardingStep>('type-selection');
  const [sellerType, setSellerType] = useState<SellerType>('personal');
  const { createOrUpdateProfile } = useSellerProfile();
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Common fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // Personal seller fields
  const [businessName, setBusinessName] = useState('');
  
  // Shop fields
  const [shopName, setShopName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');

  const handleTypeSelection = (type: SellerType) => {
    setSellerType(type);
    setStep(type === 'personal' ? 'personal-info' : 'shop-info');
  };

  const handlePersonalSubmit = async () => {
    if (!email || !location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createOrUpdateProfile.mutateAsync({
        businessName: businessName || undefined,
        description,
        phone: phone || undefined,
        email,
        location,
        sellerType: 'personal'
      });
      toast.success('Personal seller account created!');
      // Wait a bit for the query to invalidate and refetch
      setTimeout(() => {
        onClose();
        if (user?.id) navigate(`/seller/${user.id}`);
      }, 300);
    } catch (error) {
      toast.error('Failed to create seller account');
    }
  };

  const handleShopSubmit = async () => {
    if (!email || !location || !shopName || !registrationNumber || !taxId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createOrUpdateProfile.mutateAsync({
        businessName: shopName,
        description,
        phone: phone || undefined,
        email,
        location,
        sellerType: 'shop',
        registrationNumber,
        taxId,
        businessLicenseUrl: businessLicense || undefined
      });
      toast.success('Shop account created! Pending verification.');
      // Wait a bit for the query to invalidate and refetch
      setTimeout(() => {
        onClose();
        if (user?.id) navigate(`/seller/${user.id}`);
      }, 300);
    } catch (error) {
      toast.error('Failed to create shop account');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {step === 'type-selection' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Become a Seller</DialogTitle>
              <DialogDescription>
                Choose how you want to sell on our platform
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTypeSelection('personal')}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Personal Seller</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sell items as an individual. Quick setup with basic information.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTypeSelection('shop')}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Business Shop</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Register your business. Requires legal verification for authenticity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {step === 'personal-info' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Seller Information
              </DialogTitle>
              <DialogDescription>
                Fill in your details to start selling
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Display Name (Optional)</Label>
                <Input
                  id="business-name"
                  placeholder="e.g., John's Store"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">About You</Label>
                <Textarea
                  id="description"
                  placeholder="Tell buyers about yourself and what you sell..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('type-selection')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePersonalSubmit}
                  disabled={createOrUpdateProfile.isPending}
                  className="flex-1"
                >
                  {createOrUpdateProfile.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'shop-info' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Store className="w-5 h-5" />
                Business Shop Registration
              </DialogTitle>
              <DialogDescription>
                Provide legal business information for verification
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Verification Required</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Your business will be verified within 2-3 business days. You can start listing items immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-name">Business Name *</Label>
                <Input
                  id="shop-name"
                  placeholder="Your Business Name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration-number">Business Registration Number *</Label>
                <Input
                  id="registration-number"
                  placeholder="123456789"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID / EIN *</Label>
                <Input
                  id="tax-id"
                  placeholder="12-3456789"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-license">Business License URL (Optional)</Label>
                <Input
                  id="business-license"
                  placeholder="https://..."
                  value={businessLicense}
                  onChange={(e) => setBusinessLicense(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload your business license to a cloud storage and paste the link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-email">Business Email *</Label>
                <Input
                  id="shop-email"
                  type="email"
                  placeholder="business@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-phone">Business Phone</Label>
                <Input
                  id="shop-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-location">Business Location *</Label>
                <Input
                  id="shop-location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop-description">Business Description</Label>
                <Textarea
                  id="shop-description"
                  placeholder="Describe your business and what you offer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('type-selection')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleShopSubmit}
                  disabled={createOrUpdateProfile.isPending}
                  className="flex-1"
                >
                  {createOrUpdateProfile.isPending ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from 'react';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { InstallPrompt } from '../components/InstallPrompt';
import { SOSEmergencyView } from '../components/safe/SOSEmergencyView';
import { SOSNearbyView } from '../components/safe/SOSNearbyView';
import { SOSProfile } from '../components/safe/SOSProfile';
import { EmergencyContactsModal } from '../components/safe/EmergencyContactsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { type TabKey } from '@/hooks/useAppNav';
interface SafeProps {
  activeTab: TabKey;
  onTabSelect: (tab: TabKey) => void;
  onOpenCreate: () => void;
}
const Safe: React.FC<SafeProps> = ({
  activeTab,
  onTabSelect,
  onOpenCreate
}) => {
  const [activeView, setActiveView] = useState<'sos' | 'nearby' | 'profile'>('sos');
  const [showContactsModal, setShowContactsModal] = useState(false);
  
  return <div className="min-h-[100dvh] mx-auto bg-white text-foreground selection:bg-secondary/40 max-w-[480px] relative border-l border-r border-gray-200 font-sans" data-testid="safe-page">
      <InstallPrompt />
      <Header onNotifications={() => alert("Notifications")} onMessages={() => alert("Messages")} />
      
      <main className="pb-24">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-4">
          <Button
            onClick={() => setShowContactsModal(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Emergency Contacts
          </Button>
        </div>

        <Tabs value={activeView} onValueChange={value => setActiveView(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm mt-4 sticky top-0 z-10 bg-background">
            <TabsTrigger value="sos" className="text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              SOS
            </TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              Nearby
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sos" className="mt-4">
            <SOSEmergencyView />
          </TabsContent>

          <TabsContent value="nearby" className="mt-4">
            <SOSNearbyView />
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <SOSProfile />
          </TabsContent>
        </Tabs>
      </main>
      
      <EmergencyContactsModal 
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
      
      <FooterNav active={activeTab} onSelect={onTabSelect} onOpenCreate={onOpenCreate} />
    </div>;
};
export default Safe;
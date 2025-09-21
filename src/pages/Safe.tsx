import React, { useState } from 'react';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { InstallPrompt } from '../components/InstallPrompt';
import { SOSEmergencyView } from '../components/safe/SOSEmergencyView';
import { SOSNearbyView } from '../components/safe/SOSNearbyView';
import { SOSProfile } from '../components/safe/SOSProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  return <div className="min-h-[100dvh] mx-auto bg-white text-foreground selection:bg-secondary/40 max-w-[480px] relative border-l border-r border-gray-200 font-sans" data-testid="safe-page">
      <InstallPrompt />
      <Header onNotifications={() => alert("Notifications")} onMessages={() => alert("Messages")} />
      
      <main className="pb-24">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
          
        </div>

        <Tabs value={activeView} onValueChange={value => setActiveView(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm mt-4">
            <TabsTrigger value="sos" className="text-xs">SOS</TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs">Nearby</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
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
      
      <FooterNav active={activeTab} onSelect={onTabSelect} onOpenCreate={onOpenCreate} />
    </div>;
};
export default Safe;
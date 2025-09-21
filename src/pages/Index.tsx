import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { type TabKey } from '@/hooks/useAppNav';
import Header from '../components/Header';
import StoriesBar from '../components/StoriesBar';
import Composer from '../components/Composer';
import { FeedView } from '../components/FeedView';
import { RelaxView } from '../components/RelaxView';
import { FeedRelaxToggle, FeedMode } from '../components/FeedRelaxToggle';
import FooterNav from '../components/FooterNav';
import CreateModal from '../components/CreateModal';
import GoLiveModal from '../components/live/GoLiveModal';
import { InstallPrompt } from '../components/InstallPrompt';
import Circles from './Circles';
import Shop from './Shop';
import Safe from './Safe';



const Index = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [openCreate, setOpenCreate] = useState(false);
  const [openGoLive, setOpenGoLive] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>("feed");
  const [showCircles, setShowCircles] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSafe, setShowSafe] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(0);

  // Handle navigation state from FooterNav
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent issues on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-open create modal when Add tab is selected
  useEffect(() => {
    if (activeTab === "add") {
      setOpenCreate(true);
    } else if (activeTab === "circles") {
      setShowCircles(true);
    } else if (activeTab === "ask") {
      // Handle ask anonymously functionality
      console.log("Ask anonymously selected");
    } else if (activeTab === "safe") {
      setShowSafe(true);
    } else {
      setShowCircles(false);
      setShowShop(false);
      setShowSafe(false);
    }
  }, [activeTab]);

  const handleCloseCreate = () => {
    setOpenCreate(false);
    if (activeTab === "add") {
      setActiveTab("home");
    }
  };

  const handleBackToFeed = () => {
    setFeedMode("feed");
  };

  const handleCloseCircles = () => {
    setShowCircles(false);
  };

  const handleOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleOpenGoLive = () => {
    setOpenGoLive(true);
  };

  const handleCloseGoLive = () => {
    setOpenGoLive(false);
  };

  const handleRefresh = () => {
    // Refresh current mode content without changing mode
    setRefreshFeed(prev => prev + 1);
  };

  const handleTabSelect = (tab: TabKey) => {
    if (tab === "home") {
      // Always redirect to feed when home is tapped
      setFeedMode("feed");
      setRefreshFeed(prev => prev + 1);
    }
    setActiveTab(tab);
  };

  if (showCircles) {
    return (
      <Circles 
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        onOpenCreate={handleOpenCreate}
      />
    );
  }

  if (showShop) {
    return (
      <Shop 
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        onOpenCreate={handleOpenCreate}
      />
    );
  }

  if (showSafe) {
    return (
      <Safe 
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
        onOpenCreate={handleOpenCreate}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] mx-auto bg-white text-foreground selection:bg-secondary/40 max-w-[480px] relative border-l border-r border-gray-200 font-sans" data-testid="app-loaded">
      <InstallPrompt />
      <Header 
        onNotifications={() => alert("Notifications")}
        onMessages={() => alert("Messages")}
      />
      
      <main className="pb-24">
        <StoriesBar />
        
        <FeedRelaxToggle 
          activeMode={feedMode}
          onModeChange={setFeedMode}
        />
        
        {feedMode === "feed" ? (
          <FeedView key={refreshFeed} onRefresh={handleRefresh} data-testid="feed-view" />
        ) : (
          <RelaxView 
            autoOpenFirstVideo={true}
            onBackToFeed={handleBackToFeed}
            activeTab={activeTab}
            onTabSelect={handleTabSelect}
            onOpenCreate={handleOpenCreate}
            onRefresh={handleRefresh}
            key={`${feedMode}-${refreshFeed}`} // Force re-mount when switching mode or refreshing
          />
        )}
      </main>
      
      <FooterNav
        active={activeTab}
        onSelect={handleTabSelect}
        onOpenCreate={handleOpenCreate}
        onOpenGoLive={handleOpenGoLive}
      />
      
      <CreateModal
        isOpen={openCreate}
        onClose={handleCloseCreate}
        data-testid="create-modal"
      />
      
      <GoLiveModal
        isOpen={openGoLive}
        onClose={handleCloseGoLive}
      />
    </div>
  );
};

export default Index;

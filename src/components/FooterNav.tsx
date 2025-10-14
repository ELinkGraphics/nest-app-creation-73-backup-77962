import React, { useState } from 'react';
import { Home, Users, Plus, ShieldAlert, Camera, UserPlus, Store, Radio, HeartHandshake, Edit3, Video } from 'lucide-react';
import { useAppNav, type TabKey } from '@/hooks/useAppNav';

interface FooterNavProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
  onOpenCreate: () => void;
  onOpenGoLive?: () => void;
  onOpenStoryModal?: () => void;
  videoMode?: boolean;
}

const TABS = [
  { key: "home" as const, label: "Home", icon: Home },
  { key: "circles" as const, label: "Circles", icon: Users },
  { key: "add" as const, label: "Add", icon: Plus, center: true },
  { key: "ask" as const, label: "Ask Anonymously", icon: HeartHandshake },
  { key: "safe" as const, label: "Safe", icon: ShieldAlert },
];

const CREATE_OPTIONS = [
  { label: "Post", icon: Camera },
  { label: "Video", icon: Video },
  { label: "Circle", icon: UserPlus },
  { label: "Shop", icon: Store },
  { label: "Go live", icon: Radio },
];

const FooterNav: React.FC<FooterNavProps> = ({ active, onSelect, onOpenCreate, onOpenGoLive, onOpenStoryModal, videoMode = false }) => {
  const { navigateToTab, navigateToCreatePost, navigateToCreateVideo, navigateToCreateCircle, navigateToCreateShop } = useAppNav();
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const handleCreateClick = () => {
    if (active === 'ask' && onOpenStoryModal) {
      onOpenStoryModal();
    } else {
      setShowCreatePopup(!showCreatePopup);
    }
  };

  const handleCreateOptionClick = (option: string) => {
    setShowCreatePopup(false);
    if (option === 'Go live') {
      onOpenGoLive?.();
    } else if (option === 'Post') {
      navigateToCreatePost();
    } else if (option === 'Video') {
      navigateToCreateVideo();
    } else if (option === 'Circle') {
      navigateToCreateCircle();
    } else if (option === 'Shop') {
      navigateToCreateShop();
    }
  };

  const handleTabClick = (tabKey: TabKey) => {
    if (tabKey === 'add') {
      // Handle add button - trigger create popup or navigate based on current page
      if (typeof onSelect === 'function') {
        onSelect(tabKey);
      }
    } else {
      // Use centralized navigation for all other tabs
      navigateToTab(tabKey);
      // Also call onSelect for state management in parent components
      if (typeof onSelect === 'function') {
        onSelect(tabKey);
      }
    }
  };
  if (videoMode) {
    return (
      <nav 
        aria-label="Primary" 
        className="w-full h-[50px] flex items-center justify-center bg-white backdrop-blur-lg border-t border-white/30"
        role="tablist"
      >
        <div className="grid grid-cols-5 place-items-center h-full w-full max-w-md px-4">
          <button
            type="button"
            role="tab"
            aria-selected={active === "home"}
            aria-current={active === "home" ? "page" : undefined}
            className={`grid place-items-center size-10 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all ${
              active === "home" ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            onClick={() => handleTabClick("home")}
            title="Home"
            aria-label="Home"
          >
            <Home className={`size-6 ${active === "home" ? 'text-primary' : 'text-gray-600'}`} />
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={active === "circles"}
            className="grid place-items-center size-10 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
            onClick={() => handleTabClick("circles")}
            title="Circles"
            aria-label="Circles"
          >
            <Users className={`size-6 ${active === "circles" ? 'text-primary' : 'text-gray-600'}`} />
          </button>

            <div className="relative">
            <button
              type="button"
              role="tab"
              aria-selected={active === "add"}
              className="grid place-items-center size-10 rounded-full bg-secondary hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
              onClick={handleCreateClick}
                title={active === 'ask' ? 'Share Story' : 'Create'}
                aria-label={active === 'ask' ? 'Share Story' : 'Create'}
            >
                {active === 'ask' ? (
                  <Edit3 className="size-6 text-white" />
                ) : (
                  <Plus className="size-6 text-white" />
                )}
            </button>
            
            {showCreatePopup && active !== 'ask' && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 transition-opacity duration-200">
                <div className="flex items-center justify-center px-4 py-2">
                  {CREATE_OPTIONS.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleCreateOptionClick(option.label)}
                        className="flex flex-col items-center justify-center py-2 px-3 rounded-xl hover:bg-gray-100 transition-colors group min-w-[50px]"
                      >
                        <IconComponent className="size-4 text-primary group-hover:text-primary/80 transition-colors mb-1" />
                        <span className="text-xs text-gray-600 group-hover:text-primary transition-colors font-medium whitespace-nowrap">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            role="tab"
            aria-selected={active === "ask"}
            className="grid place-items-center size-10 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
            onClick={() => handleTabClick("ask")}
            title="Ask Anonymously"
            aria-label="Ask Anonymously"
          >
            <HeartHandshake className={`size-6 ${active === "ask" ? 'text-primary' : 'text-gray-600'}`} />
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={active === "safe"}
            className="grid place-items-center size-10 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
            onClick={() => handleTabClick("safe")}
            title="Safe"
            aria-label="Safe"
          >
            <ShieldAlert className={`size-6 ${active === "safe" ? 'text-primary' : 'text-gray-600'}`} />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      aria-label="Primary" 
      className="fixed inset-x-0 z-40 pointer-events-none" 
      style={{ bottom: `calc(env(safe-area-inset-bottom) + 12px)` }}
    >
      <div className="mx-auto max-w-[480px] relative">
        <div
          className="pointer-events-auto mx-auto w-[92%] h-14 rounded-full bg-white border border-gray-200 shadow-xl"
          role="tablist"
        >
          <div className="grid grid-cols-5 place-items-center h-full px-2">
            <button
              type="button"
              role="tab"
              aria-selected={active === "home"}
              aria-current={active === "home" ? "page" : undefined}
              className={`grid place-items-center size-10 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all ${
                active === "home" ? 'bg-tertiary' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTabClick("home")}
              title="Home"
              aria-label="Home"
              data-testid="nav-home"
            >
              <Home className={`size-6 ${active === "home" ? 'text-primary' : 'text-gray-600'}`} />
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={active === "circles"}
              className="grid place-items-center size-10 rounded-full hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
              onClick={() => handleTabClick("circles")}
              title="Circles"
              aria-label="Circles"
              data-testid="nav-circles"
            >
              <Users className={`size-6 ${active === "circles" ? 'text-primary' : 'text-gray-600'}`} />
            </button>

            <div className="relative">
              <button
                type="button"
                role="tab"
                aria-selected={active === "add"}
                className="grid place-items-center size-10 rounded-full bg-secondary hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-all"
                onClick={handleCreateClick}
                title={active === 'ask' ? 'Share Story' : 'Create'}
                aria-label={active === 'ask' ? 'Share Story' : 'Create'}
                data-testid="nav-add"
              >
                {active === 'ask' ? (
                  <Edit3 className="size-6 text-white" />
                ) : (
                  <Plus className="size-6 text-white" />
                )}
              </button>
              
              {showCreatePopup && active !== 'ask' && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 transition-opacity duration-200" data-testid="create-popup">
                  <div className="flex items-center justify-center px-4 py-2">
                    {CREATE_OPTIONS.map((option, index) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.label}
                          onClick={() => handleCreateOptionClick(option.label)}
                          className="flex flex-col items-center justify-center py-2 px-3 rounded-xl hover:bg-gray-100 transition-colors group min-w-[50px]"
                          data-testid={`create-${option.label.toLowerCase().replace(' ', '-')}`}
                        >
                          <IconComponent className="size-4 text-primary group-hover:text-primary/80 transition-colors mb-1" />
                          <span className="text-xs text-gray-600 group-hover:text-primary transition-colors font-medium whitespace-nowrap">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              role="tab"
              aria-selected={active === "ask"}
              className="grid place-items-center size-10 rounded-full hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
              onClick={() => handleTabClick("ask")}
              title="Ask Anonymously"
              aria-label="Ask Anonymously"
              data-testid="nav-ask"
            >
              <HeartHandshake className={`size-6 ${active === "ask" ? 'text-primary' : 'text-gray-600'}`} />
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={active === "safe"}
              className="grid place-items-center size-10 rounded-full hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
              onClick={() => handleTabClick("safe")}
              title="Safe"
              aria-label="Safe"
              data-testid="nav-safe"
            >
              <ShieldAlert className={`size-6 ${active === "safe" ? 'text-primary' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FooterNav;
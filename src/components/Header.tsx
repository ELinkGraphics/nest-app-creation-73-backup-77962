import React, { useState } from 'react';
import { Bell, Mail, Settings, User as UserIcon, Palette, LogOut, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useAppNav } from '@/hooks/useAppNav';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';

interface HeaderProps {
  onNotifications?: () => void;
  onMessages?: () => void;
}

const IconButton = ({ label, children, badge, onClick, 'data-testid': dataTestId }: { 
  label: string; 
  children: React.ReactNode; 
  badge?: number; 
  onClick?: () => void;
  'data-testid'?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="relative p-1.5 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
    aria-label={label}
    title={label}
    data-testid={dataTestId}
  >
    {children}
    {typeof badge === "number" && badge > 0 && (
      <span 
        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] grid place-items-center bg-secondary text-white font-medium"
        aria-label={`${badge} unread`}
      >
        {badge}
      </span>
    )}
  </button>
);

const MenuItem = ({ icon, label, danger, onClick, 'data-testid': dataTestId }: { 
  icon: React.ReactNode; 
  label: string; 
  danger?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}) => (
  <button
    type="button"
    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
    style={{ color: danger ? "#B42318" : undefined }}
    role="menuitem"
    onClick={onClick}
    data-testid={dataTestId}
  >
    <span className="text-gray-800">{icon}</span>
    <span className="text-sm text-gray-800">{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ onNotifications, onMessages }) => {
  const { navigateToNotifications, navigateToMessages, navigateToShop } = useAppNav();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, isLoading } = useUser();

  if (isLoading || !user) {
    return (
      <header className="sticky top-0 z-30 border-b border-gray-200">
        <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="px-4 h-10 flex items-center justify-between">
            <div className="inline-flex items-center rounded-full px-3 py-1 border border-gray-200">
              <img 
                src="/lovable-uploads/0cbbe835-9c4c-4a9c-87ae-8385aa0d34ee.png" 
                alt="MomsNest" 
                className="h-7 w-auto"
              />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200">
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-4 h-10 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 border border-gray-200">
            <img 
              src="/lovable-uploads/0cbbe835-9c4c-4a9c-87ae-8385aa0d34ee.png" 
              alt="MomsNest" 
              className="h-7 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <IconButton 
              label="Notifications" 
              badge={3} 
              onClick={navigateToNotifications}
              data-testid="header-notifications"
            >
              <Bell className="size-4 text-primary" />
            </IconButton>
            <IconButton 
              label="Shop" 
              onClick={navigateToShop}
              data-testid="header-shop"
            >
              <ShoppingBag className="size-4 text-primary" />
            </IconButton>
            
            <button
              type="button"
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="header-user-menu"
            >
                <span className="relative inline-block">
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-secondary text-white">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                 {user.isOnline && (
                   <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white bg-success" />
                 )}
               </span>
              <span className="hidden sm:inline text-sm text-primary">{user.name}</span>
            </button>
          </div>
        </div>
      </div>
      
      {menuOpen && (
        <>
          <button
            aria-label="Close profile menu"
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute right-3 top-10 z-40 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl animate-scale-in"
            role="menu"
            data-testid="user-menu"
          >
            <div className="p-3 bg-gradient-hero">
              <button
                type="button"
                className="flex items-center gap-3 w-full hover:bg-white/10 rounded-lg p-2 transition-colors"
                onClick={() => {
                  setShowProfileModal(true);
                  setMenuOpen(false);
                }}
              >
                 <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary to-secondary text-white">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                <div>
                  <div className="font-semibold text-primary">{user.name}</div>
                  <div className="text-xs text-gray-600">@{user.username}</div>
                </div>
              </button>
            </div>
            <MenuItem 
              icon={<UserIcon className="size-4" />} 
              label="View profile" 
              onClick={() => {
                setShowProfileModal(true);
                setMenuOpen(false);
              }} 
            />
            <MenuItem 
              icon={<Mail className="size-4" />} 
              label="Messages" 
              onClick={() => {
                navigateToMessages();
                setMenuOpen(false);
              }}
              data-testid="menu-messages"
            />
            <MenuItem icon={<Settings className="size-4" />} label="Settings" />
            <MenuItem icon={<Palette className="size-4" />} label="Appearance" />
            <div className="h-px bg-gray-200" />
            <MenuItem 
              icon={<LogOut className="size-4" />} 
              label="Log out" 
              danger 
              onClick={() => {
                navigate('/login');
                setMenuOpen(false);
              }}
              data-testid="menu-logout"
            />
          </div>
        </>
      )}
      
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};

export default Header;
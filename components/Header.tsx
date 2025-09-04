
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { LogOutIcon } from './Icons';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        {/* Can add a search bar here if needed */}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOutIcon className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;

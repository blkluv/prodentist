import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { HomeIcon, UsersIcon, StethoscopeIcon, SettingsIcon, XIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { Button } from './ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      { 'bg-muted text-primary': isActive }
    );

  return (
    <div className={cn(
        "fixed inset-y-0 left-0 z-50 h-full w-[220px] lg:w-[280px] border-r bg-white transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <StethoscopeIcon className="h-6 w-6" />
            <span className="">Clinic Dashboard</span>
          </NavLink>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 md:hidden" onClick={onClose}>
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink to="/dashboard" end className={navLinkClasses} onClick={onClose}>
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </NavLink>
            {user?.role === Role.ADMIN && (
              <NavLink to="/dashboard/staff" className={navLinkClasses} onClick={onClose}>
                <UsersIcon className="h-4 w-4" />
                Staff
              </NavLink>
            )}
            <NavLink to="/dashboard/patients" className={navLinkClasses} onClick={onClose}>
              <StethoscopeIcon className="h-4 w-4" />
              Patients
            </NavLink>
            <NavLink to="/dashboard/settings" className={navLinkClasses} onClick={onClose}>
              <SettingsIcon className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
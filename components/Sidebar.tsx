
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { HomeIcon, UsersIcon, StethoscopeIcon, SettingsIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

const Sidebar = () => {
  const { user } = useAuth();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      { 'bg-muted text-primary': isActive }
    );

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <StethoscopeIcon className="h-6 w-6" />
            <span className="">Clinic Dashboard</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink to="/dashboard" end className={navLinkClasses}>
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </NavLink>
            {user?.role === Role.ADMIN && (
              <NavLink to="/dashboard/staff" className={navLinkClasses}>
                <UsersIcon className="h-4 w-4" />
                Staff
              </NavLink>
            )}
            <NavLink to="/dashboard/patients" className={navLinkClasses}>
              <StethoscopeIcon className="h-4 w-4" />
              Patients
            </NavLink>
            <NavLink to="/dashboard/settings" className={navLinkClasses}>
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

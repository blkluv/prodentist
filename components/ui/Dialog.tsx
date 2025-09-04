
import React from 'react';
import { cn } from '../../lib/utils';
import { XIcon } from '../Icons';

const Dialog = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
  return <div onClick={onClick}>{children}</div>;
};

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn(className)}>{children}</div>;
};

const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>;
};

const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>{children}</div>;
};

const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>;
};

const DialogDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
};

const DialogClose = ({ onClick, children, className }: { onClick: () => void, children?: React.ReactNode, className?: string }) => {
  return (
    <button onClick={onClick} className={cn("absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", className)}>
      {children || <XIcon className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose };

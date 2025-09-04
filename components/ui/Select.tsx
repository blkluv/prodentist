
import React from 'react';
import { cn } from '../../lib/utils';

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none truncate rounded-md border border-input bg-transparent py-2 pl-3 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

const SelectValue = ({ children }: { children: React.ReactNode }) => {
  // This is a conceptual placeholder. In a real Select, this would be more complex.
  return <option value="">{children}</option>;
};

const SelectTrigger = ({ children }: { children: React.ReactNode }) => {
  // The trigger is part of the main Select component in this simplified version
  return <>{children}</>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  // Content is the options within the native select
  return <>{children}</>;
};

const SelectItem = (props: React.OptionHTMLAttributes<HTMLOptionElement>) => {
  return <option {...props} />;
};

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };

import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    // FIX: Implement `asChild` prop logic to allow rendering a child component with button styles.
    // This pattern is common for wrapping components like react-router's Link.
    if (asChild) {
      const { children, ...restProps } = props;
      const child = React.Children.only(children);
      if (React.isValidElement(child)) {
        // FIX: Cast child to `React.ReactElement<any>` to fix TypeScript errors when cloning.
        // The original cast was too restrictive, causing errors when passing `ref` and accessing `className`.
        return React.cloneElement(child as React.ReactElement<any>, {
          ...restProps,
          ref: ref,
          // FIX: `child.props` is inferred as `unknown`, so cast to `any` to access `className`.
          className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className, (child.props as any).className),
        });
      }
      // React.Children.only will throw an error if there is not exactly one child.
    }

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
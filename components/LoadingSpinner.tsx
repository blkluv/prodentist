
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
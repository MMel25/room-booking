import React from 'react';
import { Lock } from 'lucide-react';

const Card = ({ children, className }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={`p-4 border-b ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }) => (
  <div className={`text-xl font-medium ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent };

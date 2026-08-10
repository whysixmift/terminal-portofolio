import React from 'react';
import {Analytics} from '@vercel/analytics/react';
import Terminal from './Terminal';

export default function App() {
  return (
    <div className="min-h-screen bg-[#1e1e2e]">
      <Terminal />
      <Analytics />
    </div>
  );
}

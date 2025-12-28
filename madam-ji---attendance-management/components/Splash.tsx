
import React from 'react';

const Splash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-emerald-600 dark:bg-emerald-800 splash-fade-out">
      <div className="relative">
        <div className="w-32 h-32 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-5xl font-black text-white italic tracking-tighter">MJ</span>
        </div>
      </div>
      <h1 className="mt-8 text-6xl font-black text-white tracking-widest animate-pulse">
        MADAM JI
      </h1>
      <p className="mt-4 text-emerald-100 text-lg font-light tracking-widest uppercase">
        Smart Attendance System
      </p>
      
      <div className="absolute bottom-10 flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default Splash;

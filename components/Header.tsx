
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-6 flex flex-col items-center justify-center space-y-2">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
        Nutri<span className="text-amber-600">Elite</span>
      </h1>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">
        Precision Nutrition & Culinary Data
      </p>
      <div className="w-12 h-[1px] bg-amber-600/50 mt-4"></div>
    </header>
  );
};

export default Header;

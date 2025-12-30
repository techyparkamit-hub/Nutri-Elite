
import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const PREDEFINED_FOODS = [
  'Acai Bowl', 'Almond Butter', 'Atlantic Salmon', 'Avocado Toast', 
  'Balsamic Glazed Chicken', 'Beef Tenderloin', 'Blueberry Smoothie', 'Boiled Eggs',
  'Caesar Salad', 'Chia Seed Pudding', 'Chicken Breast', 'Chickpea Curry',
  'Dark Chocolate', 'Dragon Fruit', 'Edamame', 'Egg White Omelet',
  'Falafel Wrap', 'Filet Mignon', 'Fresh Oysters', 'Greek Yogurt',
  'Grilled Asparagus', 'Grilled Sea Bass', 'Hummus & Pita', 'Kale Salad',
  'Lentil Soup', 'Lobster Tail', 'Macha Latte', 'Miso Soup',
  'Mixed Nut Mix', 'Oatmeal with Berries', 'Olive Oil', 'Pan-Seared Scallops',
  'Papaya', 'Peanut Butter', 'Pesto Pasta', 'Poached Salmon',
  'Poke Bowl', 'Quinoa Salad', 'Rainbow Trout', 'Raspberry Sorbet',
  'Ribeye Steak', 'Roasted Brussels Sprouts', 'Sashimi Platter', 'Shrimp Scampi',
  'Spinach Salad', 'Steamed Broccoli', 'Sweet Potato', 'Tofu Stir-fry',
  'Truffle Risotto', 'Turkey Breast', 'Wagyu Ribeye', 'Walnuts',
  'Wild Rice', 'Yellowfin Tuna'
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = PREDEFINED_FOODS.filter(food =>
        food.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalQuery = selectedIndex >= 0 ? suggestions[selectedIndex] : query;
    if (finalQuery.trim()) {
      onSearch(finalQuery.trim());
      setQuery(finalQuery);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (food: string) => {
    setQuery(food);
    setShowSuggestions(false);
    onSearch(food);
    setSelectedIndex(-1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            placeholder="Search our database (e.g., Wagyu Ribeye)..."
            disabled={isLoading}
            className="w-full h-16 pl-6 pr-32 rounded-2xl bg-white border border-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-md"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 px-8 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Analyzing</span>
              </div>
            ) : (
              'Analyze'
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center space-x-3 ${
                    index === selectedIndex 
                      ? 'bg-amber-50 text-amber-900' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${index === selectedIndex ? 'text-amber-500' : 'text-slate-300'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{suggestion}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50/50 px-4 py-2 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium Database Results</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;

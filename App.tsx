
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NutritionCard from './components/NutritionCard';
import TrendChart from './components/TrendChart';
import GoalTracker from './components/GoalTracker';
import { NutritionData, HistoryItem, DailyGoals } from './types';
import { fetchNutritionInfo } from './services/geminiService';

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<NutritionData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<NutritionData[]>([]);
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  
  // Filtering state
  const [historySearch, setHistorySearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');

  // Load history, favorites and goals from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('nutri_elite_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedFavorites = localStorage.getItem('nutri_elite_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    const savedGoals = localStorage.getItem('nutri_elite_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error("Failed to parse goals", e);
      }
    }
  }, []);

  const saveGoals = (newGoals: DailyGoals) => {
    setGoals(newGoals);
    localStorage.setItem('nutri_elite_goals', JSON.stringify(newGoals));
  };

  const todayIntake = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return history
      .filter(item => item.timestamp >= startOfDay)
      .reduce((acc, item) => ({
        calories: acc.calories + item.data.calories,
        protein: acc.protein + item.data.protein,
        carbs: acc.carbs + item.data.carbs,
        fat: acc.fat + item.data.fat,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [history]);

  const saveToHistory = (data: NutritionData) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      data,
      timestamp: Date.now()
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('nutri_elite_history', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (data: NutritionData) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.foodName === data.foodName);
      let updated;
      if (exists) {
        updated = prev.filter(f => f.foodName !== data.foodName);
      } else {
        updated = [data, ...prev];
      }
      localStorage.setItem('nutri_elite_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (foodName: string) => {
    return favorites.some(f => f.foodName === foodName);
  };

  const handleSelectResult = (data: NutritionData) => {
    setCurrentResult(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNutritionInfo(query);
      handleSelectResult(result);
      saveToHistory(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.data.foodName.toLowerCase().includes(historySearch.toLowerCase());
      if (dateFilter === 'all') return matchesSearch;
      
      const now = Date.now();
      const itemTime = item.timestamp;
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;

      if (dateFilter === 'today') {
        return matchesSearch && (now - itemTime) < oneDay;
      }
      if (dateFilter === 'week') {
        return matchesSearch && (now - itemTime) < oneWeek;
      }
      return matchesSearch;
    });
  }, [history, historySearch, dateFilter]);

  return (
    <div className="min-h-screen bg-[#fcfbf7] pb-24">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 mt-8">
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {loading && !currentResult && (
          <div className="mt-16 text-center space-y-4">
            <div className="inline-block w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Accessing Database...</p>
          </div>
        )}

        <div className="mt-12 space-y-12">
          {/* Daily Tracker Section */}
          <GoalTracker intake={todayIntake} goals={goals} onUpdateGoals={saveGoals} />

          {currentResult && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NutritionCard 
                data={currentResult} 
                isFavorite={isFavorite(currentResult.foodName)} 
                onToggleFavorite={() => toggleFavorite(currentResult)} 
              />
              
              <section className="mt-16">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-12 h-[1px] bg-amber-600/30 mb-4"></div>
                  <h3 className="text-xs uppercase tracking-[0.4em] text-slate-400 font-bold">Insights Hub</h3>
                </div>
                <TrendChart history={history} />
              </section>
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <section className="mt-20">
             <div className="flex flex-col items-center mb-10">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Curated Favorites</h3>
                <div className="w-10 h-1 bg-amber-500/20 rounded-full"></div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((fav, idx) => (
                  <div 
                    key={idx}
                    className="group bg-white border border-amber-100/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                    onClick={() => handleSelectResult(fav)}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(fav);
                      }}
                      className="absolute top-4 right-4 text-amber-500 hover:text-amber-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <h4 className="font-serif font-bold text-slate-800 text-lg group-hover:text-amber-600 transition-colors pr-8 truncate">
                      {fav.foodName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{fav.servingSize}</p>
                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Cals</span>
                        <span className="text-sm font-semibold text-slate-700">{fav.calories}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Protein</span>
                        <span className="text-sm font-semibold text-slate-700">{fav.protein}g</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Fat</span>
                        <span className="text-sm font-semibold text-slate-700">{fav.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {!loading && !currentResult && (
          <div className="mt-24 text-center">
            <p className="text-slate-300 font-serif italic text-xl">Enter a dish to explore its nutritional signature.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Classic Croissant', 'Quinoa Salad', 'Ribeye Steak', 'Sushi Platter'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <section className="mt-20 border-t border-slate-100 pt-16">
            <div className="text-center mb-10">
              <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-6">Recent Inquiries</h3>
              
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                <input 
                  type="text"
                  placeholder="Filter by name..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full sm:w-auto flex-grow px-4 py-2 bg-transparent text-sm focus:outline-none"
                />
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  {(['all', 'today', 'week'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setDateFilter(option)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        dateFilter === option 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {filteredHistory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item.data)}
                    className="px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col min-w-[200px] group"
                  >
                    <span className="font-serif font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                      {item.data.foodName}
                    </span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-slate-400">{item.data.calories} kcal</span>
                      <span className="text-[10px] text-slate-300 uppercase tracking-tighter">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-300 italic">
                No matches found for your current filters.
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mt-24 text-center px-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-400">
          Powered by Gemini Intelligence • Est. 2024
        </p>
      </footer>
    </div>
  );
};

export default App;

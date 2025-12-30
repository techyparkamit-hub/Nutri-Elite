
import React, { useState } from 'react';
import { DailyGoals, NutritionData } from '../types';

interface GoalTrackerProps {
  intake: Partial<NutritionData>;
  goals: DailyGoals;
  onUpdateGoals: (newGoals: DailyGoals) => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ intake, goals, onUpdateGoals }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<DailyGoals>(goals);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = () => {
    onUpdateGoals(editForm);
    setIsEditing(false);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const ProgressItem = ({ label, current, target, unit, colorClass }: { label: string, current: number, target: number, unit: string, colorClass: string }) => {
    const percentage = Math.min(100, Math.round((current / target) * 100)) || 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-serif font-bold text-slate-900">{Math.round(current)}</span>
              <span className="text-xs text-slate-400">/ {target}{unit}</span>
            </div>
          </div>
          <span className={`${percentage >= 100 ? 'text-amber-600' : 'text-slate-400'} text-[10px] font-bold`}>{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">Daily Progress</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">BASED ON TODAY'S INQUIRIES</p>
        </div>
        <div className="flex items-center space-x-4">
          {showSavedFeedback && (
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest animate-in fade-in slide-in-from-right-2 duration-300">
              Targets Updated
            </span>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] uppercase tracking-widest font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Set Targets'}
          </button>
        </div>
      </div>

      <div className="p-8">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{key}</label>
                <input 
                  type="number"
                  value={editForm[key]}
                  onChange={(e) => setEditForm({...editForm, [key]: parseInt(e.target.value) || 0})}
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium"
                />
              </div>
            ))}
            <button 
              onClick={handleSave}
              className="col-span-2 mt-2 py-3 bg-slate-900 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Save Daily Targets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProgressItem label="Calories" current={intake.calories || 0} target={goals.calories} unit="kcal" colorClass="bg-amber-500" />
            <ProgressItem label="Protein" current={intake.protein || 0} target={goals.protein} unit="g" colorClass="bg-slate-700" />
            <ProgressItem label="Carbs" current={intake.carbs || 0} target={goals.carbs} unit="g" colorClass="bg-slate-500" />
            <ProgressItem label="Fat" current={intake.fat || 0} target={goals.fat} unit="g" colorClass="bg-slate-300" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;

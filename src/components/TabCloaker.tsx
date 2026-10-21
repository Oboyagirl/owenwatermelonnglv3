import React, { useState } from 'react';
import { CLOAK_PRESETS, applyCloak } from '../data/cloakPresets';
import { CloakPreset } from '../types/game';
import { Check, Shield, AlertTriangle } from 'lucide-react';

export const TabCloaker: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('default');

  const handleSelect = (preset: CloakPreset) => {
    setSelectedId(preset.id);
    applyCloak(preset);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          Selecting a cloak immediately changes this tab's title and favicon so teachers or monitoring software think you are on educational websites. Press <strong>Esc</strong> anytime for emergency panic redirect!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CLOAK_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-lg' 
                  : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="text-xl shrink-0">{preset.icon}</span>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{preset.title}</span>
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

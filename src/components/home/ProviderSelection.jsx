import React, { useState, useEffect } from 'react';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { apiGet } from '@/utils/apiFetch';
import GameSection from './GameSection';

const providers = [
  { name: 'MAC88', label: 'MAC88', dbName: 'MAC88' },
  { name: '18Peaches', label: '18Peaches', dbName: '18Peaches' },
  { name: 'Veliplay', label: 'VeliPlay', dbName: 'Veliplay' },
  { name: 'aviatrix', label: 'Aviatrix', dbName: 'aviatrix' },
  { name: 'InOut', label: 'InOut', dbName: 'InOut Minigames' },
  { name: 'Galaxsys', label: 'Galaxsys', dbName: 'Galaxsys' },
  { name: 'Smartsoft', label: 'Smartsoft', dbName: 'Smartsoft' },
  { name: '2J', label: '2J', dbName: '2J' },
  { name: 'turbogamesasia', label: 'Turbogames World', dbName: 'turbogamesasia' },
  { name: 'Aura Gaming', label: 'Aura Gaming', dbName: 'Aura Gaming' },
  { name: 'India Lotto', label: 'Lotto', dbName: 'India Lotto' }

];

const ProviderSelection = () => {
  const COLORS = useColors();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerGames, setProviderGames] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProviderClick = async (provider) => {
    if (selectedProvider === provider.dbName) {
      setSelectedProvider(null);
      setProviderGames(null);
      return;
    }

    setSelectedProvider(provider.dbName);
    setLoading(true);

    try {
      const response = await apiGet('route-get-games', { provider: provider.dbName });
      const result = await response.json();

      if (result.status_code === 'success') {
        const allGames = Object.values(result.data).flat();
        setProviderGames(allGames);
      }
    } catch (error) {
      console.error("Error fetching provider games:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="provider-selection-wrapper mb-6">
      {/* Header matching site style */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div
          className="h-5 w-1 rounded-full flex-shrink-0"
          style={{ background: COLORS.brandGradient }}
        ></div>
        <h2
          className="text-[14px] xs:text-base font-black text-black dark:text-white tracking-[0.05em] uppercase leading-none"
          style={{ fontFamily: FONTS.head }}
        >
          Game <span className="text-brand" style={{ color: COLORS.brand }}>Providers</span>
        </h2>
      </div>

      {/* Horizontal List of Providers */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        {providers.map((provider) => (
          <button
            key={provider.dbName}
            onClick={() => handleProviderClick(provider)}
            className={`
              relative flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300
              border backdrop-blur-md active:scale-95 group
              ${selectedProvider === provider.dbName
                ? 'text-black shadow-[0_10px_20px_-10px_rgba(230,160,0,0.5)]'
                : 'text-black/60 dark:text-white/60 border-black/10 dark:border-white/10 hover:border-brand/40 hover:text-black dark:hover:text-white'}
            `}
            style={{
              fontFamily: FONTS.ui,
              background: selectedProvider === provider.dbName ? COLORS.brandGradient : 'rgba(255, 255, 255, 0.03)',
              borderColor: selectedProvider === provider.dbName ? 'transparent' : undefined
            }}
          >
            <span className="relative z-10">{provider.label}</span>
            {selectedProvider === provider.dbName && (
              <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none rounded-xl"></div>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 animate-pulse">
          <div className="w-10 h-1 rounded-full bg-brand overflow-hidden">
            <div className="w-full h-full bg-white/50 animate-shimmer"></div>
          </div>
          <p className="text-[9px] font-black text-brand uppercase tracking-[0.3em]">Loading Elite Collection</p>
        </div>
      )}

      {/* Display Games if a provider is selected */}
      {selectedProvider && !loading && providerGames && providerGames.length > 0 ? (
        <div className="mt-4 animate-fadeInUp">
          <GameSection
            title={`${providers.find(p => p.dbName === selectedProvider)?.label || selectedProvider} Games`}
            games={providerGames}
            id={`provider-${selectedProvider.toLowerCase().replace(/\s+/g, '-')}`}
          />
        </div>
      ) : selectedProvider && !loading && providerGames && providerGames.length === 0 ? (
        <div className="mt-6 p-12 text-center rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md animate-fadeIn transition-all duration-500">
          <div className="text-5xl mb-4 opacity-30">🎮</div>
          <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1" style={{ fontFamily: FONTS.head }}>Coming Soon</h3>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px]" style={{ fontFamily: FONTS.ui }}>
            No games found for this provider in current region
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ProviderSelection;

import React from 'react';
import { Provider } from '../types';
import { Star, MapPin, Clock, Building2, User, ChevronRight, CalendarCheck } from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/timeUtils';

interface EstablishmentCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ provider, onSelect }) => {
  const isEstablishment = provider.type === 'establishment';
  const minPrice = Math.min(...provider.services.map((s) => s.price));

  return (
    <div
      onClick={() => onSelect(provider)}
      className="group bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-purple-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Top Cover Image Banner */}
      <div className="relative h-36 w-full overflow-hidden bg-zinc-950">
        <img
          src={provider.coverImage}
          alt={provider.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
              isEstablishment
                ? 'bg-purple-600/90 text-white shadow-sm shadow-purple-900/50'
                : 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-900/50'
            }`}
          >
            {isEstablishment ? (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span>Lava-Jato / Loja</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Lavador Autônomo</span>
              </>
            )}
          </span>

          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-zinc-300">
            <CalendarCheck className="w-3 h-3 text-cyan-400" />
            <span>Slots a cada {provider.slotIntervalMinutes}m</span>
          </span>
        </div>

        {/* Distance Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/70 backdrop-blur-md text-zinc-200">
          <MapPin className="w-3 h-3 text-purple-400" />
          <span>{provider.distanceKm} km</span>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-5 left-4 flex items-end">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-900 shadow-md ring-1 ring-purple-500/30"
          />
        </div>

        {/* Rating on bottom right of cover */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-bold text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{provider.rating.toFixed(1)}</span>
          <span className="text-[11px] text-zinc-400 font-normal">({provider.totalReviews})</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 pt-7 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-zinc-100 group-hover:text-purple-300 transition-colors">
            {provider.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {provider.tagline}
          </p>

          <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>
                {provider.openTime} às {provider.closeTime}
              </span>
            </div>
            <span>•</span>
            <div className="truncate max-w-[170px]" title={provider.address}>
              {provider.address}
            </div>
          </div>

          {/* Quick Preview of Services */}
          <div className="mt-3.5 space-y-1.5 border-t border-zinc-800/80 pt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Destaques do Cardápio
            </div>
            <div className="flex flex-wrap gap-1.5">
              {provider.services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/70 text-xs text-zinc-300 border border-zinc-800"
                >
                  <span className="truncate max-w-[130px]">{service.name}</span>
                  <span className="text-[10px] text-purple-400 font-medium">
                    {formatDuration(service.durationMinutes)}
                  </span>
                  <span className="text-zinc-500 text-[10px]">•</span>
                  <span className="text-zinc-100 font-bold text-[11px]">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 block">A partir de</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {formatCurrency(minPrice)}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/40 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm"
          >
            <span>Ver Cardápio</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles, ShoppingBag, Bell, Clock, LogIn, LogOut, User } from 'lucide-react';
import { CartItem, ProviderNotification, User as UserType } from '../types';
import { formatDuration } from '../utils/timeUtils';

interface HeaderProps {
  /** Área atual derivada da sessão (não é mais toggle livre) */
  isProviderArea: boolean;
  session: UserType | null;
  cart: CartItem[];
  onOpenCart: () => void;
  notifications: ProviderNotification[];
  onOpenNotifications: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isProviderArea,
  session,
  cart,
  onOpenCart,
  notifications,
  onOpenNotifications,
  selectedCity,
  onSelectCity,
  onOpenAuth,
  onLogout,
}) => {
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const totalCartMinutes = cart.reduce((acc, item) => acc + item.service.durationMinutes, 0);

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                LavaJato
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                HUB
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              {isProviderArea ? (
                <span className="text-purple-300 font-medium">Painel do Prestador</span>
              ) : (
                <>
                  <span>Rio de Janeiro, RJ</span>
                  <span className="text-zinc-600">•</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => onSelectCity(e.target.value)}
                    className="bg-transparent text-purple-400 font-medium hover:text-purple-300 cursor-pointer focus:outline-none text-[11px]"
                    aria-label="Selecionar Região"
                  >
                    <option value="Rio de Janeiro" className="bg-zinc-900 text-white">Todas as Regiões</option>
                    <option value="Barra" className="bg-zinc-900 text-white">Barra da Tijuca</option>
                    <option value="Tijuca" className="bg-zinc-900 text-white">Tijuca / Zona Norte</option>
                    <option value="Zona Sul" className="bg-zinc-900 text-white">Zona Sul & Delivery</option>
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sessão */}
          {session ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-[11px] text-zinc-400 max-w-[120px] truncate">
                <User className="w-3 h-3 inline mr-1 text-purple-400" />
                {session.name}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white hover:border-purple-500/50"
            >
              <LogIn className="w-3.5 h-3.5 text-purple-400" />
              Entrar
            </button>
          )}

          {/* Notificações — prestador ou cliente logado */}
          {(isProviderArea || (session && session.role === 'cliente')) && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              aria-label="Ver Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                  {unreadNotifications}
                </span>
              )}
            </button>
          )}

          {/* Carrinho — só na área do cliente */}
          {!isProviderArea && cart.length > 0 && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs shadow-lg shadow-purple-600/30 hover:brightness-110 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center bg-cyan-400 text-zinc-950 text-[9px] font-extrabold rounded-full">
                  {cart.length}
                </span>
              </div>
              <span className="hidden sm:inline">Carrinho</span>
              <span className="flex items-center gap-1 text-[11px] bg-black/30 px-1.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-cyan-300" />
                {formatDuration(totalCartMinutes)}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

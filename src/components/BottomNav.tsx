import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Calendar, Store, Bell } from 'lucide-react';

export type NavTab = 'home' | 'search' | 'appointments' | 'provider' | 'provider-services';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  appointmentsCount?: number;
  unreadNotificationsCount?: number;
  /** true = área exclusiva do prestador logado */
  isProviderArea?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  appointmentsCount = 0,
  unreadNotificationsCount = 0,
  isProviderArea = false,
}) => {
  const clientTabs = [
    { id: 'home' as NavTab, label: 'Início', icon: Home },
    { id: 'search' as NavTab, label: 'Buscar', icon: Search },
    {
      id: 'appointments' as NavTab,
      label: 'Histórico',
      icon: Calendar,
      badge: appointmentsCount > 0 ? appointmentsCount : undefined,
    },
  ];

  const providerTabs = [
    {
      id: 'provider' as NavTab,
      label: 'Agenda',
      icon: Store,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: 'appointments' as NavTab,
      label: 'Serviços',
      icon: Calendar,
    },
  ];

  // Na área prestador, o tab "appointments" do bottom pode ser reaproveitado
  // pelo App para abrir a seção de serviços do portal — ou usamos só "provider".
  // Simplificação: prestador só tem um tab principal (Agenda/Painel).
  const tabs = isProviderArea
    ? [
        {
          id: 'provider' as NavTab,
          label: 'Painel',
          icon: Store,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
      ]
    : clientTabs;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Navegação principal"
        className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl shadow-purple-950/20"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style={{ minHeight: '44px' }}
            >
              {isActive ? (
                <motion.div
                  layoutId="active-pill"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && (
                    <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-purple-600 bg-white rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </motion.div>
              ) : (
                <div className="relative flex items-center justify-center p-3 text-zinc-400 hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                  {tab.badge !== undefined && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                      {tab.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

import React from 'react';
import { ProviderNotification } from '../types';
import { X, Bell, CheckCircle2, Star, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ProviderNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: ProviderNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Notificações do Sistema</h3>
              <p className="text-[11px] text-zinc-400">Alertas de agendamentos e pagamentos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Nenhuma notificação recebida no momento.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  !n.read
                    ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                    : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'payment_confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : n.type === 'review_received'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {n.type === 'payment_confirmed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : n.type === 'review_received' ? (
                    <Star className="w-4 h-4 fill-amber-400" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{n.title}</h4>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(n.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold px-3 py-1 rounded-lg"
            >
              Marcar todas como lidas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

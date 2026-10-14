import React from 'react';
import { CartItem, Provider } from '../types';
import { X, Trash2, Clock, Calendar, ArrowRight, AlertTriangle, Building2, User } from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/timeUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  providers: Provider[];
  onRemoveItem: (serviceId: string) => void;
  onClearCart: () => void;
  onProceedToBooking: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  providers,
  onRemoveItem,
  onClearCart,
  onProceedToBooking,
}) => {
  if (!isOpen) return null;

  const currentProviderId = cart.length > 0 ? cart[0].providerId : null;
  const currentProvider = providers.find((p) => p.id === currentProviderId);

  const totalDurationMinutes = cart.reduce(
    (acc, item) => acc + item.service.durationMinutes,
    0
  );
  const totalPrice = cart.reduce((acc, item) => acc + item.service.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-950 text-white h-full border-l border-zinc-800 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-white">Carrinho de Serviços</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40">
              {cart.length} {cart.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-zinc-300">Seu carrinho está vazio</h4>
              <p className="text-xs text-zinc-500 max-w-xs">
                Navegue pelo cardápio de estabelecimentos ou lavadores autônomos e adicione os serviços que deseja agendar.
              </p>
            </div>
          ) : (
            <>
              {/* Provider Information */}
              {currentProvider && (
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentProvider.avatar}
                      alt={currentProvider.name}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-purple-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-zinc-100">{currentProvider.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-zinc-800 text-zinc-400">
                          {currentProvider.type === 'establishment' ? 'Loja' : 'Autônomo'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                        {currentProvider.address}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-zinc-400 hover:text-red-400 font-medium transition-colors"
                  >
                    Esvaziar
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Serviços Selecionados
                </div>

                {cart.map((item) => (
                  <div
                    key={item.service.id}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-zinc-200">{item.service.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {formatDuration(item.service.durationMinutes)}
                        </span>
                        <span className="text-zinc-600 text-xs">•</span>
                        <span className="text-xs font-bold text-zinc-100">
                          {formatCurrency(item.service.price)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.service.id)}
                      className="p-2 rounded-lg bg-zinc-800/60 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Remover serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Realistic Duration Calculation Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-zinc-900 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Tempo Total Estimado:
                  </span>
                  <span className="text-sm font-extrabold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                    {formatDuration(totalDurationMinutes)}
                  </span>
                </div>

                {/* Mathematical breakdown */}
                <div className="text-[11px] text-zinc-400 bg-black/40 p-2.5 rounded-lg font-mono">
                  {cart.map((c, i) => (
                    <span key={c.service.id}>
                      {c.service.name} ({c.service.durationMinutes}m)
                      {i < cart.length - 1 ? ' + ' : ` = ${totalDurationMinutes} min total`}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  Ao agendar, reservaremos este período ininterrupto para o seu atendimento. O próximo horário livre para outros clientes será liberado logo após o término calculado!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-zinc-800 bg-zinc-950/95 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total a pagar:</span>
              <span className="text-xl font-black text-emerald-400">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <button
              onClick={onProceedToBooking}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Data & Horário</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-zinc-500 text-center">
              O agendamento só é efetivado após a confirmação do pagamento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

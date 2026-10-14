import React, { useState } from 'react';
import { Provider, ServiceItem, CartItem, Review } from '../types';
import {
  X,
  Star,
  MapPin,
  Clock,
  Instagram,
  MessageCircle,
  ExternalLink,
  Plus,
  Check,
  Building2,
  User,
  ShoppingBag,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/timeUtils';

interface EstablishmentDetailModalProps {
  provider: Provider;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (service: ServiceItem, provider: Provider) => void;
  onRemoveFromCart: (serviceId: string) => void;
  onProceedToBooking: () => void;
  reviews: Review[];
}

export const EstablishmentDetailModal: React.FC<EstablishmentDetailModalProps> = ({
  provider,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onProceedToBooking,
  reviews,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'services' | 'about' | 'reviews'>('services');

  const isEstablishment = provider.type === 'establishment';
  const providerReviews = reviews.filter((r) => r.providerId === provider.id);

  // Cart items specifically for this provider
  const providerCartItems = cart.filter((item) => item.providerId === provider.id);
  const totalCartMinutes = providerCartItems.reduce(
    (acc, item) => acc + item.service.durationMinutes,
    0
  );
  const totalCartPrice = providerCartItems.reduce(
    (acc, item) => acc + item.service.price,
    0
  );

  // If cart has items from ANOTHER provider
  const otherProviderItem = cart.find((item) => item.providerId !== provider.id);

  const categories = [
    { id: 'todos', label: 'Todos os Serviços' },
    { id: 'lavagem', label: 'Lavagens' },
    { id: 'higienizacao', label: 'Higienização' },
    { id: 'estetica', label: 'Estética' },
    { id: 'protecao', label: 'Proteção' },
  ];

  const filteredServices = provider.services.filter((s) => {
    if (selectedCategory === 'todos') return true;
    return s.category === selectedCategory;
  });

  const isServiceInCart = (serviceId: string) => {
    return providerCartItems.some((item) => item.service.id === serviceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-hidden">
      <div className="relative w-full max-w-3xl min-h-screen sm:min-h-0 bg-zinc-950 text-white sm:rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Top Cover Image & Close Button */}
        <div className="relative h-48 sm:h-60 w-full bg-zinc-900">
          <img
            src={provider.coverImage}
            alt={provider.name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Type Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-md ${
                isEstablishment
                  ? 'bg-purple-600/90 text-white border border-purple-400/30'
                  : 'bg-emerald-600/90 text-white border border-emerald-400/30'
              }`}
            >
              {isEstablishment ? (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Lava-Jato / Loja Física</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>Profissional Autônomo Delivery</span>
                </>
              )}
            </span>
          </div>

          {/* Provider Avatar + Title floating */}
          <div className="absolute -bottom-8 left-6 flex items-end gap-4">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-zinc-950 shadow-2xl ring-2 ring-purple-500/40"
            />
          </div>
        </div>

        {/* Header Info */}
        <div className="pt-10 px-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                {provider.name}
                <Sparkles className="w-5 h-5 text-purple-400" />
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">{provider.tagline}</p>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 w-fit">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{provider.rating.toFixed(1)}</span>
              </div>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-xs text-zinc-400">
                {provider.totalReviews} avaliações
              </span>
            </div>
          </div>

          {/* Quick info row */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>{provider.address}, {provider.city} ({provider.distanceKm} km)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Hoje: {provider.openTime} às {provider.closeTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Intervalo de agendamento: {provider.slotIntervalMinutes} em {provider.slotIntervalMinutes} min</span>
            </div>
          </div>

          {/* Social and Contact Links */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-zinc-800">
            {provider.socials.instagram && (
              <a
                href={`https://instagram.com/${provider.socials.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 text-xs font-medium transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>{provider.socials.instagram}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {provider.socials.whatsapp && (
              <a
                href={`https://wa.me/55${provider.socials.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp ({provider.socials.whatsapp.slice(0, 2)}) {provider.socials.whatsapp.slice(2)}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {provider.socials.googleMaps && (
              <a
                href={provider.socials.googleMaps}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Como Chegar</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation — cabe em qualquer largura (3 colunas iguais, texto quebra sem estourar) */}
        <div className="flex border-b border-zinc-800 px-2 sm:px-6 bg-zinc-900/40">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 min-w-0 py-3 px-1.5 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-colors text-center leading-tight ${
              activeTab === 'services'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cardápio de Serviços ({provider.services.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-0 py-3 px-1.5 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-colors text-center leading-tight ${
              activeTab === 'about'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sobre & Profissionais ({provider.professionals.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-0 py-3 px-1.5 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-colors text-center leading-tight ${
              activeTab === 'reviews'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Avaliações ({providerReviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[60vh]">
          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {/* Category Pills — quebram linha em vez de rolar na horizontal */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Conflict warning if other provider items in cart */}
              {otherProviderItem && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Você tem itens de outro estabelecimento no carrinho. Adicionar um serviço daqui atualizará o carrinho para este prestador.
                  </span>
                </div>
              )}

              {/* Explanatory banner about realistic time estimation */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 flex items-center justify-between gap-3 text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    <strong>Cálculo inteligente de tempo:</strong> Você pode adicionar múltiplos serviços ao carrinho. A duração de cada serviço será somada para reservar o intervalo de horário exato na agenda!
                  </span>
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredServices.map((service) => {
                  const inCart = isServiceInCart(service.id);

                  return (
                    <div
                      key={service.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        inCart
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-md shadow-purple-950/30'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-zinc-100">
                            {service.name}
                          </h4>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-cyan-300 border border-zinc-700 shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatDuration(service.durationMinutes)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-base font-extrabold text-white">
                            {formatCurrency(service.price)}
                          </span>
                        </div>

                        {inCart ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onRemoveFromCart(service.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold text-zinc-300 transition-colors"
                            >
                              Remover
                            </button>
                            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold">
                              <Check className="w-3.5 h-3.5" /> No Carrinho
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(service, provider)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABOUT & PROFESSIONALS TAB */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Sobre o Estabelecimento
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  {provider.description}
                </p>
              </div>

              {/* Working Hours and Days */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Disponibilidade & Dias de Atendimento
                </h4>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Horário de Funcionamento:</span>
                    <span className="font-bold text-white">{provider.openTime} às {provider.closeTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Dias da Semana:</span>
                    <div className="flex gap-1">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
                        const isOpen = provider.workingDays.includes(day);
                        return (
                          <span
                            key={day}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isOpen
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                : 'bg-zinc-800/40 text-zinc-600 border border-zinc-800'
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Grade de Horários:</span>
                    <span className="text-cyan-400 font-semibold">
                      Agendamentos a cada {provider.slotIntervalMinutes} minutos
                    </span>
                  </div>
                </div>
              </div>

              {/* Professionals Team */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  {isEstablishment ? 'Equipe de Profissionais' : 'Profissional Responsável'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {provider.professionals.map((prof) => (
                    <div
                      key={prof.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800"
                    >
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-purple-500/30"
                      />
                      <div>
                        <h5 className="font-bold text-sm text-white">{prof.name}</h5>
                        <p className="text-xs text-purple-300">{prof.role}</p>
                        {prof.rating && (
                          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{prof.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    {provider.rating.toFixed(1)}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(provider.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Média baseada em {provider.totalReviews} avaliações reais de clientes
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              {providerReviews.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  Nenhuma avaliação registrada ainda para este prestador. Seja o primeiro a agendar e avaliar!
                </div>
              ) : (
                <div className="space-y-3">
                  {providerReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-200">
                            {rev.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-zinc-200">{rev.clientName}</h5>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        "{rev.comment}"
                      </p>

                      {rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rev.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-300 font-medium"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Persistent Floating Bottom Bar if Cart Has Items for This Provider */}
        {providerCartItems.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400">
                  {providerCartItems.length} {providerCartItems.length === 1 ? 'serviço' : 'serviços'}
                </span>
                <span className="text-zinc-600 text-xs">•</span>
                <span className="flex items-center gap-1 text-xs text-cyan-300 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(totalCartMinutes)}
                </span>
              </div>
              <div className="text-lg font-extrabold text-white">
                {formatCurrency(totalCartPrice)}
              </div>
            </div>

            <button
              onClick={onProceedToBooking}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Avançar para Agendamento</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

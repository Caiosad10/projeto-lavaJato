import React, { useState } from 'react';
import {
  Provider,
  Appointment,
  ProviderNotification,
  ServiceItem,
  Professional,
  AppointmentStatus
} from '../types';
import {
  Store,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  Plus,
  Trash2,
  Settings,
  Users,
  Building2,
  User,
  MessageCircle,
  Car,
  Star,
  Check,
  PlayCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/timeUtils';

interface ProviderPortalProps {
  providers: Provider[];
  activeProviderId: string;
  onSelectActiveProvider: (id: string) => void;
  appointments: Appointment[];
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  notifications: ProviderNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onUpdateProviderSettings: (providerId: string, updates: Partial<Provider>) => void;
  onAddService: (providerId: string, service: Omit<ServiceItem, 'id'>) => void;
  onRemoveService: (providerId: string, serviceId: string) => void;
  onAddProfessional: (providerId: string, professional: Omit<Professional, 'id'>) => void;
}

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  providers,
  activeProviderId,
  onSelectActiveProvider,
  appointments,
  onUpdateAppointmentStatus,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsRead,
  onUpdateProviderSettings,
  onAddService,
  onRemoveService,
  onAddProfessional,
}) => {
  const currentProvider = providers.find((p) => p.id === activeProviderId) || providers[0];
  const [activeSection, setActiveSection] = useState<
    'agenda' | 'notifications' | 'menu' | 'settings' | 'team'
  >('agenda');

  // Filter appointments and notifications for current provider
  const providerAppointments = appointments.filter((a) => a.providerId === currentProvider.id);
  const providerNotifications = notifications.filter((n) => n.providerId === currentProvider.id);
  const unreadCount = providerNotifications.filter((n) => !n.read).length;

  // New service form state
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(50);
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<'lavagem' | 'estetica' | 'higienizacao' | 'protecao'>('lavagem');

  // New professional form state
  const [isAddingProf, setIsAddingProf] = useState(false);
  const [newProfName, setNewProfName] = useState('');
  const [newProfRole, setNewProfRole] = useState('Lavador Especialista');

  // Total revenue calculated
  const totalRevenue = providerAppointments
    .filter((a) => a.paymentStatus === 'paid' && a.status !== 'cancelado')
    .reduce((acc, a) => acc + a.totalPrice, 0);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    onAddService(currentProvider.id, {
      name: newServiceName,
      price: Number(newServicePrice),
      durationMinutes: Number(newServiceDuration),
      description: newServiceDesc || 'Serviço detalhado de limpeza automotiva.',
      category: newServiceCategory,
    });
    setNewServiceName('');
    setNewServiceDesc('');
    setIsAddingService(false);
  };

  const handleCreateProf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName) return;
    onAddProfessional(currentProvider.id, {
      name: newProfName,
      role: newProfRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      rating: 5.0,
    });
    setNewProfName('');
    setIsAddingProf(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28 text-white">
      {/* Top Banner & Active Provider Switcher */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentProvider.avatar}
            alt={currentProvider.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{currentProvider.name}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentProvider.type === 'establishment'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {currentProvider.type === 'establishment' ? 'Lava-Jato / Loja' : 'Lavador Autônomo'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{currentProvider.address}</p>

            {/* Quick stats */}
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                Faturamento: {formatCurrency(totalRevenue)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {currentProvider.rating.toFixed(1)} ({currentProvider.totalReviews} avaliações)
              </span>
            </div>
          </div>
        </div>

        {/* Seletor só aparece se houver mais de um prestador (modo legado / admin) */}
        {providers.length > 1 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="text-xs text-zinc-400">
              <span className="block text-[10px] text-zinc-500">Alternar Prestador:</span>
              <select
                value={currentProvider.id}
                onChange={(e) => onSelectActiveProvider(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type === 'establishment' ? 'Loja' : 'Autônomo'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Sub Navigation Bar for Provider Portal — quebra linha em vez de rolar horizontalmente */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <button
          onClick={() => setActiveSection('agenda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'agenda'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda & Atendimentos ({providerAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'notifications'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notificações</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-zinc-950 text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'menu'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Cardápio de Serviços ({currentProvider.services.length})</span>
        </button>

        {currentProvider.type === 'establishment' && (
          <button
            onClick={() => setActiveSection('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'team'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipe ({currentProvider.professionals.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveSection('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'settings'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuração de Horários</span>
        </button>
      </div>

      {/* SECTION: AGENDA */}
      {activeSection === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Atendimentos Agendados</h3>
              <p className="text-xs text-zinc-400">
                Acompanhe e atualize os status para que o cliente receba o andamento em tempo real.
              </p>
            </div>
          </div>

          {providerAppointments.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 text-zinc-400 text-xs">
              Nenhum agendamento ativo para este prestador no momento.
            </div>
          ) : (
            <div className="space-y-3.5">
              {providerAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{apt.clientName}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-cyan-300 font-medium">
                        {apt.carModel} ({apt.carPlate})
                      </span>
                      <span className="text-zinc-600">•</span>
                      <a
                        href={`https://wa.me/55${apt.clientPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {apt.clientPhone}
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <div className="flex items-center gap-1 text-purple-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>
                          {apt.date} • {apt.startTime} às {apt.endTime}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-cyan-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Duração: {formatDuration(apt.totalDurationMinutes)}</span>
                      </div>
                      {apt.professionalName && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-300">
                            Atribuído a: <strong>{apt.professionalName}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Services tag */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {apt.services.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-300"
                        >
                          {s.name} ({s.durationMinutes}m)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Status Control */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                        {formatCurrency(apt.totalPrice)} • {apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.status === 'agendado' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'em_andamento')}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Iniciar Lavagem</span>
                        </button>
                      )}

                      {apt.status === 'em_andamento' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'concluido')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Concluir Serviço</span>
                        </button>
                      )}

                      {apt.status === 'concluido' && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Finalizado</span>
                        </span>
                      )}

                      {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'cancelado')}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: NOTIFICATIONS */}
      {activeSection === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Central de Notificações</h3>
              <p className="text-xs text-zinc-400">
                Alertas instantâneos de novos agendamentos confirmados e pagamentos efetivados.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllNotificationsRead}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {providerNotifications.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 text-zinc-500 text-xs">
              Nenhuma notificação recebida até agora.
            </div>
          ) : (
            <div className="space-y-2.5">
              {providerNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => onMarkNotificationAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    !notif.read
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-md'
                      : 'bg-zinc-900 border-zinc-800/80 opacity-80'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.type === 'payment_confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : notif.type === 'review_received'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{notif.title}</h4>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(notif.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: MENU MANAGEMENT */}
      {activeSection === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Cardápio de Serviços</h3>
              <p className="text-xs text-zinc-400">
                Cadastre e edite os serviços, definindo preço e estimativa de tempo realista para a agenda.
              </p>
            </div>
            <button
              onClick={() => setIsAddingService(!isAddingService)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Serviço</span>
            </button>
          </div>

          {/* Add Service Modal/Drawer */}
          {isAddingService && (
            <form
              onSubmit={handleCreateService}
              className="p-5 rounded-3xl bg-zinc-900 border border-purple-500/40 space-y-4 animate-in fade-in"
            >
              <h4 className="font-bold text-sm text-purple-300">Adicionar Novo Serviço</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Nome do Serviço</label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Ex: Polimento de Faróis"
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Duração Estimada (Minutos)</label>
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={20}>20 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                    <option value={120}>120 minutos (2 horas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Categoria</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) =>
                      setNewServiceCategory(
                        e.target.value as 'lavagem' | 'estetica' | 'higienizacao' | 'protecao'
                      )
                    }
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500"
                  >
                    <option value="lavagem">Lavagem</option>
                    <option value="higienizacao">Higienização</option>
                    <option value="estetica">Estética Automotiva</option>
                    <option value="protecao">Proteção e Vitrificação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-xs block mb-1">Descrição</label>
                <textarea
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Explique o que inclui o serviço e diferenciais..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingService(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          )}

          {/* Current Services List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentProvider.services.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{s.name}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-1">{s.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="font-extrabold text-emerald-400">{formatCurrency(s.price)}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-cyan-300 font-semibold">{formatDuration(s.durationMinutes)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveService(currentProvider.id, s.id)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Remover serviço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: TEAM MANAGEMENT (Establishments) */}
      {activeSection === 'team' && currentProvider.type === 'establishment' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Equipe de Profissionais</h3>
              <p className="text-xs text-zinc-400">
                Profissionais cadastrados que os clientes podem selecionar na hora do agendamento.
              </p>
            </div>
            <button
              onClick={() => setIsAddingProf(!isAddingProf)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Profissional</span>
            </button>
          </div>

          {isAddingProf && (
            <form
              onSubmit={handleCreateProf}
              className="p-5 rounded-3xl bg-zinc-900 border border-purple-500/40 space-y-3"
            >
              <h4 className="font-bold text-sm text-purple-300">Cadastrar Profissional</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={newProfName}
                    onChange={(e) => setNewProfName(e.target.value)}
                    placeholder="Ex: Gabriel Santos"
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Cargo / Especialidade</label>
                  <input
                    type="text"
                    required
                    value={newProfRole}
                    onChange={(e) => setNewProfRole(e.target.value)}
                    placeholder="Ex: Lavador Detailer"
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProf(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentProvider.professionals.map((prof) => (
              <div
                key={prof.id}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3.5"
              >
                <img
                  src={prof.avatar}
                  alt={prof.name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-purple-500/30"
                />
                <div>
                  <h4 className="font-bold text-xs text-white">{prof.name}</h4>
                  <p className="text-[11px] text-zinc-400">{prof.role}</p>
                  {prof.rating && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      ★ {prof.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SETTINGS & SCHEDULE INTERVALS */}
      {activeSection === 'settings' && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Configuração de Horários & Agenda</h3>
            <p className="text-xs text-zinc-400">
              Conforme sua solicitação: "A disponibilização de horario deve ser mediante ao que o estabelecimento/profissional define, se vai ser de hora em hora, de 30mins em 30mins ou de 15 em 15".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot interval picker */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                Intervalo de Disponibilização de Horários
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((mins) => {
                  const isSelected = currentProvider.slotIntervalMinutes === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() =>
                        onUpdateProviderSettings(currentProvider.id, {
                          slotIntervalMinutes: mins as 15 | 30 | 60,
                        })
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-400 text-white font-black shadow-lg shadow-purple-600/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-sm block">{mins}m</span>
                      <span className="text-[10px] opacity-80">
                        {mins === 60 ? '1 em 1 hora' : `de ${mins} em ${mins}m`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Essa configuração define o passo das janelas de início no calendário do cliente.
              </p>
            </div>

            {/* Opening hours */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3 text-xs">
              <label className="font-bold uppercase tracking-wider text-zinc-300 block">
                Horário de Abertura e Fechamento
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Abre às</label>
                  <input
                    type="time"
                    value={currentProvider.openTime}
                    onChange={(e) =>
                      onUpdateProviderSettings(currentProvider.id, { openTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Fecha às</label>
                  <input
                    type="time"
                    value={currentProvider.closeTime}
                    onChange={(e) =>
                      onUpdateProviderSettings(currentProvider.id, { closeTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✓ Atualizado automaticamente no motor de cálculo de agendamentos.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

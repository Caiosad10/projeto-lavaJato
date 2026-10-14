/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Provider,
  CartItem,
  Appointment,
  Review,
  ProviderNotification,
  ServiceItem,
  AppointmentStatus,
  User,
  ProviderType,
} from './types';
import {
  INITIAL_PROVIDERS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
} from './mockData';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { EstablishmentCard } from './components/EstablishmentCard';
import { EstablishmentDetailModal } from './components/EstablishmentDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { BookingModal } from './components/BookingModal';
import { AppointmentsView } from './components/AppointmentsView';
import { ReviewModal } from './components/ReviewModal';
import { ProviderPortal } from './components/ProviderPortal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import {
  Search,
  Building2,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from './utils/timeUtils';
import {
  fetchServerState,
  subscribeServerState,
  pushState,
} from './utils/sync';
import type { ServerState } from './utils/sync';

function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* ignore */
  }
}

function isProviderRole(role: User['role']) {
  return role === 'loja' || role === 'autonomo';
}

export default function App() {
  // ---------- Sessão ----------
  const [session, setSession] = useState<User | null>(() => {
    const saved = localStorage.getItem('lavajato_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lavajato_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Área do prestador só quando logado como loja/autônomo
  const isProviderArea = !!(session && isProviderRole(session.role));

  // ---------- Navegação ----------
  const [activeTab, setActiveTab] = useState<NavTab>(() =>
    session && isProviderRole(session.role) ? 'provider' : 'home'
  );
  const [selectedCity, setSelectedCity] = useState<string>('Rio de Janeiro');

  // ---------- Dados ----------
  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('lavajato_providers');
    return saved ? JSON.parse(saved) : INITIAL_PROVIDERS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('lavajato_appointments');
    // Partida limpa: histórico sempre vazio no primeiro acesso —
    // cada agendamento nasce vinculado ao clientUserId do usuário logado.
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('lavajato_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [notifications, setNotifications] = useState<ProviderNotification[]>(() => {
    const saved = localStorage.getItem('lavajato_notifications');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'notif-welcome',
            providerId: 'prov-1',
            title: 'Sistema Conectado',
            message:
              'Bem-vindo ao LavaJato Hub. Notificações de novos agendamentos aparecerão aqui.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'new_booking',
          },
        ];
  });

  // Prestador logado (ou null)
  const sessionProviderId = session?.providerId || null;

  // ---------- Carrinho e modais ----------
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState<Provider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointmentToReview, setAppointmentToReview] = useState<Appointment | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
  /** Após login bem-sucedido no checkout, abrir booking */
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<'todos' | 'establishment' | 'autonomous'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------- Persistência ----------
  useEffect(() => {
    if (session) localStorage.setItem('lavajato_session', JSON.stringify(session));
    else localStorage.removeItem('lavajato_session');
  }, [session]);

  useEffect(() => {
    localStorage.setItem('lavajato_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lavajato_providers', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem('lavajato_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('lavajato_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('lavajato_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Se logou no meio do checkout, abre o booking
  useEffect(() => {
    if (pendingCheckout && session && session.role === 'cliente' && cart.length > 0) {
      setPendingCheckout(false);
      setIsCartOpen(false);
      setSelectedProviderForDetail(null);
      setIsBookingModalOpen(true);
    }
  }, [pendingCheckout, session, cart.length]);

  // ---------- Tempo real (SSE) ----------
  // Refs para o handler de eventos não ficar com closure velha
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const providerIdRef = useRef(sessionProviderId);
  providerIdRef.current = sessionProviderId;
  /** Ids de notificações já conhecidas (evita chime duplicado no eco do próprio dispositivo) */
  const knownNotifIdsRef = useRef<Set<string>>(
    new Set(notifications.map((n) => n.id))
  );

  /**
   * Aplica o estado vindo do servidor e toca o som + toast quando chega
   * uma notificação NOVA e relevante para a sessão deste dispositivo
   * (prestador: novo agendamento/avaliação; cliente: mudança de status).
   */
  const applyServerState = (incoming: ServerState, withChime: boolean) => {
    const known = knownNotifIdsRef.current;
    const fresh = incoming.notifications.filter((n) => !known.has(n.id));
    incoming.notifications.forEach((n) => known.add(n.id));

    setUsers(incoming.users);
    setProviders(incoming.providers);
    setAppointments(incoming.appointments);
    setReviews(incoming.reviews);
    setNotifications(incoming.notifications);

    if (!withChime || fresh.length === 0) return;
    const sess = sessionRef.current;
    if (!sess) return;
    const provId = providerIdRef.current;
    const relevant = fresh.find(
      (n) =>
        (sess.role === 'cliente' && n.clientUserId === sess.id) ||
        (!!provId && n.providerId === provId && !n.clientUserId)
    );
    if (relevant) {
      playNotificationChime();
      showToast(relevant.title);
    }
  };

  useEffect(() => {
    let disposed = false;
    let unsub: (() => void) | null = null;
    let hasAppliedOnce = false;

    fetchServerState().then((initial) => {
      if (disposed) return;
      if (initial) {
        applyServerState(initial, false);
        hasAppliedOnce = true;
      }
      // Assina mesmo se o fetch falhou: o EventSource reconecta sozinho.
      // A primeira mensagem só carrega o estado (sem chime); a partir da
      // segunda, notificações novas tocam o som.
      unsub = subscribeServerState((s) => {
        if (disposed) return;
        const withChime = hasAppliedOnce;
        hasAppliedOnce = true;
        applyServerState(s, withChime);
      });
    });

    return () => {
      disposed = true;
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ao mudar papel (login/logout), ajusta a tab
  useEffect(() => {
    if (session && isProviderRole(session.role)) {
      setActiveTab('provider');
    } else if (!session || session.role === 'cliente') {
      if (activeTab === 'provider') setActiveTab('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.role]);

  // ---------- Helpers ----------
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };

  // ---------- Auth ----------
  const handleLogin = (user: User) => {
    setSession(user);
    showToast(`Bem-vindo(a), ${user.name}!`);
    if (isProviderRole(user.role)) {
      setActiveTab('provider');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setActiveTab('home');
    showToast('Você saiu da conta.');
  };

  const handleRegisterClient = (data: { name: string; phone: string }): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      role: 'cliente',
    };
    setUsers((prev) => [...prev, newUser]);
    setSession(newUser);
    showToast(`Conta criada. Olá, ${newUser.name}!`);
    void pushState('/users', { user: newUser });
    return newUser;
  };

  const handleRegisterProvider = (data: {
    name: string;
    phone: string;
    businessName: string;
    type: ProviderType;
    address: string;
  }): User => {
    const userId = `user-${Date.now()}`;
    const providerId = `prov-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: data.name,
      phone: data.phone,
      role: data.type === 'establishment' ? 'loja' : 'autonomo',
      providerId,
    };

    const newProvider: Provider = {
      id: providerId,
      name: data.businessName,
      type: data.type,
      userId,
      tagline: data.type === 'establishment' ? 'Lava-jato parceiro' : 'Lavador autônomo',
      description: 'Novo prestador no LavaJato Hub.',
      address: data.address,
      city: 'Rio de Janeiro',
      state: 'RJ',
      distanceKm: 0,
      avatar: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop&q=80',
      rating: 5,
      totalReviews: 0,
      workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      openTime: '08:00',
      closeTime: '18:00',
      slotIntervalMinutes: 30,
      socials: {},
      professionals: [
        {
          id: `prof-${Date.now()}`,
          name: data.name,
          role: data.type === 'establishment' ? 'Responsável' : 'Profissional Autônomo',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
        },
      ],
      services: [],
    };

    setUsers((prev) => [...prev, newUser]);
    setProviders((prev) => [...prev, newProvider]);
    setSession(newUser);
    setActiveTab('provider');
    showToast(`Prestador "${data.businessName}" cadastrado!`);
    void pushState('/users', { user: newUser });
    void pushState('/providers', { provider: newProvider });
    return newUser;
  };

  const openAuth = (reason?: string) => {
    setAuthReason(reason);
    setIsAuthOpen(true);
  };

  // ---------- Carrinho ----------
  const handleAddToCart = (service: ServiceItem, provider: Provider) => {
    if (cart.length > 0 && cart[0].providerId !== provider.id) {
      setCart([{ providerId: provider.id, service }]);
      showToast(`Carrinho atualizado para serviços de ${provider.name}`);
      return;
    }
    if (!cart.some((item) => item.service.id === service.id)) {
      setCart((prev) => [...prev, { providerId: provider.id, service }]);
      showToast(`"${service.name}" adicionado ao carrinho!`);
    }
  };

  const handleRemoveFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const handleClearCart = () => setCart([]);

  /** Gate de login no checkout */
  const handleProceedToBooking = () => {
    if (cart.length === 0) return;

    // Precisa estar logado como cliente
    if (!session || session.role !== 'cliente') {
      setPendingCheckout(true);
      setIsCartOpen(false);
      openAuth('Para finalizar o agendamento, entre com uma conta de cliente.');
      return;
    }

    setIsCartOpen(false);
    setSelectedProviderForDetail(null);
    setIsBookingModalOpen(true);
  };

  // ---------- Booking ----------
  const handleConfirmBooking = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newId = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      createdAt: new Date().toISOString(),
      clientUserId: session?.id,
      clientName: appointmentData.clientName || session?.name || 'Cliente',
      clientPhone: appointmentData.clientPhone || session?.phone || '',
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setCart([]);

    const newNotification: ProviderNotification = {
      id: `notif-${Date.now()}`,
      providerId: appointmentData.providerId,
      title: 'Novo Agendamento Confirmado!',
      message: `${newAppointment.clientName} agendou para ${appointmentData.date} às ${appointmentData.startTime} (${appointmentData.carModel} - ${appointmentData.carPlate}). Pagamento de ${formatCurrency(appointmentData.totalPrice)} confirmado.`,
      timestamp: new Date().toISOString(),
      read: false,
      appointmentId: newId,
      type: 'new_booking',
    };

    setNotifications((prev) => [newNotification, ...prev]);
    knownNotifIdsRef.current.add(newNotification.id);
    playNotificationChime();
    showToast('Agendamento confirmado! O prestador recebeu a notificação.');
    // Tempo real: envia para o servidor (o prestador no outro aparelho recebe via SSE)
    void pushState('/appointments', {
      appointment: newAppointment,
      notification: newNotification,
    });
  };

  const handleUpdateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    const apt = appointments.find((a) => a.id === id);
    if (apt) {
      if (newStatus === 'em_andamento') {
        showToast(`Status atualizado: ${apt.carModel} entrou em lavagem!`);
      } else if (newStatus === 'concluido') {
        showToast('Lavagem concluída! O cliente já pode avaliar.');
        playNotificationChime();
      }

      // Notificação dirigida ao cliente (aparece no sino dele, aqui ou no outro aparelho)
      let statusNotification: ProviderNotification | undefined;
      if (apt.clientUserId && (newStatus === 'em_andamento' || newStatus === 'concluido')) {
        const statusLabel =
          newStatus === 'em_andamento' ? 'entrou em lavagem' : 'foi concluída';
        statusNotification = {
          id: `notif-status-${Date.now()}`,
          providerId: apt.providerId,
          clientUserId: apt.clientUserId,
          title: newStatus === 'concluido' ? 'Lavagem Concluída!' : 'Lavagem Iniciada',
          message: `${apt.carModel} ${statusLabel}. ${apt.providerName} atualizou o status do seu atendimento.`,
          timestamp: new Date().toISOString(),
          read: false,
          appointmentId: apt.id,
          type: 'status_update',
        };
        knownNotifIdsRef.current.add(statusNotification.id);
        setNotifications((prev) => [statusNotification!, ...prev]);
      }

      // Tempo real: o cliente no outro aparelho recebe a atualização + notificação
      void pushState(
        `/appointments/${id}`,
        { status: newStatus, notification: statusNotification },
        'PATCH'
      );
    }
  };

  const handleSubmitReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === reviewData.appointmentId ? { ...apt, hasReview: true } : apt
      )
    );
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === reviewData.providerId) {
          const providerAllReviews = [
            ...reviews.filter((r) => r.providerId === p.id),
            newReview,
          ];
          const avg =
            providerAllReviews.reduce((sum, r) => sum + r.rating, 0) /
            providerAllReviews.length;
          return {
            ...p,
            rating: Number(avg.toFixed(1)),
            totalReviews: providerAllReviews.length,
          };
        }
        return p;
      })
    );
    const reviewNotification: ProviderNotification = {
      id: `notif-rev-${Date.now()}`,
      providerId: reviewData.providerId,
      title: 'Nova Avaliação!',
      message: `${reviewData.clientName} avaliou com ${reviewData.rating} estrelas: "${reviewData.comment}"`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'review_received',
    };
    knownNotifIdsRef.current.add(reviewNotification.id);
    setNotifications((prev) => [reviewNotification, ...prev]);
    setAppointmentToReview(null);
    showToast('Avaliação enviada com sucesso!');
    playNotificationChime();
    // Tempo real: prestador recebe a avaliação no outro aparelho
    void pushState('/reviews', {
      review: newReview,
      appointmentId: reviewData.appointmentId,
      providerId: reviewData.providerId,
      notification: reviewNotification,
    });
  };

  const handleUpdateProviderSettings = (providerId: string, updates: Partial<Provider>) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, ...updates } : p))
    );
    const updated = providers.find((p) => p.id === providerId);
    if (updated) {
      void pushState(`/providers/${providerId}`, { provider: { ...updated, ...updates } }, 'PUT');
    }
    showToast('Configurações salvas!');
  };

  const handleAddService = (providerId: string, serviceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = { ...serviceData, id: `serv-${Date.now()}` };
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, services: [...p.services, newService] } : p
      )
    );
    const updated = providers.find((p) => p.id === providerId);
    if (updated) {
      void pushState(
        `/providers/${providerId}`,
        { provider: { ...updated, services: [...updated.services, newService] } },
        'PUT'
      );
    }
    showToast(`Serviço "${newService.name}" adicionado!`);
  };

  const handleRemoveService = (providerId: string, serviceId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, services: p.services.filter((s) => s.id !== serviceId) }
          : p
      )
    );
    const updated = providers.find((p) => p.id === providerId);
    if (updated) {
      void pushState(
        `/providers/${providerId}`,
        { provider: { ...updated, services: updated.services.filter((s) => s.id !== serviceId) } },
        'PUT'
      );
    }
    showToast('Serviço removido.');
  };

  const handleAddProfessional = (
    providerId: string,
    profData: Omit<Provider['professionals'][0], 'id'>
  ) => {
    const newProf = { ...profData, id: `prof-${Date.now()}` };
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, professionals: [...p.professionals, newProf] }
          : p
      )
    );
    const updated = providers.find((p) => p.id === providerId);
    if (updated) {
      void pushState(
        `/providers/${providerId}`,
        { provider: { ...updated, professionals: [...updated.professionals, newProf] } },
        'PUT'
      );
    }
    showToast(`Profissional "${newProf.name}" cadastrado!`);
  };

  // ---------- Filtros ----------
  const filteredProviders = providers.filter((p) => {
    if (typeFilter !== 'todos' && p.type !== typeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.services.some(
          (s) =>
            s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        )
      );
    }
    return true;
  });

  const cartProvider = providers.find((p) => p.id === (cart[0]?.providerId || ''));

  // Notificações filtradas para o papel logado:
  // - prestador: as do próprio prestador
  // - cliente: apenas as dirigidas a ele (ex.: mudanças de status)
  // - sem sessão: nenhuma
  const visibleNotifications = isProviderArea && sessionProviderId
    ? notifications.filter((n) => n.providerId === sessionProviderId)
    : session?.role === 'cliente'
      ? notifications.filter((n) => n.clientUserId === session.id)
      : [];

  // Agendamentos do cliente logado — histórico estritamente vinculado ao usuário.
  // Sem sessão (ou sem papel de cliente): lista vazia.
  const clientAppointments =
    session?.role === 'cliente'
      ? appointments.filter((a) => a.clientUserId === session.id)
      : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-purple-500/50 shadow-2xl text-xs font-bold text-white flex items-center gap-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header
        isProviderArea={isProviderArea}
        session={session}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        notifications={visibleNotifications}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenAuth={() => openAuth()}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto pb-24">
        {isProviderArea && sessionProviderId ? (
          <ProviderPortal
            providers={providers.filter((p) => p.id === sessionProviderId)}
            activeProviderId={sessionProviderId}
            onSelectActiveProvider={() => {
              /* prestador só vê o próprio — seletor desativado */
            }}
            appointments={appointments}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            notifications={visibleNotifications}
            onMarkNotificationAsRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              );
              void pushState('/notifications/read', { ids: [id] });
            }}
            onMarkAllNotificationsRead={() => {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.providerId === sessionProviderId ? { ...n, read: true } : n
                )
              );
              if (sessionProviderId) {
                void pushState('/notifications/read', {
                  all: true,
                  providerId: sessionProviderId,
                });
              }
            }}
            onUpdateProviderSettings={handleUpdateProviderSettings}
            onAddService={handleAddService}
            onRemoveService={handleRemoveService}
            onAddProfessional={handleAddProfessional}
          />
        ) : (
          <>
            {activeTab === 'appointments' && (
              <AppointmentsView
                appointments={clientAppointments}
                onOpenReviewModal={(apt) => setAppointmentToReview(apt)}
                onUpdateStatus={handleUpdateAppointmentStatus}
                onNewBookingClick={() => setActiveTab('home')}
                isLoggedIn={session?.role === 'cliente'}
                onLoginClick={() => openAuth('Entre com uma conta de cliente para ver seu histórico.')}
              />
            )}

            {activeTab === 'search' && (
              <div className="px-4 py-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <Search className="w-6 h-6 text-purple-400" />
                    <span>Buscar Lava-Jatos e Lavadores</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pesquise por nome, bairro ou serviço (ex: lavagem externa, cera).
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar lava-jato, autônomo ou serviço..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-zinc-500 shadow-xl"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {(['todos', 'establishment', 'autonomous'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTypeFilter(f)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        typeFilter === f
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {f === 'establishment' && <Building2 className="w-3.5 h-3.5" />}
                      {f === 'autonomous' && <UserIcon className="w-3.5 h-3.5" />}
                      {f === 'todos' && `Todos (${providers.length})`}
                      {f === 'establishment' && 'Lava-Jatos / Lojas'}
                      {f === 'autonomous' && 'Lavadores Autônomos'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProviders.map((provider) => (
                    <EstablishmentCard
                      key={provider.id}
                      provider={provider}
                      onSelect={(p) => setSelectedProviderForDetail(p)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'home' && (
              <div className="space-y-6 px-4 py-6">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/60 via-zinc-900 to-indigo-950/40 border border-purple-500/20 p-6 sm:p-8 shadow-2xl">
                  <div className="relative z-10 max-w-xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Agendamento Inteligente & Efetivação Imediata</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                      Lave seu carro com facilidade, sem filas e com hora marcada.
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      Encontre lava-jatos e lavadores autônomos. Monte o carrinho, escolha o
                      horário e tenha o tempo total calculado com precisão.
                      {!session && (
                        <span className="block mt-1 text-zinc-400">
                          Navegue livremente. O login só é pedido na hora de finalizar.
                        </span>
                      )}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar lava-jato ou serviço..."
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/60 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <button
                        onClick={() => setActiveTab('search')}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                      >
                        Explorar
                      </button>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div>
                    <h3 className="text-lg font-black text-white">Prestadores Próximos de Você</h3>
                    <p className="text-xs text-zinc-400">
                      Estabelecimento físico ou lavador delivery
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 w-fit">
                    {(['todos', 'establishment', 'autonomous'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTypeFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                          typeFilter === f
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {f === 'establishment' && <Building2 className="w-3.5 h-3.5" />}
                        {f === 'autonomous' && <UserIcon className="w-3.5 h-3.5" />}
                        {f === 'todos' && `Todos (${providers.length})`}
                        {f === 'establishment' && 'Lava-Jatos'}
                        {f === 'autonomous' && 'Autônomos'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProviders.map((provider) => (
                    <EstablishmentCard
                      key={provider.id}
                      provider={provider}
                      onSelect={(p) => setSelectedProviderForDetail(p)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-zinc-900">
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-white">Cálculo Realista de Tempo</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Selecione vários serviços. O sistema soma os minutos e reserva o bloco na agenda.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-white">Efetivação com Notificação</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Agendamento efetivado com confirmação e alerta instantâneo ao prestador.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-white">Avaliação Pós-Serviço</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Após a lavagem, avalie com estrelas e tags para enriquecer o histórico.
                    </p>
                  </div>
                </div>

                {/* CTA prestador na home pública */}
                {!session && (
                  <div className="p-4 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 text-center space-y-2">
                    <p className="text-sm text-zinc-300">
                      Você tem um lava-jato ou trabalha como lavador autônomo?
                    </p>
                    <button
                      onClick={() => openAuth()}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700"
                    >
                      Cadastrar como prestador
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modais — área cliente */}
      {selectedProviderForDetail && !isProviderArea && (
        <EstablishmentDetailModal
          provider={selectedProviderForDetail}
          onClose={() => setSelectedProviderForDetail(null)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onProceedToBooking={handleProceedToBooking}
          reviews={reviews}
        />
      )}

      {!isProviderArea && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          providers={providers}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onProceedToBooking={handleProceedToBooking}
        />
      )}

      {isBookingModalOpen && cartProvider && (
        <BookingModal
          provider={cartProvider}
          services={cart.map((c) => c.service)}
          allAppointments={appointments}
          onClose={() => setIsBookingModalOpen(false)}
          onConfirmBooking={handleConfirmBooking}
          onSuccessClose={() => {
            setIsBookingModalOpen(false);
            setSelectedProviderForDetail(null);
            setActiveTab('home');
          }}
          initialClientName={session?.name || ''}
          initialClientPhone={session?.phone || ''}
        />
      )}

      {appointmentToReview && (
        <ReviewModal
          appointment={appointmentToReview}
          onClose={() => setAppointmentToReview(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      <NotificationModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={visibleNotifications}
        onMarkAllAsRead={() => {
          if (session?.role === 'cliente') {
            setNotifications((prev) =>
              prev.map((n) =>
                n.clientUserId === session.id ? { ...n, read: true } : n
              )
            );
            void pushState('/notifications/read', {
              all: true,
              clientUserId: session.id,
            });
          } else {
            setNotifications((prev) =>
              prev.map((n) =>
                sessionProviderId && n.providerId === sessionProviderId
                  ? { ...n, read: true }
                  : n
              )
            );
            if (sessionProviderId) {
              void pushState('/notifications/read', {
                all: true,
                providerId: sessionProviderId,
              });
            }
          }
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingCheckout(false);
        }}
        reason={authReason}
        users={users}
        onLogin={handleLogin}
        onRegisterClient={handleRegisterClient}
        onRegisterProvider={handleRegisterProvider}
      />

      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        appointmentsCount={
          clientAppointments.filter(
            (a) => a.status === 'agendado' || a.status === 'em_andamento'
          ).length
        }
        unreadNotificationsCount={visibleNotifications.filter((n) => !n.read).length}
        isProviderArea={isProviderArea}
      />
    </div>
  );
}

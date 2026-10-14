export type ProviderType = 'establishment' | 'autonomous';

/** Papel do usuário na sessão */
export type UserRole = 'cliente' | 'loja' | 'autonomo';

export interface User {
  id: string;
  name: string;
  phone?: string;
  role: UserRole;
  /** Vinculado quando role é loja ou autonomo */
  providerId?: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating?: number;
  phone?: string;
}

export type ServiceCategory = 'lavagem' | 'estetica' | 'higienizacao' | 'protecao';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
  popular?: boolean;
}

export interface SocialLinks {
  instagram?: string;
  whatsapp?: string;
  website?: string;
  googleMaps?: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  avatar: string;
  coverImage: string;
  rating: number;
  totalReviews: number;
  workingDays: string[];
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: 15 | 30 | 60;
  socials: SocialLinks;
  professionals: Professional[];
  services: ServiceItem[];
  /** Usuário dono deste prestador (após login/cadastro) */
  userId?: string;
}

export interface CartItem {
  providerId: string;
  service: ServiceItem;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'cash';
export type PaymentStatus = 'pending' | 'paid';
export type AppointmentStatus = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  professionalId?: string;
  professionalName?: string;
  clientName: string;
  clientPhone: string;
  /** userId do cliente, quando logado */
  clientUserId?: string;
  carModel: string;
  carPlate: string;
  services: ServiceItem[];
  totalDurationMinutes: number;
  totalPrice: number;
  date: string;
  startTime: string;
  endTime: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  createdAt: string;
  hasReview: boolean;
}

export interface Review {
  id: string;
  appointmentId: string;
  providerId: string;
  clientName: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
  servicesGiven: string[];
}

export interface ProviderNotification {
  id: string;
  providerId: string;
  /** Quando a notificação se destina ao cliente (ex.: mudança de status) */
  clientUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  appointmentId?: string;
  type: 'new_booking' | 'payment_confirmed' | 'review_received' | 'status_update';
}

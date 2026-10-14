import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import {
  Calendar,
  Clock,
  Car,
  User,
  CheckCircle2,
  Star,
  Sparkles,
  Building2,
  AlertCircle,
  PlayCircle,
  Check,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/timeUtils';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onOpenReviewModal: (appointment: Appointment) => void;
  onUpdateStatus: (appointmentId: string, newStatus: AppointmentStatus) => void;
  onNewBookingClick: () => void;
  /** false = sem sessão de cliente: mostra convite para entrar */
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onOpenReviewModal,
  onUpdateStatus,
  onNewBookingClick,
  isLoggedIn = true,
  onLoginClick,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filtered = appointments.filter((apt) => {
    if (filterStatus === 'todos') return true;
    return apt.status === filterStatus;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'agendado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Agendado
          </span>
        );
      case 'em_andamento':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            Em Lavagem
          </span>
        );
      case 'concluido':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            <span>Histórico de Atendimentos</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Acompanhe o status das suas lavagens e avalie os prestadores após a conclusão.
          </p>
        </div>

        {/* Filter Pills — quebram linha em vez de rolar na horizontal */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'agendado', label: 'Agendados' },
            { id: 'em_andamento', label: 'Em Andamento' },
            { id: 'concluido', label: 'Concluídos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Appointments */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Calendar className="w-7 h-7" />
          </div>
          {!isLoggedIn ? (
            <>
              <h4 className="font-bold text-base text-zinc-200">Entre para ver seu histórico</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Seus agendamentos ficam vinculados à sua conta. Entre com uma conta de cliente
                para acompanhar o status e avaliar os serviços.
              </p>
              <button
                onClick={onLoginClick || onNewBookingClick}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              <h4 className="font-bold text-base text-zinc-200">Nenhum atendimento encontrado</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Você ainda não possui atendimentos com este filtro. Escolha um estabelecimento e agende sua primeira lavagem!
              </p>
              <button
                onClick={onNewBookingClick}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Explorar Lava-Jatos
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const isFinished = apt.status === 'concluido';
            const isOngoing = apt.status === 'em_andamento';

            return (
              <div
                key={apt.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-zinc-700 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-purple-400">
                      {apt.providerType === 'establishment' ? (
                        <Building2 className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{apt.providerName}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {apt.professionalName ? `Profissional: ${apt.professionalName}` : 'Lavador Autônomo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(apt.status)}
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/30">
                      {formatCurrency(apt.totalPrice)} ({apt.paymentMethod.toUpperCase()})
                    </span>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Data & Horário:</span>
                      <strong className="text-white">
                        {apt.date} • {apt.startTime} às {apt.endTime}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Duração Calculada:</span>
                      <strong className="text-cyan-300">
                        {formatDuration(apt.totalDurationMinutes)}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Veículo Cadastrado:</span>
                      <strong className="text-white">
                        {apt.carModel} ({apt.carPlate})
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Services list in this appointment */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Serviços Contratados ({apt.services.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {apt.services.map((serv) => (
                      <span
                        key={serv.id}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1.5"
                      >
                        <span>{serv.name}</span>
                        <span className="text-[10px] text-cyan-400 font-medium">
                          ({serv.durationMinutes}m)
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="font-bold text-white">{formatCurrency(serv.price)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-zinc-400">Progresso do Serviço:</span>
                    <span className="text-zinc-500 text-[10px]">
                      {isFinished ? 'Atendimento Finalizado' : isOngoing ? 'Carro em processo de lavagem' : 'Aguardando chegada ao local'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`h-2 flex-1 rounded-full ${apt.status !== 'cancelado' ? 'bg-purple-600' : 'bg-red-600'}`} />
                    <div className={`h-2 flex-1 rounded-full ${isOngoing || isFinished ? 'bg-purple-600' : 'bg-zinc-800'}`} />
                    <div className={`h-2 flex-1 rounded-full ${isFinished ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>1. Agendado & Pago</span>
                    <span>2. Em Lavagem</span>
                    <span>3. Pronto / Concluído</span>
                  </div>
                </div>

                {/* Footer Controls & Review Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
                  {/* Simulation status changers for quick testing */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="text-[11px]">Simular etapa:</span>
                    {apt.status === 'agendado' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'em_andamento')}
                        className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-purple-300 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>Iniciar Lavagem</span>
                      </button>
                    )}
                    {apt.status === 'em_andamento' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'concluido')}
                        className="px-2 py-1 rounded-md bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Concluir Serviço</span>
                      </button>
                    )}
                    {apt.status === 'concluido' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'agendado')}
                        className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] flex items-center gap-1"
                        title="Resetar para testar novamente"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reiniciar</span>
                      </button>
                    )}
                  </div>

                  {/* Review Action */}
                  {isFinished && (
                    <div>
                      {apt.hasReview ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Atendimento Avaliado</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenReviewModal(apt)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 animate-pulse"
                        >
                          <Star className="w-4 h-4 fill-zinc-950" />
                          <span>Avaliar Atendimento Agora</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

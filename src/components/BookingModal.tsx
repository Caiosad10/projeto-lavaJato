import React, { useState, useMemo } from 'react';
import { Provider, ServiceItem, Professional, Appointment, PaymentMethod } from '../types';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Car,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Building2
} from 'lucide-react';
import {
  formatCurrency,
  formatDuration,
  calculateAvailableSlots,
  GeneratedSlot
} from '../utils/timeUtils';

interface BookingModalProps {
  provider: Provider;
  services: ServiceItem[];
  allAppointments: Appointment[];
  onClose: () => void;
  onConfirmBooking: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  /** Após confirmação: fecha e retorna ao hub (tela inicial) */
  onSuccessClose?: () => void;
  /** Dados do cliente logado para pré-preencher o formulário */
  initialClientName?: string;
  initialClientPhone?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  provider,
  services,
  allAppointments,
  onClose,
  onConfirmBooking,
  onSuccessClose,
  initialClientName = '',
  initialClientPhone = '',
}) => {
  const isEstablishment = provider.type === 'establishment';

  // Step state: 1 = Date & Prof, 2 = Time Slot, 3 = Vehicle Info, 4 = Payment, 5 = Success
  const [step, setStep] = useState<number>(1);

  // Selected state
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(
    isEstablishment ? (provider.professionals[0]?.id || '') : (provider.professionals[0]?.id || 'autonomous')
  );

  // Default to today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [selectedSlot, setSelectedSlot] = useState<GeneratedSlot | null>(null);

  // Client and vehicle details — pré-preenchidos com o usuário da sessão
  const [clientName, setClientName] = useState<string>(initialClientName);
  const [clientPhone, setClientPhone] = useState<string>(initialClientPhone);
  const [carModel, setCarModel] = useState<string>('Toyota Corolla Cross');
  const [carPlate, setCarPlate] = useState<string>('BRA-2E19');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [pixCopied, setPixCopied] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Calculate total duration and price
  const totalDurationMinutes = useMemo(() => {
    return services.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [services]);

  const totalPrice = useMemo(() => {
    return services.reduce((acc, s) => acc + s.price, 0);
  }, [services]);

  // Selected professional object
  const currentProf = provider.professionals.find((p) => p.id === selectedProfessionalId);

  // Available slots dynamically calculated with collision detection
  const availableSlots = useMemo(() => {
    return calculateAvailableSlots(
      provider,
      selectedDate,
      totalDurationMinutes,
      allAppointments,
      selectedProfessionalId
    );
  }, [provider, selectedDate, totalDurationMinutes, allAppointments, selectedProfessionalId]);

  // Handle Pix Copy
  const pixCode = `00020126580014br.gov.bcb.pix0136${provider.id}-lava-jato520400005303986540${totalPrice.toFixed(2)}5802BR5925${provider.name.slice(0, 25)}6009RIO DE JANEIRO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  // Confirm and Pay
  const handleExecutePayment = () => {
    if (!selectedSlot) return;

    setIsProcessingPayment(true);

    // Simulate real gateway / PIX network confirmation
    setTimeout(() => {
      setIsProcessingPayment(false);
      setBookingSuccess(true);

      const newAppointment: Omit<Appointment, 'id' | 'createdAt'> = {
        providerId: provider.id,
        providerName: provider.name,
        providerType: provider.type,
        professionalId: currentProf?.id,
        professionalName: currentProf?.name,
        clientName,
        clientPhone,
        carModel,
        carPlate,
        services,
        totalDurationMinutes,
        totalPrice,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        paymentStatus: 'paid',
        paymentMethod,
        status: 'agendado',
        hasReview: false,
      };

      onConfirmBooking(newAppointment);
    }, 1200);
  };

  // Generate next 7 days for quick date selector
  const upcomingDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('pt-BR', { month: 'short' });
      days.push({ dateStr: str, weekday, dayNum, month });
    }
    return days;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden">
      <div className="relative w-full max-w-2xl bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Agendamento de Serviços</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <span>{provider.name}</span>
                <span>•</span>
                <span className="text-cyan-400 font-medium">
                  {services.length} {services.length === 1 ? 'serviço' : 'serviços'} ({formatDuration(totalDurationMinutes)})
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator — layout que sempre cabe na largura da tela */}
        {!bookingSuccess && (
          <div className="px-4 sm:px-6 py-3 bg-zinc-900/30 border-b border-zinc-800/80">
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4].map((n, i) => (
                <React.Fragment key={n}>
                  {i > 0 && (
                    <div
                      className={`h-px flex-1 max-w-12 ${
                        step >= n ? 'bg-purple-500/70' : 'bg-zinc-800'
                      }`}
                    />
                  )}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                      step >= n
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {n}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div className="text-center text-[11px] mt-1.5 font-bold text-purple-400 truncate">
              Passo {step} de 4 ·{' '}
              {step === 1 && 'Data & Profissional'}
              {step === 2 && 'Horário Real'}
              {step === 3 && 'Veículo'}
              {step === 4 && 'Pagamento'}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden max-h-[68vh] space-y-5">
          {/* SUCCESS SCREEN */}
          {bookingSuccess ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Pagamento Confirmado & Efetivado
                </span>
                <h4 className="text-2xl font-black text-white">Agendamento Realizado com Sucesso!</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  O estabelecimento <strong>{provider.name}</strong> recebeu a notificação imediata com os detalhes do seu veículo e serviços.
                </p>
              </div>

              {/* Booking Voucher Summary */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Data e Horário:</span>
                  <span className="font-bold text-white">
                    {selectedDate} ({selectedSlot?.startTime} às {selectedSlot?.endTime})
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Profissional:</span>
                  <span className="font-bold text-purple-300">{currentProf?.name || 'Profissional Designado'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Veículo:</span>
                  <span className="font-bold text-white">{carModel} ({carPlate})</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Duração Total Calculada:</span>
                  <span className="font-bold text-cyan-300">{formatDuration(totalDurationMinutes)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-zinc-400">Total Pago:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => (onSuccessClose || onClose)()}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Date & Professional */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Select Date */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
                      1. Selecione a Data
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {upcomingDays.map((item) => {
                        const isSelected = selectedDate === item.dateStr;
                        return (
                          <button
                            key={item.dateStr}
                            onClick={() => setSelectedDate(item.dateStr)}
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                                : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-semibold opacity-70">
                              {item.weekday}
                            </span>
                            <span className="text-base font-extrabold my-0.5">{item.dayNum}</span>
                            <span className="text-[10px] opacity-70">{item.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Professional (if establishment) */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
                      2. {isEstablishment ? 'Selecione o Profissional / Lavador' : 'Profissional Responsável'}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {provider.professionals.map((prof) => {
                        const isSelected = selectedProfessionalId === prof.id;
                        return (
                          <div
                            key={prof.id}
                            onClick={() => setSelectedProfessionalId(prof.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/40'
                                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <img
                              src={prof.avatar}
                              alt={prof.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-purple-500/30"
                            />
                            <div className="flex-1">
                              <h5 className="font-bold text-xs text-white flex items-center justify-between">
                                <span>{prof.name}</span>
                                {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                              </h5>
                              <p className="text-[11px] text-zinc-400">{prof.role}</p>
                              {prof.rating && (
                                <span className="text-[10px] text-amber-400 font-semibold">
                                  ★ {prof.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary of services chosen */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400 block">Tempo total dos {services.length} serviços:</span>
                      <strong className="text-cyan-300 text-sm font-extrabold">{formatDuration(totalDurationMinutes)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400 block">Subtotal:</span>
                      <strong className="text-emerald-400 text-sm font-extrabold">{formatCurrency(totalPrice)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Realistic Time Slot Selection */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Explanatory badge */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-zinc-900 border border-purple-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-purple-200 font-bold">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Cálculo de Bloco de Tempo Dinâmico ({formatDuration(totalDurationMinutes)})</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      Os horários abaixo já consideram o término real do seu serviço. Ao escolher um horário, o profissional <strong>{currentProf?.name}</strong> ficará reservado até o fim do atendimento (liberando a próxima vaga logo após o término).
                    </p>
                    <div className="text-[10px] text-cyan-300 font-mono">
                      Intervalo definido pelo prestador: de {provider.slotIntervalMinutes} em {provider.slotIntervalMinutes} minutos.
                    </div>
                  </div>

                  {/* Slots Grid */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                      Horários Disponíveis em {selectedDate}:
                    </label>

                    {availableSlots.length === 0 ? (
                      <div className="p-8 text-center bg-zinc-900/60 rounded-xl border border-zinc-800 text-zinc-400 text-xs">
                        Nenhum horário disponível para esta data com duração de {formatDuration(totalDurationMinutes)}. Tente outra data.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                !slot.available
                                  ? 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600 cursor-not-allowed opacity-50'
                                  : isSelected
                                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                                  : 'bg-zinc-900/80 border-zinc-800 hover:border-purple-500/50 text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-sm">{slot.startTime}</span>
                                {slot.available ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Livre
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-red-500/20 text-red-400">
                                    Ocupado
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] opacity-80 mt-1">
                                Término: <strong>{slot.endTime}</strong>
                              </div>
                              {slot.conflictReason && (
                                <div className="text-[9px] text-red-400 mt-0.5 truncate">
                                  {slot.conflictReason}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedSlot && (
                    <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/40 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-zinc-300 block">Horário Selecionado:</span>
                        <span className="font-black text-white text-sm">
                          {selectedSlot.startTime} às {selectedSlot.endTime}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400 block">Próxima vaga livre para terceiros:</span>
                        <span className="font-bold text-cyan-300 text-xs">A partir de {selectedSlot.endTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Vehicle & Client Data */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-xs text-zinc-400 bg-zinc-900/70 p-3 rounded-xl border border-zinc-800">
                    Preencha os dados do veículo para que a equipe prepare os produtos adequados (shampoos para cerâmica, limpadores de couro, etc.).
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Seu Nome Completo
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-xs text-white"
                        placeholder="Ex: Carlos Silva"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        WhatsApp / Celular para Notificações
                      </label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-xs text-white"
                        placeholder="(21) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Modelo do Carro & Cor
                      </label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-xs text-white"
                        placeholder="Ex: Honda Civic Preto"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Placa do Veículo
                      </label>
                      <input
                        type="text"
                        value={carPlate}
                        onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-xs text-white font-mono uppercase"
                        placeholder="ABC-1234 ou ABC1D23"
                      />
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <div className="font-bold text-zinc-200">Resumo do Atendimento:</div>
                    <div className="text-zinc-400">
                      {services.map((s) => s.name).join(', ')}
                    </div>
                    <div className="text-cyan-300 font-semibold pt-1">
                      Data: {selectedDate} | {selectedSlot?.startTime} às {selectedSlot?.endTime} ({formatDuration(totalDurationMinutes)})
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Payment Confirmation ("só é efetivado se o pagamento for realizado") */}
              {step === 4 && (
                <div className="space-y-4">
                  {/* Mandatory payment requirement alert */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Regra de Efetivação:</strong> O agendamento só é efetivado após a confirmação do pagamento. Assim que concluído, {isEstablishment ? 'o estabelecimento' : 'o profissional'} recebe a notificação instantânea.
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                      Forma de Pagamento
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'pix'
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs font-bold">PIX Instantâneo</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('credit_card')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'credit_card'
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-bold">Cartão de Crédito</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'cash'
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold">No Local</span>
                      </button>
                    </div>
                  </div>

                  {/* PIX Gateway details */}
                  {paymentMethod === 'pix' && (
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
                      <div className="text-xs text-zinc-400">
                        Escaneie o QR Code ou use o Pix Copia e Cola para efetivar:
                      </div>

                      {/* Simulated QR Code */}
                      <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
                        <div className="w-full h-full border-4 border-black p-1 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-6 h-6 bg-black" />
                            <div className="w-6 h-6 bg-black" />
                          </div>
                          <div className="text-center font-mono font-black text-[9px] text-black">
                            PIX R$ {totalPrice.toFixed(2)}
                          </div>
                          <div className="flex justify-between">
                            <div className="w-6 h-6 bg-black" />
                            <div className="w-3 h-3 bg-purple-600 rounded-full mx-auto" />
                          </div>
                        </div>
                      </div>

                      {/* Copy Pix */}
                      <div className="flex items-center gap-2 max-w-sm mx-auto">
                        <input
                          type="text"
                          readOnly
                          value={pixCode}
                          className="flex-1 p-2 rounded-lg bg-black/60 border border-zinc-800 text-[10px] text-zinc-400 font-mono truncate"
                        />
                        <button
                          onClick={handleCopyPix}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                        >
                          {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-emerald-400 font-medium">
                        ✓ Confirmação em tempo real e emissão instantânea
                      </div>
                    </div>
                  )}

                  {/* Credit Card Fields */}
                  {paymentMethod === 'credit_card' && (
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1">Número do Cartão</label>
                        <input
                          type="text"
                          defaultValue="4532 •••• •••• 9921"
                          className="w-full p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-400 block mb-1">Validade</label>
                          <input
                            type="text"
                            defaultValue="11/29"
                            className="w-full p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">CVV</label>
                          <input
                            type="text"
                            defaultValue="882"
                            className="w-full p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Details */}
                  {paymentMethod === 'cash' && (
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                      <p>
                        Você optou por pagar diretamente ao estabelecimento ou profissional no momento da entrega do veículo.
                      </p>
                      <p className="text-zinc-400 text-[11px]">
                        Ao confirmar, sua vaga é travada e a notificação é despachada.
                      </p>
                    </div>
                  )}

                  {/* Total to pay */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 block">Total a pagar:</span>
                      <strong className="text-lg font-black text-emerald-400">{formatCurrency(totalPrice)}</strong>
                    </div>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Pagamento 100% Seguro
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!bookingSuccess && (
          <div className="p-5 border-t border-zinc-800 bg-zinc-950/95 flex flex-wrap items-center justify-between gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Voltar
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 2 && !selectedSlot) return;
                  setStep((prev) => prev + 1);
                }}
                disabled={step === 2 && !selectedSlot}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  step === 2 && !selectedSlot
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                }`}
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleExecutePayment}
                disabled={isProcessingPayment}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processando Pagamento...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pagar {formatCurrency(totalPrice)} & Efetivar Agendamento</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

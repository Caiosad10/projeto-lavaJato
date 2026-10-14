import React, { useState } from 'react';
import { Appointment, Review } from '../types';
import { X, Star, Sparkles, Check, Send } from 'lucide-react';

interface ReviewModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSubmitReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
}

const AVAILABLE_TAGS = [
  'Pontualidade impecável',
  'Carro brilhando',
  'Aroma muito agradável',
  'Cuidado nos cantinhos',
  'Ótimo atendimento',
  'Bom custo-benefício',
  'Profissional educado',
  'Preço justo',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  appointment,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Pontualidade impecável',
    'Cuidado nos cantinhos',
  ]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    onSubmitReview({
      appointmentId: appointment.id,
      providerId: appointment.providerId,
      clientName: appointment.clientName,
      rating,
      comment: comment.trim() || 'Serviço executado com excelência e muito cuidado com meu veículo!',
      tags: selectedTags,
      servicesGiven: appointment.services.map((s) => s.name),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Avaliar Atendimento</h3>
              <p className="text-xs text-zinc-400">{appointment.providerName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Services summary */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs flex items-center justify-between">
            <div>
              <span className="text-zinc-500 block">Serviços Realizados:</span>
              <span className="font-semibold text-zinc-200">
                {appointment.services.map((s) => s.name).join(' + ')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block">Veículo:</span>
              <span className="font-bold text-purple-300">{appointment.carModel}</span>
            </div>
          </div>

          {/* Stars Selection */}
          <div className="text-center space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Como foi sua experiência geral?
            </label>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                  aria-label={`Avaliar ${star} estrelas`}
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-amber-400">
              {rating === 5 && '🌟 Impecável, superou as expectativas!'}
              {rating === 4 && '👍 Muito bom, gostei do serviço.'}
              {rating === 3 && '😐 Na média, atendeu ao básico.'}
              {rating === 2 && '👎 Deixou a desejar.'}
              {rating === 1 && '⚠️ Experiência insatisfatória.'}
            </div>
          </div>

          {/* Quick compliment tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Destaques do Atendimento (O que mais gostou?)
            </label>

            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text feedback */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Escreva seu comentário
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi o atendimento, a limpeza e o cuidado com seu carro..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-zinc-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-colors"
            >
              Agora Não
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar Avaliação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { Appointment, Provider } from '../types';

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remaining}min`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  conflictReason?: string;
}

/**
 * Calculates available time slots for a given provider, date, professional, and total service duration.
 */
export function calculateAvailableSlots(
  provider: Provider,
  dateStr: string,
  totalDurationMinutes: number,
  allAppointments: Appointment[],
  selectedProfessionalId?: string
): GeneratedSlot[] {
  const openMins = timeToMinutes(provider.openTime);
  const closeMins = timeToMinutes(provider.closeTime);
  const step = provider.slotIntervalMinutes || 30; // 15, 30, or 60

  // Filter relevant existing active appointments for that date
  const relevantAppointments = allAppointments.filter((apt) => {
    if (apt.status === 'cancelado') return false;
    if (apt.date !== dateStr) return false;
    if (apt.providerId !== provider.id) return false;

    // If establishment with professional selected:
    if (provider.type === 'establishment' && selectedProfessionalId) {
      return apt.professionalId === selectedProfessionalId;
    }
    // For autonomous or if any professional
    return true;
  });

  const slots: GeneratedSlot[] = [];

  for (let current = openMins; current + totalDurationMinutes <= closeMins; current += step) {
    const startStr = minutesToTime(current);
    const endMinutes = current + totalDurationMinutes;
    const endStr = minutesToTime(endMinutes);

    // Check collision with any existing appointment
    let hasConflict = false;
    let conflictReason = '';

    for (const apt of relevantAppointments) {
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);

      // Overlap condition:
      // (current < aptEnd) && (endMinutes > aptStart)
      if (current < aptEnd && endMinutes > aptStart) {
        hasConflict = true;
        conflictReason = `Ocupado (${apt.startTime} às ${apt.endTime})`;
        break;
      }
    }

    slots.push({
      startTime: startStr,
      endTime: endStr,
      available: !hasConflict,
      conflictReason: hasConflict ? conflictReason : undefined,
    });
  }

  return slots;
}

// src/lib/date-utils.ts
export class ArgentinaDateUtils {
  static readonly TIMEZONE = 'America/Argentina/Buenos_Aires';
  static readonly LOCALE = 'es-AR';

  // Convertir a hora argentina - ENFOQUE DIRECTO
  static toArgentinaTime(date?: Date | string | null): Date {
    if (!date) {
      // Para fecha actual, usar este enfoque que respeta la timezone
      const now = new Date();
      return new Date(now.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
    }

    try {
      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) {
        console.warn('Fecha inválida:', date);
        return new Date();
      }

      // Usar Intl.DateTimeFormat para conversión precisa
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: this.TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(inputDate);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

      return new Date(
        parseInt(getPart('year')),
        parseInt(getPart('month')) - 1,
        parseInt(getPart('day')),
        parseInt(getPart('hour')),
        parseInt(getPart('minute')),
        parseInt(getPart('second'))
      );

    } catch (error) {
      console.error('Error en toArgentinaTime:', error);
      return new Date();
    }
  }

  // Para inputs: convertir fecha local (hora argentina) a UTC
  static localToUTC(date: Date): Date {
    try {
      // Obtener el offset de Argentina para esta fecha específica
      const argentinaDate = this.toArgentinaTime(date);
      const utcString = argentinaDate.toISOString();
      return new Date(utcString);
    } catch (error) {
      console.error('Error en localToUTC:', error);
      return new Date();
    }
  }

  // Para outputs: convertir UTC a hora argentina
  static UTCToLocal(date: string | Date): Date {
    try {
      const utcDate = new Date(date);
      if (isNaN(utcDate.getTime())) {
        return new Date();
      }
      return this.toArgentinaTime(utcDate);
    } catch (error) {
      console.error('Error en UTCToLocal:', error);
      return new Date();
    }
  }

  // Para inputs type="date" necesitamos yyyy-MM-dd
  static formatDateForInput(date: Date): string {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error en formatDateForInput:', error);
      // Fallback a fecha actual en formato correcto
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
  }

  // Para display (visual) mantener dd/MM/yyyy
  static formatDate(date: Date): string {
    try {
      return date.toLocaleDateString(this.LOCALE, {
        timeZone: this.TIMEZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error en formatDate:', error);
      return '--/--/----';
    }
  }

  static formatTime(date: Date): string {
    try {
      return date.toLocaleTimeString(this.LOCALE, {
        timeZone: this.TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error en formatTime:', error);
      return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }

  static formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  // Crear fecha a partir de partes (más confiable)
  static createDateFromParts(year: number, month: number, day: number, hour: number, minute: number): Date {
    // Crear en UTC y luego convertir
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return this.toArgentinaTime(utcDate);
  }

  // Para queries: crear rangos de fecha en hora argentina
  static createDateRange(date: string | Date): { start: Date; end: Date } {
    try {
      const argDate = this.toArgentinaTime(date);
      const start = new Date(argDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(argDate);
      end.setHours(23, 59, 59, 999);

      return {
        start: this.localToUTC(start),
        end: this.localToUTC(end)
      };
    } catch (error) {
      console.error('Error en createDateRange:', error);
      // Fallback: rango del día actual
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }

  // Obtener la fecha actual en hora argentina
  static getTime(): Date {
    return this.toArgentinaTime();
  }
}
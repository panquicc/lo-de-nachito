// src/lib/date-utils.ts
// En date-utils.ts, prueba esta versión más robusta:
export function getArgentinaTime(date?: Date | string): Date {
  const inputDate = date ? new Date(date) : new Date();
  // Convertir a string en timezone Argentina y luego crear nueva fecha
  const argentinaString = inputDate.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Crear nueva fecha desde el string localizado
  const [datePart, timePart] = argentinaString.split(', ');
  const [day, month, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // Los meses son 0-indexed
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
}

export function formatArgentinaDate(date: Date): string {
    return date.toLocaleDateString('es-AR', {
    timeZone: "America/Argentina/Buenos_Aires",
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatArgentinaTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function toArgentinaISOString(date: Date): string {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()
}
// src/hooks/useArgentinaTime.ts
import { ArgentinaDateUtils } from "@/lib/date-utils";

export function useArgentinaTime() {
    const now = () => ArgentinaDateUtils.toArgentinaTime();

    const formatForInput = (date: Date) => {
        const argDate = ArgentinaDateUtils.toArgentinaTime(date);
        return argDate.toISOString().slice(0, 16); // Formato 'YYYY-MM-DDTHH:mm'
    };

    const parseFromInput = (value: string) => {
        return ArgentinaDateUtils.localToUTC(new Date(value));
    };

    return {
        now,
        formatForInput,
        parseFromInput,
        formatDate: ArgentinaDateUtils.formatDate,
        formatTime: ArgentinaDateUtils.formatTime,
        formatDateTime: ArgentinaDateUtils.formatDateTime
    };
}; 
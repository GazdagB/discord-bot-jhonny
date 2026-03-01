import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export function parseDate(date, time) {
    return fromZonedTime(`${date}T${time}:00`, 'Europe/Budapest');
}

export function formatDate(date) {
    return date.toLocaleString('hu-HU', {
        timeZone: 'Europe/Budapest',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
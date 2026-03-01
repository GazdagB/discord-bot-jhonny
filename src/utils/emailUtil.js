export function generateCalendarUrl(title, description, startDate, durationMinutes) {
    const start = startDate
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    const format = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${format(start)}/${format(end)}`,
        details: description,
        location: 'Discord - Build Together HU'
    });
    
    return `https://calendar.google.com/calendar/render?${params}`;
}
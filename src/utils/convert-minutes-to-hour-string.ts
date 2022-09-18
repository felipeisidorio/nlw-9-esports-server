// 18:00 --> 1080
export function convertHourStringToMinutes(hourString: string) {
    const [hours, minutes] = hourString.split(':').map(Number)

    const minutesAmaunt = (hours * 60) + minutes;
    return minutesAmaunt;
}
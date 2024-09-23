export function roundToNearestFiveMinutes(date, round) {
  const ms = 1000 * 60 * round; // convert 5 minutes to milliseconds
  const roundedDate = new Date(Math.round(date / ms) * ms);
  return roundedDate.getTime();
}

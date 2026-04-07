import type { FlightSchedule } from "@/types/flight";

const padNumber = (value: number) => String(value).padStart(2, "0");

export const formatDateToIso = (date: Date) => {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());

  return `${year}-${month}-${day}`;
};

export const formatTimeTo24Hour = (date: Date) =>
  `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;

export const createFutureDate = (daysOffset: number, baseDate = new Date()) => {
  const nextDate = new Date(baseDate);
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + daysOffset);

  return formatDateToIso(nextDate);
};

export const buildFutureStartDates = (offsets: number[]) =>
  offsets.map((offset) => createFutureDate(offset));

export const normalizeIsoDate = (date?: string, fallbackDays = 45) => {
  if (!date) {
    return createFutureDate(fallbackDays);
  }

  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return createFutureDate(fallbackDays);
  }

  return formatDateToIso(parsedDate);
};

export const buildDateTime = (date: string, time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map((value) => Number.parseInt(value, 10));
  const dateTime = new Date(`${date}T00:00:00`);
  dateTime.setHours(hours, minutes, 0, 0);

  return dateTime;
};

export const parseDurationToMinutes = (duration: string) => {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;

  return hours * 60 + minutes;
};

interface BuildScheduleOptions {
  departureDate: string;
  departureTime: string;
  totalDuration: string;
  departureTimezone: string;
  arrivalTimezone: string;
}

export const buildScheduleFromDeparture = ({
  departureDate,
  departureTime,
  totalDuration,
  departureTimezone,
  arrivalTimezone,
}: BuildScheduleOptions): FlightSchedule => {
  const normalizedDepartureDate = normalizeIsoDate(departureDate);
  const departureDateTime = buildDateTime(normalizedDepartureDate, departureTime);
  const arrivalDateTime = new Date(
    departureDateTime.getTime() + parseDurationToMinutes(totalDuration) * 60 * 1000
  );

  return {
    departure: {
      date: normalizedDepartureDate,
      time: departureTime,
      timezone: departureTimezone,
    },
    arrival: {
      date: formatDateToIso(arrivalDateTime),
      time: formatTimeTo24Hour(arrivalDateTime),
      timezone: arrivalTimezone,
    },
  };
};

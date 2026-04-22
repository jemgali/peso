export const MANILA_TIME_ZONE = "Asia/Manila";

const MANILA_OFFSET_MINUTES = 8 * 60;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

type DateParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

function getManilaParts(date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const findValue = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: findValue("year"),
    month: findValue("month"),
    day: findValue("day"),
    hour: findValue("hour"),
    minute: findValue("minute"),
  };
}

function toUtcDateFromManila(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date | null {
  const utcCandidate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  if (
    utcCandidate.getUTCFullYear() !== year ||
    utcCandidate.getUTCMonth() !== month - 1 ||
    utcCandidate.getUTCDate() !== day ||
    utcCandidate.getUTCHours() !== hour ||
    utcCandidate.getUTCMinutes() !== minute
  ) {
    return null;
  }

  return new Date(
    utcCandidate.getTime() - MANILA_OFFSET_MINUTES * 60 * 1000,
  );
}

export function parseManilaDateInput(value: string): Date | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return toUtcDateFromManila(year, month, day, 0, 0);
}

export function parseManilaDateTimeInput(value: string): Date | null {
  const match = DATETIME_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  return toUtcDateFromManila(year, month, day, hour, minute);
}

export function formatDateInputInManila(date: Date): string {
  const { year, month, day } = getManilaParts(date);
  return `${year}-${month}-${day}`;
}

export function formatDateTimeInputInManila(date: Date): string {
  const { year, month, day, hour, minute } = getManilaParts(date);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function formatDateKeyInManila(date: Date): string {
  return formatDateInputInManila(date);
}

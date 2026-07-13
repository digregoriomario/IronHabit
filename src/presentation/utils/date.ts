const padDatePart = (value: number) => String(value).padStart(2, "0");

export const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

export const startOfLocalWeek = (value: Date | string | number = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
};

export const addWeeks = (value: Date | string | number, amount: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + amount * 7);
  return startOfLocalWeek(date);
};

export const formatWeekRange = (value: Date | string | number) => {
  const start = startOfLocalWeek(value);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const formatter = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long"
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export const toDateInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return toLocalDateKey(new Date());
  return toLocalDateKey(date);
};

export const fromDateInput = (value) => {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(`${text}T12:00:00`);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return text;
  return Number.isNaN(date.getTime()) ? text : date.toISOString();
};

export const formatDate = (value) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));

export const formatShortDate = (value) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));

type IdLike = string | { _id?: string; id?: string; [key: string]: unknown } | null | undefined;

type BookingLike = {
  _id?: string;
  id?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  explorer?: IdLike;
  experience?: IdLike;
  [key: string]: unknown;
};

const pendingStatuses = new Set(["PENDING", "CONFIRMED"]);
const statusPriority: Record<string, number> = {
  DISPUTE_WON: 120,
  DISPUTED: 115,
  DISPUTE_LOST: 110,
  REFUNDED: 105,
  REFUND_FAILED: 100,
  COMPLETED: 95,
  AUTO_COMPLETED: 90,
  NO_SHOW: 85,
  PENDING_ATTENDANCE: 80,
  PAID: 70,
  DEPOSIT_PAID: 65,
  CANCELLED: 60,
  CONFIRMED: 20,
  PENDING: 10,
};

const readStringProp = (value: Record<string, unknown>, key: string) =>
  key in value && typeof value[key] === "string" ? String(value[key]) : "";

const buildExperienceFallbackKey = (value: Record<string, unknown>) => {
  const title = readStringProp(value, "title");
  const startsAt = readStringProp(value, "startsAt");
  const startDate = readStringProp(value, "startDate");
  const date = readStringProp(value, "date");
  const timeSlot = readStringProp(value, "timeSlot");
  if (!title && !startsAt && !startDate && !date && !timeSlot) return "";
  return [title, startsAt || startDate || date, timeSlot].filter(Boolean).join("::");
};

const toId = (value: IdLike) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (
    value._id ||
    value.id ||
    readStringProp(value, "email") ||
    readStringProp(value, "phone") ||
    readStringProp(value, "displayName") ||
    readStringProp(value, "name") ||
    buildExperienceFallbackKey(value)
  );
};

const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const getGroupKey = (booking: BookingLike) => {
  const explorerId = toId(booking.explorer);
  const experienceId = toId(booking.experience);
  if (!explorerId || !experienceId) return "";
  return `${explorerId}::${experienceId}`;
};

export function dedupeBookings<T extends BookingLike>(bookings: T[]): T[] {
  const groups = new Map<string, T[]>();
  const keepIds = new Set<string>();

  bookings.forEach((booking) => {
    const key = getGroupKey(booking);
    const bookingId = booking._id || booking.id;
    if (!key) {
      if (bookingId) keepIds.add(String(bookingId));
      return;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(booking);
  });

  groups.forEach((group) => {
    const preferred = group
      .slice()
      .sort((a, b) => {
        const aPending = pendingStatuses.has(String(a.status || ""));
        const bPending = pendingStatuses.has(String(b.status || ""));
        if (aPending !== bPending) return aPending ? 1 : -1;
        const aTime = toTimestamp(a.updatedAt) || toTimestamp(a.createdAt);
        const bTime = toTimestamp(b.updatedAt) || toTimestamp(b.createdAt);
        if (aTime !== bTime) return bTime - aTime;
        return (statusPriority[String(b.status || "")] || 0) - (statusPriority[String(a.status || "")] || 0);
      })[0];

    const bookingId = preferred?._id || preferred?.id;
    if (bookingId) keepIds.add(String(bookingId));
  });

  return bookings.filter((booking) => keepIds.has(String(booking._id || booking.id || "")));
}

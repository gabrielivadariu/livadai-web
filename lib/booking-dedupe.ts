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

const toId = (value: IdLike) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
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
    const nonPending = group.filter((booking) => !pendingStatuses.has(String(booking.status || "")));
    if (nonPending.length) {
      nonPending.forEach((booking) => {
        const bookingId = booking._id || booking.id;
        if (bookingId) keepIds.add(String(bookingId));
      });
      return;
    }

    const newestPending = group
      .slice()
      .sort((a, b) => {
        const aTime = toTimestamp(a.updatedAt) || toTimestamp(a.createdAt);
        const bTime = toTimestamp(b.updatedAt) || toTimestamp(b.createdAt);
        return bTime - aTime;
      })[0];

    const bookingId = newestPending?._id || newestPending?.id;
    if (bookingId) keepIds.add(String(bookingId));
  });

  return bookings.filter((booking) => keepIds.has(String(booking._id || booking.id || "")));
}

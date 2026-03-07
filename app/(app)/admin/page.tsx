"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import styles from "./admin.module.css";

type AdminDashboard = {
  generatedAt?: string;
  users?: {
    total?: number;
    explorersOnly?: number;
    hostsOnly?: number;
    bothRole?: number;
    admins?: number;
    hostCapable?: number;
    explorerCapable?: number;
    blocked?: number;
    banned?: number;
    newLast7d?: number;
  };
  experiences?: {
    total?: number;
    active?: number;
    inactive?: number;
    upcomingPublic?: number;
    newLast7d?: number;
  };
  bookings?: {
    total?: number;
    active?: number;
    refundFailed?: number;
  };
  reports?: {
    open?: number;
    openOrHandled?: number;
  };
};

type AdminUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  role: string;
  isBlocked?: boolean;
  isBanned?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  city?: string;
  country?: string;
  stripeAccountId?: string;
  isStripeChargesEnabled?: boolean;
  isStripePayoutsEnabled?: boolean;
  stripeConnected?: boolean;
};

type AdminUsersResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  summary?: {
    totalUsers?: number;
    totalHosts?: number;
    totalExplorers?: number;
    hostsStripeIncomplete?: number;
  };
  items: AdminUser[];
};

type AdminHost = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isBlocked?: boolean;
  isBanned?: boolean;
  stripeAccountId?: string | null;
  isStripeChargesEnabled?: boolean;
  isStripePayoutsEnabled?: boolean;
  isStripeDetailsSubmitted?: boolean;
  livadaiName?: string;
  stripeLegalName?: string;
  stripeDisplayName?: string;
  stripeBusinessType?: string;
  nameMatchState?: string;
  bankName?: string;
  bankLast4?: string;
  bankCountry?: string;
  bankCurrency?: string;
  bankReference?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneVerified?: boolean;
  city?: string;
  country?: string;
  accountDeletionStatus?: string;
  accountDeletionRequestedAt?: string | null;
  accountDeletionScheduledAt?: string | null;
  lastAuthAt?: string | null;
  createdAt?: string | null;
  snapshotAt?: string | null;
  issues?: string[];
  counts?: {
    experiencesTotal?: number;
    experiencesActive?: number;
    experiencesUpcoming?: number;
    bookingsTotal?: number;
    bookingsPaidLike?: number;
    bookingsDisputed?: number;
    participantsHosted?: number;
    reportsTotal?: number;
    reportsOpen?: number;
    reportsInvestigating?: number;
  };
};

type AdminHostsResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  summary?: {
    totalHosts?: number;
    blockedHosts?: number;
    bannedHosts?: number;
    stripeConnectedHosts?: number;
    complianceAttentionInPage?: number;
  };
  items: AdminHost[];
};

type AdminUserDetails = AdminUser & {
  phone?: string;
  phoneCountryCode?: string;
  phoneVerified?: boolean;
  languages?: string[];
  aboutMe?: string;
  shortBio?: string;
  experience?: string;
  tokenVersion?: number;
  lastAuthAt?: string | null;
  isTrustedParticipant?: boolean;
  clientFaultCancelsCount?: number;
  totalParticipants?: number;
  totalEvents?: number;
  ratingAvg?: number;
  ratingCount?: number;
  stripe?: {
    accountId?: string | null;
    connected?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    detailsSubmitted?: boolean;
  };
  hostProfile?: {
    displayName?: string;
    bio?: string;
    languages?: string[];
    city?: string;
    country?: string;
    phone?: string;
    avatar?: string;
  } | null;
};

type AdminUserTimelineItem = {
  kind: string;
  at?: string | null;
  label?: string;
  targetId?: string;
};

type AdminUserDetailsResponse = {
  user?: AdminUserDetails;
  counts?: {
    bookingsAsExplorer?: number;
    bookingsAsHost?: number;
    bookingsTotal?: number;
    experiencesHosted?: number;
    reportsCreated?: number;
    reportsAgainstUser?: number;
    messagesSent?: number;
  };
  recentBookings?: AdminBooking[];
  recentExperiences?: AdminExperience[];
  recentReports?: AdminReport[];
  recentAudit?: AdminAuditLogItem[];
  timeline?: AdminUserTimelineItem[];
};

type AdminExperience = {
  id: string;
  title?: string;
  status?: string;
  isActive?: boolean;
  price?: number;
  environment?: string | null;
  city?: string;
  country?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  maxParticipants?: number;
  remainingSpots?: number;
  soldOut?: boolean;
  participantsBooked?: number;
  createdAt?: string | null;
  host?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
};

type AdminExperiencesResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AdminExperience[];
};

type AdminExperienceMediaItem = {
  url: string;
  kind?: "image" | "video" | string;
  source?: string;
  publicId?: string | null;
  resourceType?: string;
};

type AdminExperienceDetails = AdminExperience & {
  shortDescription?: string;
  description?: string;
  category?: string;
  durationMinutes?: number;
  currencyCode?: string;
  activityType?: string;
  languages?: string[];
  address?: string;
  street?: string;
  streetNumber?: string;
  countryCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  reminderHostSent?: boolean;
  mediaCleanedAt?: string | null;
  host?: (AdminExperience["host"] & {
    stripeAccountId?: string | null;
    isStripeChargesEnabled?: boolean;
    isStripePayoutsEnabled?: boolean;
    isStripeDetailsSubmitted?: boolean;
  }) | null;
};

type AdminExperienceDetailsResponse = {
  experience?: AdminExperienceDetails;
  counts?: {
    bookingsTotal?: number;
    bookingsActive?: number;
    bookingsPaidLike?: number;
    participantsBooked?: number;
    reportsTotal?: number;
    reportsOpen?: number;
    messagesCount?: number;
    mediaItems?: number;
  };
  media?: AdminExperienceMediaItem[];
  recentBookings?: AdminBooking[];
  recentReports?: AdminReport[];
  recentAudit?: AdminAuditLogItem[];
  timeline?: AdminUserTimelineItem[];
};

type AdminAuditLogItem = {
  id: string;
  actorId?: string;
  actorEmail?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  diff?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
  createdAt?: string;
};

type AdminAuditLogsResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AdminAuditLogItem[];
};

type AdminBooking = {
  id: string;
  status?: string;
  attendanceStatus?: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  cancelledAt?: string | null;
  refundedAt?: string | null;
  payoutEligibleAt?: string | null;
  disputeReason?: string | null;
  host?: { id?: string; name?: string; email?: string } | null;
  explorer?: { id?: string; name?: string; email?: string } | null;
  experience?: {
    id?: string;
    title?: string;
    startsAt?: string | null;
    endsAt?: string | null;
    city?: string;
    country?: string;
    price?: number;
    status?: string;
    isActive?: boolean;
  } | null;
  payment?: {
    status?: string;
    paymentType?: string;
    amount?: number;
    currency?: string;
    hasStripePaymentIntent?: boolean;
    stripeSessionId?: string | null;
  } | null;
  reportsCount?: number;
  messagesCount?: number;
};

type AdminBookingsResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AdminBooking[];
};

type AdminBookingExperienceGroup = {
  key: string;
  experience: AdminBooking["experience"];
  host: AdminBooking["host"];
  bookings: AdminBooking[];
  totalSeats: number;
  totalReports: number;
  totalMessages: number;
};

type AdminMessageConversationItem = {
  bookingId: string;
  messagesCount?: number;
  lastMessageAt?: string | null;
  lastMessageText?: string;
  lastSender?: { id?: string; name?: string; email?: string } | null;
  reportsCount?: number;
  openReportsCount?: number;
  booking?: AdminBooking | null;
};

type AdminMessagesResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AdminMessageConversationItem[];
};

type AdminMessageThreadMessage = {
  id: string;
  bookingId?: string;
  sender?: { id?: string; name?: string; email?: string } | null;
  senderProfile?: { name?: string; profileImage?: string } | null;
  message?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AdminMessageThreadResponse = {
  booking?: AdminBooking;
  summary?: {
    firstMessageAt?: string | null;
    lastMessageAt?: string | null;
    messagesCount?: number;
    reportsOpen?: number;
    reportsTotal?: number;
  };
  messages?: AdminMessageThreadMessage[];
  reports?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
};

type AdminReport = {
  id: string;
  type?: string;
  status?: string;
  reason?: string;
  comment?: string;
  affectsPayout?: boolean;
  actionTaken?: string;
  createdAt?: string | null;
  deadlineAt?: string | null;
  handledAt?: string | null;
  handledBy?: string;
  assignedTo?: string;
  assignedAt?: string | null;
  ageHours?: number;
  overdue?: boolean;
  targetType?: string | null;
  reporter?: { id?: string; name?: string; email?: string } | null;
  host?: { id?: string; name?: string; email?: string } | null;
  targetUser?: { id?: string; name?: string; email?: string; isBlocked?: boolean; isBanned?: boolean } | null;
  experience?: { id?: string; title?: string; status?: string; isActive?: boolean; city?: string; country?: string } | null;
  booking?: { id?: string; status?: string; quantity?: number } | null;
  messagesCount?: number;
};

type AdminReportsResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AdminReport[];
};

type AdminPaymentsHealthBooking = {
  id: string;
  status?: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  payoutEligibleAt?: string | null;
  refundedAt?: string | null;
  cancelledAt?: string | null;
  refundAttempts?: number;
  lastRefundAttemptAt?: string | null;
  createdAt?: string | null;
  issueReason?: string;
  host?: {
    id?: string;
    name?: string;
    email?: string;
    stripeAccountId?: string | null;
    isStripeChargesEnabled?: boolean;
    isStripePayoutsEnabled?: boolean;
    isStripeDetailsSubmitted?: boolean;
  } | null;
  explorer?: { id?: string; name?: string; email?: string } | null;
  experience?: { id?: string; title?: string; city?: string; country?: string; startsAt?: string | null; status?: string; isActive?: boolean } | null;
  payment?: {
    status?: string;
    paymentType?: string;
    amount?: number;
    currency?: string;
    hasStripePaymentIntent?: boolean;
    stripeSessionId?: string | null;
  } | null;
};

type AdminPaymentsHostIssue = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isBlocked?: boolean;
  isBanned?: boolean;
  stripeAccountId?: string | null;
  isStripeChargesEnabled?: boolean;
  isStripePayoutsEnabled?: boolean;
  isStripeDetailsSubmitted?: boolean;
  totalEvents?: number;
  totalParticipants?: number;
  createdAt?: string | null;
  issues?: string[];
};

type AdminHostComplianceIssue = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  stripeAccountId?: string | null;
  livadaiName?: string;
  stripeLegalName?: string;
  stripeDisplayName?: string;
  stripeBusinessType?: string;
  nameMatchState?: string;
  bankName?: string;
  bankLast4?: string;
  bankCountry?: string;
  bankCurrency?: string;
  bankReference?: string;
  requirementsDisabledReason?: string;
  requirementsCurrentlyDueCount?: number;
  snapshotAt?: string | null;
  issues?: string[];
};

type AdminDisputedPaymentItem = {
  paymentId: string;
  bookingId?: string | null;
  status?: string;
  paymentType?: string;
  amount?: number;
  currency?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  booking?: AdminPaymentsHealthBooking | null;
};

type AdminPaymentsHealthResponse = {
  generatedAt?: string;
  summary?: {
    refundFailedBookings?: number;
    refundFailedLast7d?: number;
    disputedPayments?: number;
    stripeOnboardingIncompleteHosts?: number;
    stripeMissingAccountHosts?: number;
    payoutEligibleBookings?: number;
    payoutAttentionBookings?: number;
    hostComplianceAttentionHosts?: number;
    hostComplianceNameMismatches?: number;
    hostComplianceMissingBankReference?: number;
    hostComplianceNoSnapshot?: number;
  };
  refundFailedBookings?: AdminPaymentsHealthBooking[];
  stripeOnboardingIncompleteHosts?: AdminPaymentsHostIssue[];
  payoutAttentionBookings?: AdminPaymentsHealthBooking[];
  disputedPayments?: AdminDisputedPaymentItem[];
  hostComplianceAttentionHosts?: AdminHostComplianceIssue[];
};

type AdminSystemHealthResponse = {
  generatedAt?: string;
  runtime?: {
    nodeVersion?: string;
    env?: string;
    uptimeSeconds?: number;
    pid?: number;
  };
  database?: {
    state?: string;
    name?: string | null;
    host?: string | null;
  };
  security?: {
    adminAllowlistConfigured?: boolean;
    adminAllowlistCount?: number;
    adminRateLimitWindowMs?: number;
    adminRateLimitMax?: number;
    jwtSecretConfigured?: boolean;
    adminActionSecretConfigured?: boolean;
    cookieSecretConfigured?: boolean;
  };
  integrations?: {
    stripeSecretConfigured?: boolean;
    stripeWebhookSecretConfigured?: boolean;
    cloudinaryConfigured?: boolean;
    resendConfigured?: boolean;
    smtpConfigured?: boolean;
    reportsEmailConfigured?: boolean;
  };
  web?: {
    allowedWebOriginsCount?: number;
    allowedWebOrigins?: string[];
  };
  opsAttention?: {
    openReports?: number;
    investigatingReports?: number;
    refundFailedBookings?: number;
    disputedPayments?: number;
    staleInitiatedPayments?: number;
    adminActionsLast24h?: number;
  };
};

const ADMIN_CAPABILITIES = [
  "PANEL_READ",
  "USERS_WRITE",
  "EXPERIENCES_WRITE",
  "BOOKINGS_WRITE",
  "REPORTS_WRITE",
  "OWNER_WRITE",
] as const;

type AdminCapability = (typeof ADMIN_CAPABILITIES)[number];

type AdminPermissionsResponse = {
  role?: string;
  capabilities?: AdminCapability[];
  can?: {
    panelRead?: boolean;
    usersWrite?: boolean;
    experiencesWrite?: boolean;
    bookingsWrite?: boolean;
    reportsWrite?: boolean;
    ownerWrite?: boolean;
  };
};

type CriticalActionDialogConfig = {
  title: string;
  impact?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  requireTypeText?: string;
  confirmButtonLabel?: string;
};

const numberFmt = (value?: number) => new Intl.NumberFormat("ro-RO").format(Number(value || 0));
const formatMoney = (value?: number, currency?: string) =>
  `${numberFmt(value)} ${String(currency || "RON").toUpperCase()}`;

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
};

const formatJson = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const formatUptime = (seconds?: number) => {
  const total = Math.max(0, Number(seconds || 0));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days}z`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
};

const COMPLIANCE_ISSUE_LABELS: Record<string, string> = {
  NO_COMPLIANCE_SNAPSHOT: "Fără snapshot",
  NAME_MISMATCH: "Nume diferit",
  STRIPE_NAME_MISSING: "Nume Stripe lipsă",
  BANK_REFERENCE_MISSING: "Bank ref lipsă",
  STRIPE_DISABLED: "Stripe disabled",
  STRIPE_REQUIREMENTS_DUE: "Requirements due",
  STRIPE_DETAILS_INCOMPLETE: "Details incomplete",
  STRIPE_CHARGES_DISABLED: "Charges disabled",
  STRIPE_PAYOUTS_DISABLED: "Payouts disabled",
  STRIPE_LEGAL_NAME_MISSING: "Nume legal Stripe lipsă",
};

const formatComplianceIssue = (value?: string) => COMPLIANCE_ISSUE_LABELS[String(value || "")] || String(value || "");
const ADMIN_ROLES = ["OWNER_ADMIN", "ADMIN", "ADMIN_SUPPORT", "ADMIN_RISK", "ADMIN_FINANCE", "ADMIN_VIEWER"] as const;
const USER_ROLE_OPTIONS = ["EXPLORER", "HOST", "BOTH", ...ADMIN_ROLES] as const;
const ADMIN_ROLE_SET = new Set<string>(ADMIN_ROLES);
const normalizeRole = (value?: string | null) => String(value || "").trim().toUpperCase();
const isAdminRole = (role?: string | null) => ADMIN_ROLE_SET.has(normalizeRole(role));
const ADMIN_CAPABILITIES_BY_ROLE_FALLBACK: Record<string, AdminCapability[]> = {
  OWNER_ADMIN: [...ADMIN_CAPABILITIES],
  ADMIN: ["PANEL_READ", "USERS_WRITE", "EXPERIENCES_WRITE", "BOOKINGS_WRITE", "REPORTS_WRITE"],
  ADMIN_SUPPORT: ["PANEL_READ", "BOOKINGS_WRITE", "REPORTS_WRITE"],
  ADMIN_RISK: ["PANEL_READ", "USERS_WRITE", "EXPERIENCES_WRITE", "REPORTS_WRITE"],
  ADMIN_FINANCE: ["PANEL_READ", "BOOKINGS_WRITE"],
  ADMIN_VIEWER: ["PANEL_READ"],
};

const buildPermissionsFallback = (role?: string | null): AdminPermissionsResponse => {
  const normalizedRole = normalizeRole(role);
  const capabilities = (ADMIN_CAPABILITIES_BY_ROLE_FALLBACK[normalizedRole] || []) as AdminCapability[];
  return {
    role: normalizedRole,
    capabilities,
    can: {
      panelRead: capabilities.includes("PANEL_READ"),
      usersWrite: capabilities.includes("USERS_WRITE"),
      experiencesWrite: capabilities.includes("EXPERIENCES_WRITE"),
      bookingsWrite: capabilities.includes("BOOKINGS_WRITE"),
      reportsWrite: capabilities.includes("REPORTS_WRITE"),
      ownerWrite: capabilities.includes("OWNER_WRITE"),
    },
  };
};

const groupBookingsByExperience = (items: AdminBooking[]): AdminBookingExperienceGroup[] => {
  const map = new Map<string, AdminBookingExperienceGroup>();
  for (const booking of items) {
    const experienceId = booking.experience?.id || `booking:${booking.id}`;
    const existing = map.get(experienceId);
    if (!existing) {
      map.set(experienceId, {
        key: experienceId,
        experience: booking.experience || null,
        host: booking.host || null,
        bookings: [booking],
        totalSeats: Number(booking.quantity || 1),
        totalReports: Number(booking.reportsCount || 0),
        totalMessages: Number(booking.messagesCount || 0),
      });
      continue;
    }
    existing.bookings.push(booking);
    existing.totalSeats += Number(booking.quantity || 1);
    existing.totalReports += Number(booking.reportsCount || 0);
    existing.totalMessages += Number(booking.messagesCount || 0);
  }

  return Array.from(map.values()).map((group) => {
    const sortedBookings = [...group.bookings].sort((a, b) => {
      const aStart = new Date(a.experience?.startsAt || a.createdAt || 0).getTime();
      const bStart = new Date(b.experience?.startsAt || b.createdAt || 0).getTime();
      return bStart - aStart;
    });
    return { ...group, bookings: sortedBookings };
  });
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value?: number;
  hint?: string;
}) {
  return (
    <div className={`${styles.card} ${styles.statCard}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{numberFmt(value)}</div>
      {hint ? <div className={styles.statHint}>{hint}</div> : null}
    </div>
  );
}

function AdminUserRow({
  item,
  selected,
  busy,
  onOpenDetails,
  onSaveRole,
  onToggleBlocked,
  onToggleBanned,
  onInvalidateSessions,
}: {
  item: AdminUser;
  selected?: boolean;
  busy?: boolean;
  onOpenDetails: (id: string) => Promise<void>;
  onSaveRole: (id: string, role: string) => Promise<void>;
  onToggleBlocked: (id: string, nextValue: boolean) => Promise<void>;
  onToggleBanned: (id: string, nextValue: boolean) => Promise<void>;
  onInvalidateSessions: (id: string) => Promise<void>;
}) {
  const [roleValue, setRoleValue] = useState(item.role || "EXPLORER");

  useEffect(() => {
    setRoleValue(item.role || "EXPLORER");
  }, [item.role]);

  return (
    <div className={`${styles.card} ${styles.rowCard} ${selected ? styles.rowCardSelected : ""}`}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.rowTitle}>{item.displayName || item.name || "Fără nume"}</div>
          <div className={styles.rowSub}>{item.email || "fără email"}</div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{item.role}</span>
          {item.isBlocked ? <span className={`${styles.badge} ${styles.badgeWarn}`}>BLOCKED</span> : null}
          {item.isBanned ? <span className={`${styles.badge} ${styles.badgeDanger}`}>BANNED</span> : null}
          {item.emailVerified ? <span className={styles.badge}>Email OK</span> : null}
          {item.stripeConnected ? <span className={styles.badge}>Stripe</span> : null}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div><strong>ID:</strong> {item.id}</div>
        <div><strong>Creat:</strong> {formatDate(item.createdAt)}</div>
        <div><strong>Oraș:</strong> {item.city || "—"}</div>
        <div><strong>Țară:</strong> {item.country || "—"}</div>
      </div>

      <div className={styles.actionsGrid}>
        <div className={styles.inlineControl}>
          <select
            className={styles.select}
            value={roleValue}
            onChange={(e) => setRoleValue(e.target.value)}
            disabled={busy}
          >
            {USER_ROLE_OPTIONS.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button secondary"
            disabled={busy || roleValue === item.role}
            onClick={() => void onSaveRole(item.id, roleValue)}
          >
            Salvează rol
          </button>
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => void onOpenDetails(item.id)}
          >
            {selected ? "Reîncarcă detalii" : "Detalii"}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => void onToggleBlocked(item.id, !item.isBlocked)}
          >
            {item.isBlocked ? "Deblochează" : "Blochează"}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => void onToggleBanned(item.id, !item.isBanned)}
          >
            {item.isBanned ? "Unban" : "Ban"}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => void onInvalidateSessions(item.id)}
          >
            Invalidează sesiuni
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminExperienceRow({
  item,
  selected,
  selectedForBulk,
  busy,
  onOpenDetails,
  onToggleActive,
  onSaveStatus,
  onToggleSelect,
}: {
  item: AdminExperience;
  selected?: boolean;
  selectedForBulk?: boolean;
  busy?: boolean;
  onOpenDetails: (id: string) => Promise<void>;
  onToggleActive: (id: string, nextValue: boolean) => Promise<void>;
  onSaveStatus: (id: string, status: string) => Promise<void>;
  onToggleSelect?: (id: string, checked: boolean) => void;
}) {
  const [statusValue, setStatusValue] = useState(String(item.status || ""));

  useEffect(() => {
    setStatusValue(String(item.status || ""));
  }, [item.status]);

  return (
    <div className={`${styles.card} ${styles.rowCard} ${selected ? styles.rowCardSelected : ""}`}>
      <div className={styles.rowTop}>
        <div className={styles.rowTopLead}>
          <label className={styles.rowCheck}>
            <input
              type="checkbox"
              checked={!!selectedForBulk}
              onChange={(e) => onToggleSelect?.(item.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              disabled={busy}
            />
            <span>Select</span>
          </label>
          <div className={styles.rowTitle}>{item.title || "Fără titlu"}</div>
          <div className={styles.rowSub}>
            Host: {item.host?.name || item.host?.email || "—"}
          </div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{String(item.status || "—")}</span>
          <span className={`${styles.badge} ${item.isActive ? styles.badgeOk : styles.badgeWarn}`}>
            {item.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
          {item.environment ? <span className={styles.badge}>{item.environment}</span> : null}
          {item.soldOut ? <span className={styles.badgeWarnPill}>Sold out</span> : null}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div><strong>ID:</strong> {item.id}</div>
        <div><strong>Locație:</strong> {[item.city, item.country].filter(Boolean).join(", ") || "—"}</div>
        <div><strong>Start:</strong> {formatDate(item.startsAt)}</div>
        <div><strong>Preț:</strong> {numberFmt(item.price)} RON</div>
        <div><strong>Participanți:</strong> {numberFmt(item.participantsBooked)} / {numberFmt(item.maxParticipants)}</div>
        <div><strong>Locuri rămase:</strong> {numberFmt(item.remainingSpots)}</div>
      </div>

      <div className={styles.actionsGrid}>
        <div className={styles.inlineControl}>
          <select
            className={styles.select}
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            disabled={busy}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="cancelled">cancelled</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="DISABLED">DISABLED</option>
            <option value="NO_BOOKINGS">NO_BOOKINGS</option>
          </select>
          <button
            type="button"
            className="button secondary"
            disabled={busy || statusValue === String(item.status || "")}
            onClick={() => void onSaveStatus(item.id, statusValue)}
          >
            Salvează status
          </button>
        </div>
        <div className={styles.buttonRow}>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => void onOpenDetails(item.id)}
          >
            {selected ? "Reîncarcă detalii" : "Detalii"}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => void onToggleActive(item.id, !item.isActive)}
          >
            {item.isActive ? "Dezactivează" : "Activează"}
          </button>
          <a className={styles.linkButton} href={`/experiences/${item.id}`} target="_blank" rel="noreferrer">
            Deschide experiența
          </a>
        </div>
      </div>
    </div>
  );
}

function AdminBookingExperienceRow({
  group,
  pendingKey,
  onCancel,
  onRefund,
}: {
  group: AdminBookingExperienceGroup;
  pendingKey?: string | null;
  onCancel: (id: string) => Promise<void>;
  onRefund: (id: string) => Promise<void>;
}) {
  const experienceTitle = group.experience?.title || "Experiență fără titlu";
  const experienceLocation = [group.experience?.city, group.experience?.country].filter(Boolean).join(", ") || "—";
  const participantGroups = useMemo(() => {
    const byParticipant = new Map<
      string,
      {
        key: string;
        name: string;
        email: string;
        bookings: AdminBooking[];
        totalSeats: number;
        totalAmount: number;
        currency: string;
        paidLikeCount: number;
        refundedCount: number;
        latestAt: number;
      }
    >();

    for (const booking of group.bookings) {
      const key = booking.explorer?.id || booking.explorer?.email || booking.id;
      const existing = byParticipant.get(key);
      const createdAt = new Date(booking.createdAt || 0).getTime();
      const status = String(booking.status || "").toUpperCase();
      const isPaidLike = ["PAID", "DEPOSIT_PAID", "PENDING_ATTENDANCE", "COMPLETED", "AUTO_COMPLETED", "NO_SHOW", "DISPUTED"].includes(status);
      const isRefunded = status === "REFUNDED";

      if (!existing) {
        byParticipant.set(key, {
          key,
          name: booking.explorer?.name || booking.explorer?.email || "Explorer necunoscut",
          email: booking.explorer?.email || "",
          bookings: [booking],
          totalSeats: Number(booking.quantity || 1),
          totalAmount: Number(booking.amount || 0),
          currency: String(booking.currency || "RON"),
          paidLikeCount: isPaidLike ? 1 : 0,
          refundedCount: isRefunded ? 1 : 0,
          latestAt: Number.isNaN(createdAt) ? 0 : createdAt,
        });
        continue;
      }

      existing.bookings.push(booking);
      existing.totalSeats += Number(booking.quantity || 1);
      existing.totalAmount += Number(booking.amount || 0);
      existing.paidLikeCount += isPaidLike ? 1 : 0;
      existing.refundedCount += isRefunded ? 1 : 0;
      if (!Number.isNaN(createdAt) && createdAt > existing.latestAt) {
        existing.latestAt = createdAt;
      }
    }

    return Array.from(byParticipant.values())
      .map((participant) => ({
        ...participant,
        bookings: [...participant.bookings].sort((a, b) => {
          const aAt = new Date(a.createdAt || 0).getTime();
          const bAt = new Date(b.createdAt || 0).getTime();
          return bAt - aAt;
        }),
      }))
      .sort((a, b) => b.latestAt - a.latestAt);
  }, [group.bookings]);

  return (
    <div className={`${styles.card} ${styles.rowCard} ${styles.bookingGroupCard}`}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.rowTitle}>{experienceTitle}</div>
          <div className={styles.rowSub}>
            Host: {group.host?.name || group.host?.email || "—"} · Start: {formatDate(group.experience?.startsAt || null)}
          </div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>Booking-uri {numberFmt(group.bookings.length)}</span>
          <span className={styles.badge}>Participanți {numberFmt(group.totalSeats)}</span>
          {group.totalReports > 0 ? <span className={`${styles.badge} ${styles.badgeWarn}`}>Reports {numberFmt(group.totalReports)}</span> : null}
          {group.totalMessages > 0 ? <span className={styles.badge}>Msg {numberFmt(group.totalMessages)}</span> : null}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div><strong>Experience ID:</strong> {group.experience?.id || "—"}</div>
        <div><strong>Locație:</strong> {experienceLocation}</div>
        <div><strong>Status experiență:</strong> {group.experience?.status || "—"}</div>
        <div><strong>Activă:</strong> {group.experience?.isActive ? "Da" : "Nu"}</div>
      </div>

      <div className={styles.bookingParticipantsList}>
        {participantGroups.map((participant) => (
          <div key={participant.key} className={styles.bookingParticipantGroup}>
            <div className={styles.bookingParticipantGroupHeader}>
              <div className={styles.bookingParticipantMain}>
                <div className={styles.bookingParticipantName}>{participant.name}</div>
                <div className={styles.rowSub}>
                  {participant.email || "fără email"} · Booking-uri {numberFmt(participant.bookings.length)} · Locuri {numberFmt(participant.totalSeats)} · Total {formatMoney(participant.totalAmount, participant.currency)}
                </div>
              </div>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>Paid-like {numberFmt(participant.paidLikeCount)}</span>
                {participant.refundedCount > 0 ? (
                  <span className={`${styles.badge} ${styles.badgeWarn}`}>Refundate {numberFmt(participant.refundedCount)}</span>
                ) : null}
              </div>
            </div>

            <details className={styles.bookingDetailsToggle} open={participant.bookings.length === 1}>
              <summary>
                {participant.bookings.length === 1
                  ? "Detaliu booking"
                  : `Detalii booking-uri (${numberFmt(participant.bookings.length)})`}
              </summary>
              <div className={styles.bookingDetailsList}>
                {participant.bookings.map((item) => {
                  const canRefund = !!item.payment?.hasStripePaymentIntent && !["REFUNDED"].includes(String(item.payment?.status || "").toUpperCase());
                  const busy = pendingKey?.startsWith(`booking:${item.id}:`);
                  return (
                    <div key={item.id} className={styles.bookingParticipantRow}>
                      <div className={styles.bookingParticipantMain}>
                        <div className={styles.rowSub}>
                          #{item.id.slice(-8)} · Creat {formatDate(item.createdAt)} · Status {item.status || "—"} · Attendance {item.attendanceStatus || "—"}
                        </div>
                        <div className={styles.rowSub}>
                          Locuri {numberFmt(item.quantity)} · Booking {formatMoney(item.amount, item.currency)} · Plată {item.payment ? formatMoney(item.payment.amount, item.payment.currency) : "—"} · Pay {item.payment?.status || "—"}
                        </div>
                        <div className={styles.rowSub}>
                          Refundat {formatDate(item.refundedAt || null)} · Anulat {formatDate(item.cancelledAt || null)}
                        </div>
                      </div>
                      <div className={styles.bookingParticipantActions}>
                        <button type="button" className="button secondary" disabled={busy} onClick={() => void onCancel(item.id)}>
                          Anulează booking
                        </button>
                        <button type="button" className="button secondary" disabled={busy || !canRefund} onClick={() => void onRefund(item.id)}>
                          Refund manual
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReportRow({
  item,
  selected,
  busy,
  onSelect,
  onAction,
}: {
  item: AdminReport;
  selected?: boolean;
  busy?: boolean;
  onSelect: (id: string) => void;
  onAction: (id: string, action: string) => Promise<void>;
}) {
  const isOpenInbox = ["OPEN", "INVESTIGATING"].includes(String(item.status || "").toUpperCase());
  return (
    <div className={`${styles.card} ${styles.rowCard} ${selected ? styles.rowCardSelected : ""}`}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.rowTitle}>
            {item.type || "REPORT"} <span className={styles.rowTitleMuted}>#{item.id.slice(-6)}</span>
          </div>
          <div className={styles.rowSub}>
            {item.experience?.title || "Fără experiență"} · Reporter: {item.reporter?.email || item.reporter?.name || "—"}
          </div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{item.status || "—"}</span>
          {item.assignedTo ? <span className={styles.badge}>👤 {item.assignedTo}</span> : null}
          {item.overdue ? <span className={`${styles.badge} ${styles.badgeDanger}`}>Overdue</span> : null}
          {item.affectsPayout ? <span className={`${styles.badge} ${styles.badgeWarn}`}>Payout</span> : null}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div><strong>Creat:</strong> {formatDate(item.createdAt)}</div>
        <div><strong>Age:</strong> {numberFmt(item.ageHours)}h</div>
        <div><strong>Deadline:</strong> {formatDate(item.deadlineAt)}</div>
        <div><strong>Host:</strong> {item.host?.email || item.host?.name || "—"}</div>
        <div><strong>Target user:</strong> {item.targetUser?.email || item.targetUser?.name || "—"}</div>
        <div><strong>Booking:</strong> {item.booking?.id ? `#${item.booking.id.slice(-6)} · ${item.booking.status || "—"}` : "—"}</div>
      </div>

      <div className={styles.rowSub}>
        {item.reason || item.comment || "Fără motiv/comentariu"}
      </div>

      <div className={styles.buttonRow}>
        <button type="button" className="button secondary" disabled={busy} onClick={() => onSelect(item.id)}>
          {selected ? "Selectat" : "Detalii"}
        </button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => void onAction(item.id, "ASSIGN_TO_ME")}>
          Assign to me
        </button>
        {isOpenInbox ? (
          <button type="button" className="button secondary" disabled={busy} onClick={() => void onAction(item.id, "MARK_HANDLED")}>
            Mark handled
          </button>
        ) : null}
        <button type="button" className="button secondary" disabled={busy} onClick={() => void onAction(item.id, "MARK_IGNORED")}>
          Ignore
        </button>
      </div>
    </div>
  );
}

function AdminMessageConversationRow({
  item,
  selected,
  busy,
  onOpen,
}: {
  item: AdminMessageConversationItem;
  selected?: boolean;
  busy?: boolean;
  onOpen: (bookingId: string) => Promise<void>;
}) {
  return (
    <div className={`${styles.card} ${styles.rowCard} ${selected ? styles.rowCardSelected : ""}`}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.rowTitle}>
            {item.booking?.experience?.title || "Conversation"}{" "}
            <span className={styles.rowTitleMuted}>#{item.bookingId.slice(-6)}</span>
          </div>
          <div className={styles.rowSub}>
            Explorer: {item.booking?.explorer?.email || item.booking?.explorer?.name || "—"} · Host:{" "}
            {item.booking?.host?.email || item.booking?.host?.name || "—"}
          </div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>Msg {numberFmt(item.messagesCount)}</span>
          {(item.reportsCount || 0) > 0 ? <span className={`${styles.badge} ${styles.badgeWarn}`}>Reports {numberFmt(item.reportsCount)}</span> : null}
          {(item.openReportsCount || 0) > 0 ? <span className={`${styles.badge} ${styles.badgeDanger}`}>Open {numberFmt(item.openReportsCount)}</span> : null}
          {item.booking?.status ? <span className={styles.badge}>{item.booking.status}</span> : null}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div><strong>Last message:</strong> {formatDate(item.lastMessageAt || null)}</div>
        <div><strong>Last sender:</strong> {item.lastSender?.email || item.lastSender?.name || "—"}</div>
        <div><strong>Locație:</strong> {[item.booking?.experience?.city, item.booking?.experience?.country].filter(Boolean).join(", ") || "—"}</div>
      </div>

      <div className={styles.rowSub}>{item.lastMessageText || "—"}</div>

      <div className={styles.buttonRow}>
        <button type="button" className="button secondary" disabled={busy} onClick={() => void onOpen(item.bookingId)}>
          {selected ? "Reîncarcă thread" : "Open thread"}
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => window.open(`/messages/${item.bookingId}`, "_blank", "noopener,noreferrer")}
        >
          Open user chat
        </button>
      </div>
    </div>
  );
}

function AdminAuditRow({
  item,
  selected,
  busy,
  onSelect,
}: {
  item: AdminAuditLogItem;
  selected?: boolean;
  busy?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.card} ${styles.rowCard} ${selected ? styles.rowCardSelected : ""} ${styles.auditRowButton}`}
      onClick={() => onSelect(item.id)}
      disabled={busy}
    >
      <div className={styles.rowTop}>
        <div>
          <div className={styles.rowTitle}>
            {item.actionType || "ACTION"} <span className={styles.rowTitleMuted}>#{item.id.slice(-6)}</span>
          </div>
          <div className={styles.rowSub}>{item.actorEmail || "—"} · {formatDate(item.createdAt)}</div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{item.targetType || "—"}</span>
          {item.reason ? <span className={`${styles.badge} ${styles.badgeWarn}`}>reason</span> : null}
        </div>
      </div>
      <div className={styles.metaGrid}>
        <div><strong>Target ID:</strong> {item.targetId || "—"}</div>
        <div><strong>IP:</strong> {item.ip || "—"}</div>
        <div><strong>User agent:</strong> {item.userAgent ? item.userAgent.slice(0, 64) : "—"}</div>
      </div>
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [users, setUsers] = useState<AdminUsersResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<AdminUserDetailsResponse | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState("");

  const [hosts, setHosts] = useState<AdminHostsResponse | null>(null);
  const [hostsLoading, setHostsLoading] = useState(false);
  const [hostsError, setHostsError] = useState("");
  const [hostQuery, setHostQuery] = useState("");
  const [hostStatusFilter, setHostStatusFilter] = useState("all");

  const [experiences, setExperiences] = useState<AdminExperiencesResponse | null>(null);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experiencesError, setExperiencesError] = useState("");
  const [experienceQuery, setExperienceQuery] = useState("");
  const [experienceStatusFilter, setExperienceStatusFilter] = useState("all");
  const [experienceActiveFilter, setExperienceActiveFilter] = useState("all");
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<string[]>([]);
  const [experienceDetails, setExperienceDetails] = useState<AdminExperienceDetailsResponse | null>(null);
  const [experienceDetailsLoading, setExperienceDetailsLoading] = useState(false);
  const [experienceDetailsError, setExperienceDetailsError] = useState("");

  const [bookings, setBookings] = useState<AdminBookingsResponse | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPaidFilter, setBookingPaidFilter] = useState("all");

  const [reports, setReports] = useState<AdminReportsResponse | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportQuery, setReportQuery] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("OPEN_INBOX");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [reportAssignedFilter, setReportAssignedFilter] = useState("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const [paymentsHealth, setPaymentsHealth] = useState<AdminPaymentsHealthResponse | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  const [auditLogs, setAuditLogs] = useState<AdminAuditLogsResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [auditQuery, setAuditQuery] = useState("");
  const [auditActionTypeFilter, setAuditActionTypeFilter] = useState("all");
  const [auditTargetTypeFilter, setAuditTargetTypeFilter] = useState("all");
  const [auditActorEmailFilter, setAuditActorEmailFilter] = useState("");
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const [messagesData, setMessagesData] = useState<AdminMessagesResponse | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [messagesQuery, setMessagesQuery] = useState("");
  const [messagesHasReportsFilter, setMessagesHasReportsFilter] = useState("all");
  const [selectedMessageBookingId, setSelectedMessageBookingId] = useState<string | null>(null);
  const [messageThread, setMessageThread] = useState<AdminMessageThreadResponse | null>(null);
  const [messageThreadLoading, setMessageThreadLoading] = useState(false);
  const [messageThreadError, setMessageThreadError] = useState("");

  const [systemHealth, setSystemHealth] = useState<AdminSystemHealthResponse | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState("");
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissionsResponse | null>(null);

  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [csvExportingKey, setCsvExportingKey] = useState<string | null>(null);
  const [criticalDialog, setCriticalDialog] = useState<CriticalActionDialogConfig | null>(null);
  const [criticalReasonInput, setCriticalReasonInput] = useState("");
  const [criticalConfirmTextInput, setCriticalConfirmTextInput] = useState("");
  const [criticalDialogError, setCriticalDialogError] = useState("");
  const criticalDialogResolverRef = useRef<((value: { confirmed: boolean; reason: string }) => void) | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "overview" | "users" | "hosts" | "experiences" | "bookings" | "reports" | "payments" | "audit" | "messages" | "system"
  >("overview");
  const [globalSearch, setGlobalSearch] = useState("");
  const [recentAdminActions, setRecentAdminActions] = useState<AdminAuditLogItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const isAdmin = isAdminRole(user?.role);
  const adminCapabilitySet = useMemo(
    () => new Set<AdminCapability>((adminPermissions?.capabilities || []) as AdminCapability[]),
    [adminPermissions?.capabilities]
  );
  const canWriteUsers = adminCapabilitySet.has("USERS_WRITE");
  const canWriteExperiences = adminCapabilitySet.has("EXPERIENCES_WRITE");
  const canWriteBookings = adminCapabilitySet.has("BOOKINGS_WRITE");
  const canWriteReports = adminCapabilitySet.has("REPORTS_WRITE");
  const isOwnerAdmin = adminCapabilitySet.has("OWNER_WRITE");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/admin");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (authLoading) return;
    if (token && user && !isAdminRole(user.role)) {
      router.replace("/");
    }
  }, [authLoading, token, user, router]);

  useEffect(() => {
    if (!user?.role) return;
    setAdminPermissions((prev) => prev || buildPermissionsFallback(user.role));
  }, [user?.role]);

  const loadAdminPermissions = useCallback(async () => {
    try {
      const data = await apiGet<AdminPermissionsResponse>("/admin/me/permissions");
      if (Array.isArray(data?.capabilities)) {
        setAdminPermissions(data);
        return;
      }
    } catch {
      // fallback stays active if endpoint is unavailable
    }
    setAdminPermissions(buildPermissionsFallback(user?.role));
  }, [user?.role]);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const data = await apiGet<AdminDashboard>("/admin/dashboard");
      setDashboard(data || null);
    } catch (err) {
      setDashboardError((err as Error)?.message || "Nu am putut încărca dashboard-ul admin.");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadRecentAdminActions = useCallback(async () => {
    setRecentLoading(true);
    try {
      const data = await apiGet<{ items?: AdminAuditLogItem[] }>("/admin/audit-logs/recent?limit=12");
      setRecentAdminActions(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setRecentAdminActions([]);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const loadUsers = useCallback(
    async (page = 1) => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (userQuery.trim()) params.set("q", userQuery.trim());
        if (userRoleFilter !== "all") params.set("role", userRoleFilter);
        if (userStatusFilter !== "all") params.set("status", userStatusFilter);
        const data = await apiGet<AdminUsersResponse>(`/admin/users?${params.toString()}`);
        setUsers(data);
      } catch (err) {
        setUsersError((err as Error)?.message || "Nu am putut încărca utilizatorii.");
      } finally {
        setUsersLoading(false);
      }
    },
    [userQuery, userRoleFilter, userStatusFilter]
  );

  const loadUserDetails = useCallback(async (id: string) => {
    setSelectedUserId(id);
    setUserDetailsLoading(true);
    setUserDetailsError("");
    try {
      const data = await apiGet<AdminUserDetailsResponse>(`/admin/users/${id}`);
      setUserDetails(data || null);
    } catch (err) {
      setUserDetailsError((err as Error)?.message || "Nu am putut încărca detaliile utilizatorului.");
    } finally {
      setUserDetailsLoading(false);
    }
  }, []);

  const loadHosts = useCallback(
    async (page = 1, overrides?: { q?: string; status?: string }) => {
      setHostsLoading(true);
      setHostsError("");
      try {
        const effectiveQuery = String(overrides?.q ?? hostQuery).trim();
        const effectiveStatus = String((overrides?.status ?? hostStatusFilter) || "all");
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (effectiveQuery) params.set("q", effectiveQuery);
        if (effectiveStatus !== "all") params.set("status", effectiveStatus);
        const data = await apiGet<AdminHostsResponse>(`/admin/hosts?${params.toString()}`);
        setHosts(data || null);
      } catch (err) {
        setHostsError((err as Error)?.message || "Nu am putut încărca host-ii.");
      } finally {
        setHostsLoading(false);
      }
    },
    [hostQuery, hostStatusFilter]
  );

  const openHostRegistry = useCallback(
    (hostId?: string, query?: string) => {
      const normalizedQuery = String(query || "").trim();
      if (hostId) {
        router.push(`/admin/hosts/${hostId}`);
        return;
      }
      setActiveSection("hosts");
      setHostStatusFilter("all");
      setHostQuery(normalizedQuery);
      void loadHosts(1, { q: normalizedQuery, status: "all" });
    },
    [loadHosts, router]
  );

  const loadExperiences = useCallback(
    async (page = 1) => {
      setExperiencesLoading(true);
      setExperiencesError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (experienceQuery.trim()) params.set("q", experienceQuery.trim());
        if (experienceStatusFilter !== "all") params.set("status", experienceStatusFilter);
        if (experienceActiveFilter !== "all") params.set("active", experienceActiveFilter);
        const data = await apiGet<AdminExperiencesResponse>(`/admin/experiences?${params.toString()}`);
        setExperiences(data);
      } catch (err) {
        setExperiencesError((err as Error)?.message || "Nu am putut încărca experiențele.");
      } finally {
        setExperiencesLoading(false);
      }
    },
    [experienceQuery, experienceStatusFilter, experienceActiveFilter]
  );

  const loadExperienceDetails = useCallback(async (id: string) => {
    setSelectedExperienceId(id);
    setExperienceDetailsLoading(true);
    setExperienceDetailsError("");
    try {
      const data = await apiGet<AdminExperienceDetailsResponse>(`/admin/experiences/${id}`);
      setExperienceDetails(data || null);
    } catch (err) {
      setExperienceDetailsError((err as Error)?.message || "Nu am putut încărca detaliile experienței.");
    } finally {
      setExperienceDetailsLoading(false);
    }
  }, []);

  const loadBookings = useCallback(
    async (page = 1) => {
      setBookingsLoading(true);
      setBookingsError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (bookingQuery.trim()) params.set("q", bookingQuery.trim());
        if (bookingStatusFilter !== "all") params.set("status", bookingStatusFilter);
        if (bookingPaidFilter !== "all") params.set("paid", bookingPaidFilter);
        const data = await apiGet<AdminBookingsResponse>(`/admin/bookings?${params.toString()}`);
        setBookings(data);
      } catch (err) {
        setBookingsError((err as Error)?.message || "Nu am putut încărca rezervările.");
      } finally {
        setBookingsLoading(false);
      }
    },
    [bookingQuery, bookingStatusFilter, bookingPaidFilter]
  );

  const loadReports = useCallback(
    async (page = 1) => {
      setReportsLoading(true);
      setReportsError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (reportQuery.trim()) params.set("q", reportQuery.trim());
        if (reportStatusFilter !== "all") params.set("status", reportStatusFilter);
        if (reportTypeFilter !== "all") params.set("type", reportTypeFilter);
        if (reportAssignedFilter !== "all") params.set("assigned", reportAssignedFilter);
        const data = await apiGet<AdminReportsResponse>(`/admin/reports?${params.toString()}`);
        setReports(data);
      } catch (err) {
        setReportsError((err as Error)?.message || "Nu am putut încărca reports.");
      } finally {
        setReportsLoading(false);
      }
    },
    [reportQuery, reportStatusFilter, reportTypeFilter, reportAssignedFilter]
  );

  const loadPaymentsHealth = useCallback(async () => {
    setPaymentsLoading(true);
    setPaymentsError("");
    try {
      const data = await apiGet<AdminPaymentsHealthResponse>("/admin/payments/health");
      setPaymentsHealth(data || null);
    } catch (err) {
      setPaymentsError((err as Error)?.message || "Nu am putut încărca Payments health.");
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(
    async (page = 1) => {
      setAuditLoading(true);
      setAuditError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "15");
        if (auditQuery.trim()) params.set("q", auditQuery.trim());
        if (auditActionTypeFilter !== "all") params.set("actionType", auditActionTypeFilter);
        if (auditTargetTypeFilter !== "all") params.set("targetType", auditTargetTypeFilter);
        if (auditActorEmailFilter.trim()) params.set("actorEmail", auditActorEmailFilter.trim());
        const data = await apiGet<AdminAuditLogsResponse>(`/admin/audit-logs?${params.toString()}`);
        setAuditLogs(data || null);
      } catch (err) {
        setAuditError((err as Error)?.message || "Nu am putut încărca audit logs.");
      } finally {
        setAuditLoading(false);
      }
    },
    [auditQuery, auditActionTypeFilter, auditTargetTypeFilter, auditActorEmailFilter]
  );

  const loadMessages = useCallback(
    async (page = 1) => {
      setMessagesLoading(true);
      setMessagesError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (messagesQuery.trim()) params.set("q", messagesQuery.trim());
        if (messagesHasReportsFilter !== "all") params.set("hasReports", messagesHasReportsFilter);
        const data = await apiGet<AdminMessagesResponse>(`/admin/messages?${params.toString()}`);
        setMessagesData(data || null);
      } catch (err) {
        setMessagesError((err as Error)?.message || "Nu am putut încărca conversațiile.");
      } finally {
        setMessagesLoading(false);
      }
    },
    [messagesQuery, messagesHasReportsFilter]
  );

  const loadMessageThread = useCallback(async (bookingId: string) => {
    setSelectedMessageBookingId(bookingId);
    setMessageThreadLoading(true);
    setMessageThreadError("");
    try {
      const data = await apiGet<AdminMessageThreadResponse>(`/admin/messages/${bookingId}`);
      setMessageThread(data || null);
    } catch (err) {
      setMessageThreadError((err as Error)?.message || "Nu am putut încărca thread-ul.");
    } finally {
      setMessageThreadLoading(false);
    }
  }, []);

  const loadSystemHealth = useCallback(async () => {
    setSystemLoading(true);
    setSystemError("");
    try {
      const data = await apiGet<AdminSystemHealthResponse>("/admin/system/health");
      setSystemHealth(data || null);
    } catch (err) {
      const message = (err as Error)?.message || "Nu am putut încărca System health.";
      if (/owner admin permissions required|forbidden|403/i.test(message)) {
        setSystemHealth(null);
        setSystemError("System health este disponibil doar pentru OWNER_ADMIN.");
      } else {
        setSystemError(message);
      }
    } finally {
      setSystemLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadAdminPermissions(),
      loadDashboard(),
      loadUsers(users?.page || 1),
      loadHosts(hosts?.page || 1),
      loadExperiences(experiences?.page || 1),
      loadBookings(bookings?.page || 1),
      loadReports(reports?.page || 1),
      loadPaymentsHealth(),
      loadAuditLogs(auditLogs?.page || 1),
      loadMessages(messagesData?.page || 1),
      ...(isOwnerAdmin ? [loadSystemHealth()] : []),
      loadRecentAdminActions(),
    ]);
  }, [isOwnerAdmin, loadAdminPermissions, loadDashboard, loadUsers, loadHosts, loadExperiences, loadBookings, loadReports, loadPaymentsHealth, loadAuditLogs, loadMessages, loadSystemHealth, loadRecentAdminActions, users?.page, hosts?.page, experiences?.page, bookings?.page, reports?.page, auditLogs?.page, messagesData?.page]);

  useEffect(() => {
    if (authLoading || !token || !isAdmin) return;
    if (bootstrapped) return;
    setBootstrapped(true);
    void refreshAll();
  }, [authLoading, token, isAdmin, bootstrapped, refreshAll]);

  const runAction = useCallback(
    async (key: string, action: () => Promise<void>) => {
      setActionError("");
      setActionInfo("");
      setPendingKey(key);
      try {
        await action();
      } catch (err) {
        setActionError((err as Error)?.message || "Acțiunea a eșuat.");
      } finally {
        setPendingKey(null);
      }
    },
    []
  );

  const closeCriticalDialog = useCallback((payload: { confirmed: boolean; reason: string }) => {
    const resolver = criticalDialogResolverRef.current;
    criticalDialogResolverRef.current = null;
    setCriticalDialog(null);
    setCriticalReasonInput("");
    setCriticalConfirmTextInput("");
    setCriticalDialogError("");
    if (resolver) resolver(payload);
  }, []);

  useEffect(() => {
    return () => {
      const resolver = criticalDialogResolverRef.current;
      criticalDialogResolverRef.current = null;
      if (resolver) resolver({ confirmed: false, reason: "" });
    };
  }, []);

  const askCriticalConfirmation = useCallback((config: CriticalActionDialogConfig) => {
    return new Promise<{ confirmed: boolean; reason: string }>((resolve) => {
      criticalDialogResolverRef.current = resolve;
      setCriticalDialog(config);
      setCriticalReasonInput("");
      setCriticalConfirmTextInput("");
      setCriticalDialogError("");
    });
  }, []);

  const submitCriticalDialog = useCallback(() => {
    if (!criticalDialog) return;
    const reason = criticalReasonInput.trim();
    const requiredWord = String(criticalDialog.requireTypeText || "").trim().toUpperCase();
    const typedWord = criticalConfirmTextInput.trim().toUpperCase();

    if (criticalDialog.requireReason && !reason) {
      setCriticalDialogError("Motivul este obligatoriu.");
      return;
    }
    if (requiredWord && typedWord !== requiredWord) {
      setCriticalDialogError(`Trebuie să scrii exact: ${requiredWord}`);
      return;
    }
    closeCriticalDialog({ confirmed: true, reason });
  }, [criticalDialog, criticalReasonInput, criticalConfirmTextInput, closeCriticalDialog]);

  const patchUser = useCallback(
    async (id: string, payload: Record<string, unknown>, info = "Utilizator actualizat") => {
      if (!canWriteUsers) {
        throw new Error("Nu ai permisiune pentru modificări pe utilizatori.");
      }
      await apiPatch(`/admin/users/${id}`, payload);
      setActionInfo(info);
      await Promise.all([
        loadUsers(users?.page || 1),
        loadDashboard(),
        ...(selectedUserId === id ? [loadUserDetails(id)] : []),
        loadRecentAdminActions(),
      ]);
    },
    [canWriteUsers, loadUsers, loadDashboard, loadUserDetails, loadRecentAdminActions, users?.page, selectedUserId]
  );

  const patchExperience = useCallback(
    async (id: string, payload: Record<string, unknown>, info = "Experiență actualizată") => {
      if (!canWriteExperiences) {
        throw new Error("Nu ai permisiune pentru modificări pe experiențe.");
      }
      await apiPatch(`/admin/experiences/${id}`, payload);
      setActionInfo(info);
      await Promise.all([
        loadExperiences(experiences?.page || 1),
        loadDashboard(),
        ...(selectedExperienceId === id ? [loadExperienceDetails(id)] : []),
        loadRecentAdminActions(),
      ]);
    },
    [canWriteExperiences, loadExperiences, loadDashboard, loadExperienceDetails, loadRecentAdminActions, experiences?.page, selectedExperienceId]
  );

  const postBookingAction = useCallback(
    async (id: string, action: "cancel" | "refund", reason: string, info: string) => {
      if (!canWriteBookings) {
        throw new Error("Nu ai permisiune pentru acțiuni pe bookings.");
      }
      await apiPost(`/admin/bookings/${id}/${action}`, { reason });
      setActionInfo(info);
      await Promise.all([loadBookings(bookings?.page || 1), loadDashboard(), loadRecentAdminActions()]);
    },
    [canWriteBookings, loadBookings, loadDashboard, loadRecentAdminActions, bookings?.page]
  );

  const onCancelBooking = useCallback(
    async (id: string) => {
      if (!canWriteBookings) {
        setActionError("Nu ai permisiune pentru acțiuni pe bookings.");
        return;
      }
      await runAction(`booking:${id}:cancel`, async () => {
        const decision = await askCriticalConfirmation({
          title: "Anulare booking (admin)",
          impact: "Booking-ul va fi anulat. Acțiunea afectează host-ul și explorer-ul.",
          requireReason: true,
          reasonLabel: "Motiv anulare (obligatoriu)",
          reasonPlaceholder: "Ex: fraud alert / solicitare suport validată",
          requireTypeText: "CANCEL",
          confirmButtonLabel: "Confirmă anularea",
        });
        if (!decision.confirmed) return;
        await postBookingAction(id, "cancel", decision.reason, "Booking anulat (admin)");
      });
    },
    [canWriteBookings, runAction, askCriticalConfirmation, postBookingAction]
  );

  const onRefundBooking = useCallback(
    async (id: string) => {
      if (!canWriteBookings) {
        setActionError("Nu ai permisiune pentru acțiuni pe bookings.");
        return;
      }
      await runAction(`booking:${id}:refund`, async () => {
        const decision = await askCriticalConfirmation({
          title: "Refund booking (admin)",
          impact: "Se declanșează refund prin Stripe pentru acest booking.",
          requireReason: true,
          reasonLabel: "Motiv refund (obligatoriu)",
          reasonPlaceholder: "Ex: experiență anulată / incident de siguranță",
          requireTypeText: "REFUND",
          confirmButtonLabel: "Confirmă refund",
        });
        if (!decision.confirmed) return;
        await postBookingAction(id, "refund", decision.reason, "Refund declanșat (admin)");
      });
    },
    [canWriteBookings, runAction, askCriticalConfirmation, postBookingAction]
  );

  const postReportAction = useCallback(
    async (id: string, action: string, reason?: string) => {
      if (!canWriteReports) {
        throw new Error("Nu ai permisiune pentru acțiuni pe reports.");
      }
      await apiPost(`/admin/reports/${id}/action`, {
        action,
        ...(reason ? { reason } : {}),
      });
      setActionInfo(`Report actualizat (${action})`);
      await Promise.all([loadReports(reports?.page || 1), loadDashboard(), loadRecentAdminActions()]);
    },
    [canWriteReports, loadReports, reports?.page, loadDashboard, loadRecentAdminActions]
  );

  const onGlobalSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const q = globalSearch.trim();
      if (!q) return;
      if (q.includes("@")) {
        setActiveSection("users");
        setUserQuery(q);
        void loadUsers(1);
        return;
      }
      if (/^report[:\s]/i.test(q)) {
        const reportQ = q.replace(/^report[:\s]*/i, "").trim();
        setActiveSection("reports");
        setReportQuery(reportQ);
        void loadReports(1);
        return;
      }
      if (/^[a-f\d]{24}$/i.test(q)) {
        setActiveSection("bookings");
        setBookingQuery(q);
        void loadBookings(1);
        return;
      }
      setExperienceQuery(q);
      setActiveSection("experiences");
      void loadExperiences(1);
    },
    [globalSearch, loadExperiences, loadUsers, loadBookings, loadReports]
  );

  const toggleExperienceSelection = useCallback((id: string, checked: boolean) => {
    setSelectedExperienceIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((x) => x !== id);
    });
  }, []);

  const selectVisibleExperiences = useCallback(() => {
    const ids = (experiences?.items || []).map((item) => item.id);
    setSelectedExperienceIds((prev) => [...new Set([...prev, ...ids])]);
  }, [experiences?.items]);

  const clearSelectedExperiences = useCallback(() => {
    setSelectedExperienceIds([]);
  }, []);

  const runExperienceBulkAction = useCallback(
    async (action: "PAUSE" | "UNPAUSE") => {
      if (!canWriteExperiences) {
        setActionError("Nu ai permisiune pentru bulk actions pe experiențe.");
        return;
      }
      if (!selectedExperienceIds.length) {
        setActionError("Selectează cel puțin o experiență.");
        return;
      }
      let reason: string | undefined;
      if (action === "PAUSE") {
        const decision = await askCriticalConfirmation({
          title: `Bulk pause (${selectedExperienceIds.length} experiențe)`,
          impact: "Toate experiențele selectate vor deveni inactive.",
          requireReason: true,
          reasonLabel: "Motiv (obligatoriu)",
          reasonPlaceholder: "Ex: verificare de siguranță / conținut invalid",
          requireTypeText: "PAUSE",
          confirmButtonLabel: "Confirmă pause",
        });
        if (!decision.confirmed) return;
        reason = decision.reason;
      } else {
        const decision = await askCriticalConfirmation({
          title: `Bulk unpause (${selectedExperienceIds.length} experiențe)`,
          impact: "Experiențele selectate vor fi reactivate.",
          requireTypeText: "UNPAUSE",
          confirmButtonLabel: "Confirmă unpause",
        });
        if (!decision.confirmed) return;
      }

      await runAction(`exp:bulk:${action}`, async () => {
        await apiPost("/admin/experiences/bulk-action", {
          action,
          ids: selectedExperienceIds,
          ...(reason ? { reason } : {}),
        });
        setActionInfo(action === "PAUSE" ? "Experiențe puse pe pauză (bulk)" : "Experiențe reactivate (bulk)");
        setSelectedExperienceIds([]);
        await Promise.all([
          loadExperiences(experiences?.page || 1),
          loadDashboard(),
          loadRecentAdminActions(),
          selectedExperienceId ? loadExperienceDetails(selectedExperienceId) : Promise.resolve(),
        ]);
      });
    },
    [
      canWriteExperiences,
      selectedExperienceIds,
      askCriticalConfirmation,
      runAction,
      loadExperiences,
      experiences?.page,
      loadDashboard,
      loadRecentAdminActions,
      selectedExperienceId,
      loadExperienceDetails,
    ]
  );

  const csvEscape = useCallback((value: unknown) => {
    const raw = value === null || value === undefined ? "" : String(value);
    if (/[",\n;]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
    return raw;
  }, []);

  const csvFromRows = useCallback(
    (headers: string[], rows: Array<Array<unknown>>) =>
      [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n"),
    [csvEscape]
  );

  const downloadCsv = useCallback((filename: string, csv: string) => {
    if (typeof window === "undefined") return;
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const exportPaginatedJson = useCallback(
    async <T,>(key: string, fetchPage: (page: number) => Promise<{ items?: T[]; pages?: number }>, maxPages = 50) => {
      setCsvExportingKey(key);
      setActionError("");
      setActionInfo("");
      try {
        const all: T[] = [];
        let page = 1;
        let pages = 1;
        while (page <= pages && page <= maxPages) {
          const data = await fetchPage(page);
          const items = Array.isArray(data?.items) ? data.items : [];
          all.push(...items);
          pages = Math.max(1, Number(data?.pages || 1));
          page += 1;
        }
        if (pages > maxPages) {
          setActionInfo(`Export limitat la ${numberFmt(maxPages * 100)} rânduri (max ${maxPages} pagini).`);
        }
        return all;
      } finally {
        setCsvExportingKey(null);
      }
    },
    []
  );

  const exportUsersCsv = useCallback(async () => {
    const items = await exportPaginatedJson<AdminUser>("users", async (page) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "100");
      if (userQuery.trim()) params.set("q", userQuery.trim());
      if (userRoleFilter !== "all") params.set("role", userRoleFilter);
      if (userStatusFilter !== "all") params.set("status", userStatusFilter);
      return apiGet<AdminUsersResponse>(`/admin/users?${params.toString()}`);
    });
    if (!items || !items.length) {
      setActionInfo("Nu există utilizatori de exportat pentru filtrele curente.");
      return;
    }
    const rows = items.map((u) => [
      u.id,
      u.fullName || u.displayName || u.name || [u.firstName, u.lastName].filter(Boolean).join(" "),
      u.email || "",
      u.role || "",
      u.isBanned ? "BANNED" : u.isBlocked ? "BLOCKED" : "ACTIVE",
      u.emailVerified ? "true" : "false",
      u.stripeAccountId || "",
      u.isStripeChargesEnabled ? "true" : "false",
      u.isStripePayoutsEnabled ? "true" : "false",
      u.city || "",
      u.country || "",
      u.createdAt || "",
    ]);
    downloadCsv(`livadai-admin-users-${new Date().toISOString().slice(0, 10)}.csv`, csvFromRows(
      [
        "id",
        "fullName",
        "email",
        "role",
        "status",
        "emailVerified",
        "stripeAccountId",
        "chargesEnabled",
        "payoutsEnabled",
        "city",
        "country",
        "createdAt",
      ],
      rows
    ));
    setActionInfo(`Export CSV users: ${numberFmt(items.length)} rânduri.`);
  }, [csvFromRows, downloadCsv, exportPaginatedJson, userQuery, userRoleFilter, userStatusFilter]);

  const exportExperiencesCsv = useCallback(async () => {
    const items = await exportPaginatedJson<AdminExperience>("experiences", async (page) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "100");
      if (experienceQuery.trim()) params.set("q", experienceQuery.trim());
      if (experienceStatusFilter !== "all") params.set("status", experienceStatusFilter);
      if (experienceActiveFilter !== "all") params.set("active", experienceActiveFilter);
      return apiGet<AdminExperiencesResponse>(`/admin/experiences?${params.toString()}`);
    });
    if (!items || !items.length) {
      setActionInfo("Nu există experiențe de exportat pentru filtrele curente.");
      return;
    }
    const rows = items.map((exp) => [
      exp.id,
      exp.title || "",
      exp.host?.email || "",
      exp.status || "",
      exp.isActive ? "true" : "false",
      exp.city || "",
      exp.country || "",
      exp.environment || "",
      exp.price ?? 0,
      exp.startsAt || "",
      exp.endsAt || "",
      exp.maxParticipants ?? 0,
      exp.participantsBooked ?? 0,
      exp.remainingSpots ?? 0,
      exp.soldOut ? "true" : "false",
    ]);
    downloadCsv(`livadai-admin-experiences-${new Date().toISOString().slice(0, 10)}.csv`, csvFromRows(
      ["id", "title", "hostEmail", "status", "isActive", "city", "country", "environment", "price", "startsAt", "endsAt", "maxParticipants", "participantsBooked", "remainingSpots", "soldOut"],
      rows
    ));
    setActionInfo(`Export CSV experiences: ${numberFmt(items.length)} rânduri.`);
  }, [csvFromRows, downloadCsv, exportPaginatedJson, experienceQuery, experienceStatusFilter, experienceActiveFilter]);

  const exportBookingsCsv = useCallback(async () => {
    const items = await exportPaginatedJson<AdminBooking>("bookings", async (page) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "100");
      if (bookingQuery.trim()) params.set("q", bookingQuery.trim());
      if (bookingStatusFilter !== "all") params.set("status", bookingStatusFilter);
      if (bookingPaidFilter !== "all") params.set("paid", bookingPaidFilter);
      return apiGet<AdminBookingsResponse>(`/admin/bookings?${params.toString()}`);
    });
    if (!items || !items.length) {
      setActionInfo("Nu există booking-uri de exportat pentru filtrele curente.");
      return;
    }
    const rows = items.map((b) => [
      b.id,
      b.status || "",
      b.attendanceStatus || "",
      b.experience?.title || "",
      b.host?.email || "",
      b.explorer?.email || "",
      b.quantity ?? 0,
      b.amount ?? 0,
      b.currency || "",
      b.payment?.status || "",
      b.payment?.paymentType || "",
      b.payment?.amount ?? "",
      b.reportsCount ?? 0,
      b.messagesCount ?? 0,
      b.createdAt || "",
      b.refundedAt || "",
      b.cancelledAt || "",
    ]);
    downloadCsv(`livadai-admin-bookings-${new Date().toISOString().slice(0, 10)}.csv`, csvFromRows(
      ["id", "status", "attendanceStatus", "experienceTitle", "hostEmail", "explorerEmail", "quantity", "amount", "currency", "paymentStatus", "paymentType", "paymentAmount", "reportsCount", "messagesCount", "createdAt", "refundedAt", "cancelledAt"],
      rows
    ));
    setActionInfo(`Export CSV bookings: ${numberFmt(items.length)} rânduri.`);
  }, [csvFromRows, downloadCsv, exportPaginatedJson, bookingQuery, bookingStatusFilter, bookingPaidFilter]);

  const dashboardCards = useMemo(
    () => [
      { label: "Utilizatori total", value: dashboard?.users?.total, hint: `+${numberFmt(dashboard?.users?.newLast7d)} în ultimele 7 zile` },
      { label: "Clienți (Explorer/Both)", value: dashboard?.users?.explorerCapable, hint: `Explorers only: ${numberFmt(dashboard?.users?.explorersOnly)}` },
      { label: "Host (Host/Both)", value: dashboard?.users?.hostCapable, hint: `Host only: ${numberFmt(dashboard?.users?.hostsOnly)}` },
      { label: "Experiențe total", value: dashboard?.experiences?.total, hint: `+${numberFmt(dashboard?.experiences?.newLast7d)} în ultimele 7 zile` },
      { label: "Experiențe active", value: dashboard?.experiences?.active, hint: `Public viitoare: ${numberFmt(dashboard?.experiences?.upcomingPublic)}` },
      { label: "Rezervări active", value: dashboard?.bookings?.active, hint: `Total rezervări: ${numberFmt(dashboard?.bookings?.total)}` },
      { label: "Refund failed", value: dashboard?.bookings?.refundFailed, hint: "Necesită verificare" },
      { label: "Rapoarte deschise", value: dashboard?.reports?.open, hint: `Open/Handled: ${numberFmt(dashboard?.reports?.openOrHandled)}` },
    ],
    [dashboard]
  );

  const selectedReport = useMemo(
    () => (reports?.items || []).find((item) => item.id === selectedReportId) || null,
    [reports?.items, selectedReportId]
  );

  const selectedAudit = useMemo(
    () => (auditLogs?.items || []).find((item) => item.id === selectedAuditId) || null,
    [auditLogs?.items, selectedAuditId]
  );

  const selectedMessageConversation = useMemo(
    () => (messagesData?.items || []).find((item) => item.bookingId === selectedMessageBookingId) || null,
    [messagesData?.items, selectedMessageBookingId]
  );

  const groupedBookings = useMemo(
    () => groupBookingsByExperience(bookings?.items || []),
    [bookings?.items]
  );

  if (authLoading || (!token && !dashboard && !users && !experiences && !bookings && !reports && !paymentsHealth && !auditLogs && !systemHealth)) {
    return <div className="muted">Se încarcă admin-ul...</div>;
  }

  if (!token) return null;

  if (!isAdmin) return null;

  const onUsersSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadUsers(1);
  };

  const onExperiencesSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadExperiences(1);
  };

  const onHostsSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadHosts(1);
  };

  const onBookingsSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadBookings(1);
  };

  const onReportsSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadReports(1);
  };

  const onAuditSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadAuditLogs(1);
  };

  const onMessagesSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadMessages(1);
  };

  const sidebarItems: Array<{
    key: "overview" | "users" | "hosts" | "experiences" | "bookings" | "reports" | "payments" | "audit" | "messages" | "system";
    label: string;
    hint?: string;
  }> = [
    { key: "overview", label: "Overview", hint: "Control room" },
    { key: "users", label: "Users Overview", hint: "Full visibility" },
    { key: "hosts", label: "Hosts Registry", hint: "Identity & accountability" },
    { key: "experiences", label: "Experiences", hint: "Quality & safety" },
    { key: "bookings", label: "Bookings", hint: "Ops & refunds" },
    { key: "reports", label: "Reports / Moderation", hint: "Inbox & safety" },
    { key: "payments", label: "Payments & Refunds", hint: "Health & issues" },
    { key: "audit", label: "Audit Log", hint: "Trace admin actions" },
    { key: "messages", label: "Messages", hint: "Conversations" },
    ...(isOwnerAdmin ? ([{ key: "system", label: "System", hint: "Health & config" }] as const) : []),
  ];

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>LIVADAI Admin</div>
        <div className={styles.sidebarSub}>Internal control panel</div>
        <nav className={styles.sidebarNav}>
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.sidebarItem} ${activeSection === item.key ? styles.sidebarItemActive : ""}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span>{item.label}</span>
              {item.hint ? <small>{item.hint}</small> : null}
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.page}>
        <div className={styles.topbar}>
          <form className={styles.topbarSearch} onSubmit={onGlobalSearchSubmit}>
            <input
              className="input"
              placeholder="Search global (email / experience / user id)"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            <button type="submit" className="button secondary">
              Search
            </button>
          </form>

          <div className={styles.topbarPanels}>
            <div className={`${styles.card} ${styles.quickActions}`}>
              <div className={styles.panelTitle}>Quick actions</div>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>Role: {adminPermissions?.role || normalizeRole(user?.role)}</span>
                <span className={`${styles.badge} ${canWriteUsers ? styles.badgeOk : styles.badgeWarn}`}>Users write</span>
                <span className={`${styles.badge} ${canWriteExperiences ? styles.badgeOk : styles.badgeWarn}`}>Experiences write</span>
                <span className={`${styles.badge} ${canWriteBookings ? styles.badgeOk : styles.badgeWarn}`}>Bookings write</span>
                <span className={`${styles.badge} ${canWriteReports ? styles.badgeOk : styles.badgeWarn}`}>Reports write</span>
                {isOwnerAdmin ? <span className={`${styles.badge} ${styles.badgeOk}`}>Owner power</span> : null}
              </div>
              <div className={styles.quickActionsRow}>
                <button type="button" className="button secondary" onClick={() => setActiveSection("users")}>
                  Users Overview
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("hosts")}>
                  Hosts Registry
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("experiences")}>
                  Experiences
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("bookings")}>
                  Bookings
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("reports")}>
                  Reports
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("payments")}>
                  Payments
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("audit")}>
                  Audit
                </button>
                <button type="button" className="button secondary" onClick={() => setActiveSection("messages")}>
                  Messages
                </button>
                {isOwnerAdmin ? (
                  <button type="button" className="button secondary" onClick={() => setActiveSection("system")}>
                    System
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button"
                  onClick={() => void refreshAll()}
                  disabled={dashboardLoading || usersLoading || experiencesLoading || bookingsLoading || reportsLoading || paymentsLoading || auditLoading || messagesLoading || systemLoading || recentLoading}
                >
                  Refresh all
                </button>
              </div>
            </div>

            <div className={`${styles.card} ${styles.recentCard}`}>
              <div className={styles.panelTitle}>Recent admin actions</div>
              <div className={styles.recentList}>
                {recentLoading ? <div className="muted">Se încarcă...</div> : null}
                {!recentLoading && recentAdminActions.length === 0 ? (
                  <div className="muted">Nu există încă acțiuni admin.</div>
                ) : null}
                {recentAdminActions.slice(0, 6).map((row) => (
                  <div key={row.id} className={styles.recentItem}>
                    <div className={styles.recentLine}>
                      <strong>{row.actionType}</strong> · {row.targetType}
                    </div>
                    <div className={styles.recentMeta}>
                      {row.actorEmail} · {formatDate(row.createdAt)}{row.reason ? ` · ${row.reason}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Control</h1>
            <p className={styles.subtitle}>
              Dashboard intern LIVADAI pentru moderare, suport, operațiuni și plăți.
            </p>
            {dashboard?.generatedAt ? (
              <p className={styles.generatedAt}>Actualizat: {formatDate(dashboard.generatedAt)}</p>
            ) : null}
          </div>
        </div>

        {actionError ? <div className={`${styles.banner} ${styles.bannerError}`}>{actionError}</div> : null}
        {actionInfo ? <div className={`${styles.banner} ${styles.bannerInfo}`}>{actionInfo}</div> : null}

        {activeSection === "overview" ? (
          <section>
            <div className={styles.sectionTitleRow}>
              <h2 className={styles.sectionTitle}>Overview</h2>
              {dashboardLoading ? <span className="muted">Se încarcă...</span> : null}
            </div>
            {dashboardError ? <div className={`${styles.card} ${styles.errorCard}`}>{dashboardError}</div> : null}
            <div className={styles.statsGrid}>
              {dashboardCards.map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
              ))}
            </div>
            <div className={styles.overviewGrid}>
              <div className={`${styles.card} ${styles.inboxCard}`}>
                <div className={styles.panelTitle}>Needs attention (MVP)</div>
                <ul className={styles.inboxList}>
                  <li>Refund failed: {numberFmt(dashboard?.bookings?.refundFailed)}</li>
                  <li>Reports open: {numberFmt(dashboard?.reports?.open)}</li>
                  <li>Experiențe inactive: {numberFmt(dashboard?.experiences?.inactive)}</li>
                  <li>Users blocked: {numberFmt(dashboard?.users?.blocked)}</li>
                  <li>Users banned: {numberFmt(dashboard?.users?.banned)}</li>
                </ul>
              </div>
              <div className={`${styles.card} ${styles.inboxCard}`}>
                <div className={styles.panelTitle}>Roadmap tabs</div>
                <ul className={styles.inboxList}>
                  <li>Bookings tab (admin cancel/refund workflows)</li>
                  <li>Reports inbox (assign/investigate/handled)</li>
                  <li>Payments & Refunds health view</li>
                  <li>Audit logs full table + filters</li>
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "users" ? <section className={styles.sectionBlock}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Users Overview</h2>
            <span className="muted">
              {users ? `${numberFmt(users.total)} rezultate` : "—"}
            </span>
          </div>

          <div className={styles.statsGrid}>
            <StatCard label="Total Users" value={users?.summary?.totalUsers} />
            <StatCard label="Total Hosts" value={users?.summary?.totalHosts} />
            <StatCard label="Total Explorers" value={users?.summary?.totalExplorers} />
            <StatCard label="Hosts cu Stripe incomplete" value={users?.summary?.hostsStripeIncomplete} />
          </div>

          <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onUsersSubmit}>
            <div className={styles.filtersGrid}>
              <input
                className="input"
                placeholder="Search by email"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
              <select className={styles.select} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="all">Toate rolurile</option>
                {USER_ROLE_OPTIONS.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
              <select className={styles.select} value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                <option value="all">Toate statusurile</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div className={styles.filtersActions}>
              <button
                className="button secondary"
                type="button"
                disabled={csvExportingKey === "users"}
                onClick={() => void exportUsersCsv()}
              >
                {csvExportingKey === "users" ? "Export..." : "Export CSV"}
              </button>
              <button className="button secondary" type="button" onClick={() => { setUserQuery(""); setUserRoleFilter("all"); setUserStatusFilter("all"); void loadUsers(1); }}>
                Reset
              </button>
              <button className="button" type="submit" disabled={usersLoading}>
                {usersLoading ? "Se caută..." : "Caută"}
              </button>
            </div>
          </form>

          {usersError ? <div className={`${styles.card} ${styles.errorCard}`}>{usersError}</div> : null}
          <div className={styles.splitGrid}>
            <div className={styles.listStack}>
              <div className={`${styles.card} ${styles.tableCard}`}>
                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Stripe Account ID</th>
                        <th>Charges Enabled</th>
                        <th>Payouts Enabled</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(users?.items || []).map((item) => (
                        <tr key={item.id} className={selectedUserId === item.id ? styles.tableRowSelected : ""}>
                          <td>{item.fullName || item.displayName || item.name || [item.firstName, item.lastName].filter(Boolean).join(" ") || "—"}</td>
                          <td>{item.email || "—"}</td>
                          <td>{item.role || "—"}</td>
                          <td className={styles.tableCode}>{item.stripeAccountId || "—"}</td>
                          <td>{item.isStripeChargesEnabled ? "true" : "false"}</td>
                          <td>{item.isStripePayoutsEnabled ? "true" : "false"}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>
                            <div className={styles.tableActions}>
                              <a className={styles.tableLink} href={`/users/${item.id}`} target="_blank" rel="noreferrer">
                                View profile
                              </a>
                              <button
                                type="button"
                                className="button secondary"
                                disabled={userDetailsLoading}
                                onClick={() => void loadUserDetails(item.id)}
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {!usersLoading && (users?.items || []).length === 0 ? (
                <div className={`${styles.card} ${styles.emptyCard}`}>Nu există utilizatori pentru filtrele selectate.</div>
              ) : null}

              <div className={styles.pagination}>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!users || users.page <= 1 || usersLoading}
                  onClick={() => void loadUsers((users?.page || 1) - 1)}
                >
                  ← Anterior
                </button>
                <span className="muted">
                  Pagina {users?.page || 1} / {users?.pages || 1}
                </span>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!users || (users?.page || 1) >= (users?.pages || 1) || usersLoading}
                  onClick={() => void loadUsers((users?.page || 1) + 1)}
                >
                  Următor →
                </button>
              </div>
            </div>

            <div className={`${styles.card} ${styles.detailsCard}`}>
              <div className={styles.sectionTitleRow}>
                <h3 className={styles.detailsTitle}>User details</h3>
                {userDetails?.user?.id ? <span className="muted">#{userDetails.user.id.slice(-8)}</span> : null}
              </div>

              {!selectedUserId ? <div className="muted">Selectează un utilizator din tabel.</div> : null}
              {selectedUserId && userDetailsLoading ? <div className="muted">Se încarcă detaliile...</div> : null}
              {selectedUserId && userDetailsError ? <div className={`${styles.card} ${styles.errorCard}`}>{userDetailsError}</div> : null}

              {selectedUserId && !userDetailsLoading && !userDetailsError && userDetails?.user ? (
                <>
                  <div className={styles.detailGrid}>
                    <div><strong>Nume</strong><span>{userDetails.user.displayName || userDetails.user.name || "—"}</span></div>
                    <div><strong>Email</strong><span>{userDetails.user.email || "—"}</span></div>
                    <div><strong>Rol</strong><span>{userDetails.user.role || "—"}</span></div>
                    <div><strong>Creat</strong><span>{formatDate(userDetails.user.createdAt)}</span></div>
                    <div><strong>Last auth</strong><span>{formatDate(userDetails.user.lastAuthAt || null)}</span></div>
                    <div><strong>Token version</strong><span>{numberFmt(userDetails.user.tokenVersion)}</span></div>
                    <div><strong>Oraș / Țară</strong><span>{[userDetails.user.city, userDetails.user.country].filter(Boolean).join(", ") || "—"}</span></div>
                    <div><strong>Telefon</strong><span>{[userDetails.user.phoneCountryCode, userDetails.user.phone].filter(Boolean).join(" ") || "—"}</span></div>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Status & Stripe</div>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.badge} ${userDetails.user.emailVerified ? styles.badgeOk : styles.badgeWarn}`}>Email {userDetails.user.emailVerified ? "OK" : "NO"}</span>
                      <span className={`${styles.badge} ${userDetails.user.phoneVerified ? styles.badgeOk : styles.badgeWarn}`}>Phone {userDetails.user.phoneVerified ? "OK" : "NO"}</span>
                      <span className={`${styles.badge} ${userDetails.user.isBlocked ? styles.badgeWarn : styles.badgeOk}`}>{userDetails.user.isBlocked ? "BLOCKED" : "ACTIVE"}</span>
                      {userDetails.user.isBanned ? <span className={`${styles.badge} ${styles.badgeDanger}`}>BANNED</span> : null}
                      <span className={`${styles.badge} ${userDetails.user.stripe?.connected ? styles.badgeOk : styles.badgeWarn}`}>Stripe account</span>
                      <span className={`${styles.badge} ${userDetails.user.stripe?.chargesEnabled ? styles.badgeOk : styles.badgeWarn}`}>Charges</span>
                      <span className={`${styles.badge} ${userDetails.user.stripe?.payoutsEnabled ? styles.badgeOk : styles.badgeWarn}`}>Payouts</span>
                      <span className={`${styles.badge} ${userDetails.user.stripe?.detailsSubmitted ? styles.badgeOk : styles.badgeWarn}`}>Details</span>
                    </div>
                    {userDetails.user.stripe?.accountId ? (
                      <div className="muted">Stripe account: {userDetails.user.stripe.accountId}</div>
                    ) : null}
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Counts</div>
                    <div className={styles.detailGrid}>
                      <div><strong>Bookings total</strong><span>{numberFmt(userDetails.counts?.bookingsTotal)}</span></div>
                      <div><strong>As explorer</strong><span>{numberFmt(userDetails.counts?.bookingsAsExplorer)}</span></div>
                      <div><strong>As host</strong><span>{numberFmt(userDetails.counts?.bookingsAsHost)}</span></div>
                      <div><strong>Experiences hosted</strong><span>{numberFmt(userDetails.counts?.experiencesHosted)}</span></div>
                      <div><strong>Reports created</strong><span>{numberFmt(userDetails.counts?.reportsCreated)}</span></div>
                      <div><strong>Reports against user</strong><span>{numberFmt(userDetails.counts?.reportsAgainstUser)}</span></div>
                      <div><strong>Messages sent</strong><span>{numberFmt(userDetails.counts?.messagesSent)}</span></div>
                      <div><strong>Trusted participant</strong><span>{userDetails.user.isTrustedParticipant ? "Da" : "Nu"}</span></div>
                    </div>
                  </div>

                  {(userDetails.user.languages?.length || 0) > 0 || userDetails.user.shortBio || userDetails.user.aboutMe ? (
                    <div className={styles.detailsSection}>
                      <div className={styles.panelTitle}>Profile notes</div>
                      {(userDetails.user.languages?.length || 0) > 0 ? (
                        <div className={styles.badgeRow}>
                          {(userDetails.user.languages || []).map((lang) => (
                            <span key={`${userDetails.user?.id}-${lang}`} className={styles.badge}>{lang}</span>
                          ))}
                        </div>
                      ) : null}
                      {userDetails.user.shortBio ? <div className={styles.miniItem}><div>{userDetails.user.shortBio}</div></div> : null}
                      {userDetails.user.aboutMe ? <div className={styles.miniItem}><div className="muted">{userDetails.user.aboutMe}</div></div> : null}
                    </div>
                  ) : null}

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Timeline (latest)</div>
                    {(userDetails.timeline || []).length === 0 ? (
                      <div className="muted">Fără evenimente recente.</div>
                    ) : (
                      <div className={styles.stackSm}>
                        {(userDetails.timeline || []).slice(0, 10).map((event, idx) => (
                          <div key={`${event.kind}-${event.targetId || idx}-${event.at || idx}`} className={styles.miniItem}>
                            <div><strong>{event.kind}</strong></div>
                            <div className="muted">{event.label || "—"}</div>
                            <div className="muted">{formatDate(event.at || null)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Recent entities</div>
                    <div className={styles.stackSm}>
                      <div className={styles.miniItem}>
                        <div><strong>Bookings</strong></div>
                        {(userDetails.recentBookings || []).length === 0 ? (
                          <div className="muted">Fără booking-uri recente.</div>
                        ) : (
                          <div className={styles.stackSm}>
                            {(userDetails.recentBookings || []).slice(0, 4).map((b) => (
                              <div key={b.id} className="muted">
                                {b.status || "—"} · {b.experience?.title || "Experiență"} · {formatDate(b.createdAt)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.miniItem}>
                        <div><strong>Experiences</strong></div>
                        {(userDetails.recentExperiences || []).length === 0 ? (
                          <div className="muted">Fără experiențe recente.</div>
                        ) : (
                          <div className={styles.stackSm}>
                            {(userDetails.recentExperiences || []).slice(0, 4).map((exp) => (
                              <div key={exp.id} className="muted">
                                {exp.title || "Fără titlu"} · {exp.status || "—"} · {formatDate(exp.createdAt || exp.startsAt || null)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.miniItem}>
                        <div><strong>Reports</strong></div>
                        {(userDetails.recentReports || []).length === 0 ? (
                          <div className="muted">Fără reports recente.</div>
                        ) : (
                          <div className={styles.stackSm}>
                            {(userDetails.recentReports || []).slice(0, 4).map((r) => (
                              <div key={r.id} className="muted">
                                {r.type || "REPORT"} · {r.status || "—"} · {formatDate(r.createdAt)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section> : null}

      {activeSection === "hosts" ? <section className={styles.sectionBlock}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Hosts Registry</h2>
          <span className="muted">
            {hosts ? `${numberFmt(hosts.total)} rezultate` : "—"}
          </span>
        </div>

        <div className={styles.statsGrid}>
          <StatCard label="Total hosts" value={hosts?.summary?.totalHosts} />
          <StatCard label="Blocked hosts" value={hosts?.summary?.blockedHosts} />
          <StatCard label="Stripe connected" value={hosts?.summary?.stripeConnectedHosts} />
          <StatCard label="Compliance alerts (page)" value={hosts?.summary?.complianceAttentionInPage} />
        </div>

        <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onHostsSubmit}>
          <div className={styles.filtersGrid}>
            <input
              className="input"
              placeholder="Search host (email / name)"
              value={hostQuery}
              onChange={(e) => setHostQuery(e.target.value)}
            />
            <select className={styles.select} value={hostStatusFilter} onChange={(e) => setHostStatusFilter(e.target.value)}>
              <option value="all">Toate statusurile</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div className={styles.filtersActions}>
            <button className="button secondary" type="button" onClick={() => { setHostQuery(""); setHostStatusFilter("all"); void loadHosts(1); }}>
              Reset
            </button>
            <button className="button" type="submit" disabled={hostsLoading}>
              {hostsLoading ? "Se caută..." : "Caută"}
            </button>
          </div>
        </form>

        {hostsError ? <div className={`${styles.card} ${styles.errorCard}`}>{hostsError}</div> : null}
        <div className={styles.listStack}>
          <div className={`${styles.card} ${styles.tableCard}`}>
            <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Host</th>
                    <th>Telefon</th>
                    <th>Stripe</th>
                    <th>Nume Stripe</th>
                    <th>Bank ref</th>
                    <th>Alerts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(hosts?.items || []).map((host) => (
                    <tr key={host.id}>
                      <td>
                        <div><strong>{host.name || "—"}</strong></div>
                        <div className="muted">{host.email || "—"}</div>
                        <div className="muted">{[host.city, host.country].filter(Boolean).join(", ") || "—"}</div>
                      </td>
                      <td>{[host.phoneCountryCode, host.phone].filter(Boolean).join(" ") || "—"}</td>
                      <td>
                        <div className={styles.badgeRow}>
                          <span className={`${styles.badge} ${host.stripeAccountId ? styles.badgeOk : styles.badgeWarn}`}>Account</span>
                          <span className={`${styles.badge} ${host.isStripeChargesEnabled ? styles.badgeOk : styles.badgeWarn}`}>Charges</span>
                          <span className={`${styles.badge} ${host.isStripePayoutsEnabled ? styles.badgeOk : styles.badgeWarn}`}>Payouts</span>
                        </div>
                      </td>
                      <td>{host.stripeLegalName || host.stripeDisplayName || "—"}</td>
                      <td>{host.bankReference || "—"}</td>
                      <td>{numberFmt(host.issues?.length || 0)}</td>
                      <td>
                        <div className={styles.tableActions}>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => router.push(`/admin/hosts/${host.id}`)}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!hostsLoading && (hosts?.items || []).length === 0 ? (
            <div className={`${styles.card} ${styles.emptyCard}`}>Nu există host-uri pentru filtrele selectate.</div>
          ) : null}

          <div className={styles.pagination}>
            <button
              type="button"
              className="button secondary"
              disabled={!hosts || hosts.page <= 1 || hostsLoading}
              onClick={() => void loadHosts((hosts?.page || 1) - 1)}
            >
              ← Anterior
            </button>
            <span className="muted">
              Pagina {hosts?.page || 1} / {hosts?.pages || 1}
            </span>
            <button
              type="button"
              className="button secondary"
              disabled={!hosts || (hosts?.page || 1) >= (hosts?.pages || 1) || hostsLoading}
              onClick={() => void loadHosts((hosts?.page || 1) + 1)}
            >
              Următor →
            </button>
          </div>
        </div>
      </section> : null}

      {activeSection === "experiences" ? <section className={styles.sectionBlock}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Experiențe</h2>
          <span className="muted">
            {experiences ? `${numberFmt(experiences.total)} rezultate` : "—"}
          </span>
        </div>

        <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onExperiencesSubmit}>
          <div className={styles.filtersGrid}>
            <input
              className="input"
              placeholder="Caută după titlu sau locație"
              value={experienceQuery}
              onChange={(e) => setExperienceQuery(e.target.value)}
            />
            <input
              className="input"
              placeholder="Status (ex: published / DISABLED)"
              value={experienceStatusFilter === "all" ? "" : experienceStatusFilter}
              onChange={(e) => setExperienceStatusFilter(e.target.value || "all")}
            />
            <select className={styles.select} value={experienceActiveFilter} onChange={(e) => setExperienceActiveFilter(e.target.value)}>
              <option value="all">Active + inactive</option>
              <option value="true">Doar active</option>
              <option value="false">Doar inactive</option>
            </select>
          </div>
          <div className={styles.filtersActions}>
            <button
              className="button secondary"
              type="button"
              disabled={csvExportingKey === "experiences"}
              onClick={() => void exportExperiencesCsv()}
            >
              {csvExportingKey === "experiences" ? "Export..." : "Export CSV"}
            </button>
            <button className="button secondary" type="button" onClick={() => { setExperienceQuery(""); setExperienceStatusFilter("all"); setExperienceActiveFilter("all"); void loadExperiences(1); }}>
              Reset
            </button>
            <button className="button" type="submit" disabled={experiencesLoading}>
              {experiencesLoading ? "Se caută..." : "Caută"}
            </button>
          </div>
        </form>

        {experiencesError ? <div className={`${styles.card} ${styles.errorCard}`}>{experiencesError}</div> : null}

        <div className={`${styles.card} ${styles.bulkToolbar}`}>
          <div className={styles.bulkToolbarInfo}>
            <strong>Bulk actions (Experiences)</strong>
            <span className="muted">
              Selectate: {numberFmt(selectedExperienceIds.length)} · Pagina curentă: {numberFmt((experiences?.items || []).length)}
            </span>
          </div>
          <div className={styles.buttonRow}>
            <button type="button" className="button secondary" onClick={selectVisibleExperiences}>
              Select page
            </button>
            <button type="button" className="button secondary" onClick={clearSelectedExperiences}>
              Clear
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={!canWriteExperiences || !!pendingKey?.startsWith("exp:bulk:") || selectedExperienceIds.length === 0}
              onClick={() => void runExperienceBulkAction("PAUSE")}
            >
              Pause selected
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={!canWriteExperiences || !!pendingKey?.startsWith("exp:bulk:") || selectedExperienceIds.length === 0}
              onClick={() => void runExperienceBulkAction("UNPAUSE")}
            >
              Unpause selected
            </button>
          </div>
        </div>

        <div className={styles.splitGrid}>
          <div className={styles.listStack}>
            {(experiences?.items || []).map((item) => (
              <AdminExperienceRow
                key={item.id}
                item={item}
                selected={selectedExperienceId === item.id}
                selectedForBulk={selectedExperienceIds.includes(item.id)}
                busy={!!pendingKey?.startsWith(`exp:${item.id}:`)}
                onOpenDetails={loadExperienceDetails}
                onToggleSelect={toggleExperienceSelection}
                onToggleActive={(id, nextValue) => {
                  if (!canWriteExperiences) {
                    setActionError("Nu ai permisiune pentru modificări pe experiențe.");
                    return Promise.resolve();
                  }
                  return runAction(
                    `exp:${id}:active`,
                    async () => {
                      let reason: string | undefined;
                      if (!nextValue) {
                        const decision = await askCriticalConfirmation({
                          title: "Dezactivare experiență",
                          impact: "Experiența va fi ascunsă din listări și nu va mai putea primi rezervări noi.",
                          requireReason: true,
                          reasonLabel: "Motiv (obligatoriu)",
                          reasonPlaceholder: "Ex: problemă de siguranță / conținut neconform",
                          requireTypeText: "PAUSE",
                          confirmButtonLabel: "Confirmă dezactivarea",
                        });
                        if (!decision.confirmed) return;
                        reason = decision.reason;
                      }
                      await patchExperience(
                        id,
                        { isActive: nextValue, ...(reason ? { reason } : {}) },
                        nextValue ? "Experiență activată" : "Experiență dezactivată"
                      );
                    }
                  );
                }}
                onSaveStatus={(id, status) => {
                  if (!canWriteExperiences) {
                    setActionError("Nu ai permisiune pentru modificări pe experiențe.");
                    return Promise.resolve();
                  }
                  return runAction(`exp:${id}:status`, async () => {
                    const critical = ["DISABLED", "CANCELLED", "cancelled"].includes(status);
                    let reason: string | undefined;
                    if (critical) {
                      const normalized = String(status || "").toUpperCase();
                      const decision = await askCriticalConfirmation({
                        title: `Schimbare status experiență: ${normalized}`,
                        impact: "Statusul experienței se schimbă și poate afecta rezervările active.",
                        requireReason: true,
                        reasonLabel: "Motiv (obligatoriu)",
                        reasonPlaceholder: "Ex: incident validat de echipa de suport",
                        requireTypeText: normalized === "DISABLED" ? "DISABLE" : "CANCEL",
                        confirmButtonLabel: "Confirmă schimbarea",
                      });
                      if (!decision.confirmed) return;
                      reason = decision.reason;
                    }
                    await patchExperience(id, { status, ...(reason ? { reason } : {}) }, `Status salvat (${status})`);
                  });
                }}
              />
            ))}
            {!experiencesLoading && (experiences?.items || []).length === 0 ? (
              <div className={`${styles.card} ${styles.emptyCard}`}>Nu există experiențe pentru filtrele selectate.</div>
            ) : null}
            <div className={styles.pagination}>
              <button
                type="button"
                className="button secondary"
                disabled={!experiences || experiences.page <= 1 || experiencesLoading}
                onClick={() => void loadExperiences((experiences?.page || 1) - 1)}
              >
                ← Anterior
              </button>
              <span className="muted">
                Pagina {experiences?.page || 1} / {experiences?.pages || 1}
              </span>
              <button
                type="button"
                className="button secondary"
                disabled={!experiences || (experiences?.page || 1) >= (experiences?.pages || 1) || experiencesLoading}
                onClick={() => void loadExperiences((experiences?.page || 1) + 1)}
              >
                Următor →
              </button>
            </div>
          </div>

          <div className={`${styles.card} ${styles.detailsCard}`}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.detailsTitle}>Experience details</h3>
              {experienceDetails?.experience?.id ? <span className="muted">#{experienceDetails.experience.id.slice(-8)}</span> : null}
            </div>

            {!selectedExperienceId ? <div className="muted">Selectează o experiență din listă.</div> : null}
            {selectedExperienceId && experienceDetailsLoading ? <div className="muted">Se încarcă detaliile...</div> : null}
            {selectedExperienceId && experienceDetailsError ? <div className={`${styles.banner} ${styles.bannerError}`}>{experienceDetailsError}</div> : null}

            {selectedExperienceId && !experienceDetailsLoading && !experienceDetailsError && experienceDetails?.experience ? (
              <>
                <div className={styles.detailGrid}>
                  <div><strong>Titlu</strong><span>{experienceDetails.experience.title || "—"}</span></div>
                  <div><strong>Status</strong><span>{experienceDetails.experience.status || "—"}</span></div>
                  <div><strong>Activ</strong><span>{experienceDetails.experience.isActive ? "Da" : "Nu"}</span></div>
                  <div><strong>Host</strong><span>{experienceDetails.experience.host?.email || experienceDetails.experience.host?.name || "—"}</span></div>
                  <div><strong>Preț</strong><span>{numberFmt(experienceDetails.experience.price)} {experienceDetails.experience.currencyCode || "RON"}</span></div>
                  <div><strong>Tip</strong><span>{experienceDetails.experience.activityType || "—"}</span></div>
                  <div><strong>Mediu</strong><span>{experienceDetails.experience.environment || "—"}</span></div>
                  <div><strong>Durată</strong><span>{numberFmt(experienceDetails.experience.durationMinutes)} min</span></div>
                  <div><strong>Start</strong><span>{formatDate(experienceDetails.experience.startsAt)}</span></div>
                  <div><strong>End</strong><span>{formatDate(experienceDetails.experience.endsAt)}</span></div>
                  <div><strong>Locație</strong><span>{[experienceDetails.experience.city, experienceDetails.experience.country].filter(Boolean).join(", ") || "—"}</span></div>
                  <div><strong>Adresă</strong><span>{experienceDetails.experience.address || "—"}</span></div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Counts</div>
                  <div className={styles.detailGrid}>
                    <div><strong>Bookings total</strong><span>{numberFmt(experienceDetails.counts?.bookingsTotal)}</span></div>
                    <div><strong>Bookings active</strong><span>{numberFmt(experienceDetails.counts?.bookingsActive)}</span></div>
                    <div><strong>Bookings paid-like</strong><span>{numberFmt(experienceDetails.counts?.bookingsPaidLike)}</span></div>
                    <div><strong>Participanți</strong><span>{numberFmt(experienceDetails.counts?.participantsBooked)} / {numberFmt(experienceDetails.experience.maxParticipants)}</span></div>
                    <div><strong>Reports total</strong><span>{numberFmt(experienceDetails.counts?.reportsTotal)}</span></div>
                    <div><strong>Reports open</strong><span>{numberFmt(experienceDetails.counts?.reportsOpen)}</span></div>
                    <div><strong>Messages</strong><span>{numberFmt(experienceDetails.counts?.messagesCount)}</span></div>
                    <div><strong>Media items</strong><span>{numberFmt(experienceDetails.counts?.mediaItems)}</span></div>
                  </div>
                </div>

                {(experienceDetails.experience.languages?.length || 0) > 0 ? (
                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Languages</div>
                    <div className={styles.badgeRow}>
                      {(experienceDetails.experience.languages || []).map((lang) => (
                        <span key={`${experienceDetails.experience?.id}-${lang}`} className={styles.badge}>{lang}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {experienceDetails.experience.shortDescription || experienceDetails.experience.description ? (
                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Copy</div>
                    {experienceDetails.experience.shortDescription ? (
                      <div className={styles.miniItem}>
                        <div><strong>Short</strong></div>
                        <div>{experienceDetails.experience.shortDescription}</div>
                      </div>
                    ) : null}
                    {experienceDetails.experience.description ? (
                      <div className={styles.miniItem}>
                        <div><strong>Description</strong></div>
                        <div className="muted">{experienceDetails.experience.description}</div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Media preview</div>
                  {(experienceDetails.media || []).length === 0 ? (
                    <div className="muted">Nu există media atașată.</div>
                  ) : (
                    <div className={styles.mediaGrid}>
                      {(experienceDetails.media || []).slice(0, 8).map((m, idx) => (
                        <div key={`${m.url}-${idx}`} className={styles.mediaCard}>
                          {String(m.kind) === "video" ? (
                            <video className={styles.mediaPreview} src={m.url} controls preload="metadata" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className={styles.mediaPreview} src={m.url} alt={`media-${idx + 1}`} loading="lazy" />
                          )}
                          <div className={styles.mediaMeta}>
                            <span className={styles.badge}>{m.kind || "media"}</span>
                            {m.source ? <span className={styles.badge}>{m.source}</span> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Quick links</div>
                  <div className={styles.buttonRow}>
                    <a className={styles.linkButton} href={`/experiences/${experienceDetails.experience.id}`} target="_blank" rel="noreferrer">
                      Deschide public page
                    </a>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => {
                        setActiveSection("bookings");
                        setBookingQuery(experienceDetails.experience?.id || "");
                        void loadBookings(1);
                      }}
                    >
                      Vezi bookings
                    </button>
                    {experienceDetails.experience.host?.email ? (
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => {
                          openHostRegistry(
                            experienceDetails.experience?.host?.id,
                            experienceDetails.experience?.host?.email || experienceDetails.experience?.host?.id || ""
                          );
                        }}
                      >
                        Vezi host
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Recent activity</div>
                  {(experienceDetails.timeline || []).length === 0 ? (
                    <div className="muted">Fără evenimente recente.</div>
                  ) : (
                    <div className={styles.stackSm}>
                      {(experienceDetails.timeline || []).slice(0, 10).map((event, idx) => (
                        <div key={`${event.kind}-${event.targetId || idx}-${event.at || idx}`} className={styles.miniItem}>
                          <div><strong>{event.kind}</strong></div>
                          <div className="muted">{event.label || "—"}</div>
                          <div className="muted">{formatDate(event.at || null)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section> : null}

      {activeSection === "bookings" ? <section className={styles.sectionBlock}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Bookings</h2>
          <span className="muted">
            {bookings ? `${numberFmt(bookings.total)} rezultate` : "—"}
          </span>
        </div>

        <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onBookingsSubmit}>
          <div className={styles.filtersGrid}>
            <input
              className="input"
              placeholder="Caută booking / email / titlu experiență / id"
              value={bookingQuery}
              onChange={(e) => setBookingQuery(e.target.value)}
            />
            <select className={styles.select} value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}>
              <option value="all">Toate statusurile</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="DEPOSIT_PAID">DEPOSIT_PAID</option>
              <option value="PENDING_ATTENDANCE">PENDING_ATTENDANCE</option>
              <option value="DISPUTED">DISPUTED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="AUTO_COMPLETED">AUTO_COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="REFUND_FAILED">REFUND_FAILED</option>
            </select>
            <select className={styles.select} value={bookingPaidFilter} onChange={(e) => setBookingPaidFilter(e.target.value)}>
              <option value="all">Paid + unpaid</option>
              <option value="true">Doar paid</option>
              <option value="false">Doar unpaid</option>
            </select>
          </div>
          <div className={styles.filtersActions}>
            <button
              className="button secondary"
              type="button"
              disabled={csvExportingKey === "bookings"}
              onClick={() => void exportBookingsCsv()}
            >
              {csvExportingKey === "bookings" ? "Export..." : "Export CSV"}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setBookingQuery("");
                setBookingStatusFilter("all");
                setBookingPaidFilter("all");
                void loadBookings(1);
              }}
            >
              Reset
            </button>
            <button className="button" type="submit" disabled={bookingsLoading}>
              {bookingsLoading ? "Se caută..." : "Caută"}
            </button>
          </div>
        </form>

        {bookingsError ? <div className={`${styles.card} ${styles.errorCard}`}>{bookingsError}</div> : null}

        <div className={styles.listStack}>
          {groupedBookings.map((group) => (
            <AdminBookingExperienceRow
              key={group.key}
              group={group}
              pendingKey={pendingKey}
              onCancel={onCancelBooking}
              onRefund={onRefundBooking}
            />
          ))}
          {!bookingsLoading && groupedBookings.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyCard}`}>Nu există booking-uri pentru filtrele selectate.</div>
          ) : null}
          <div className={styles.pagination}>
            <button
              type="button"
              className="button secondary"
              disabled={!bookings || bookings.page <= 1 || bookingsLoading}
              onClick={() => void loadBookings((bookings?.page || 1) - 1)}
            >
              ← Anterior
            </button>
            <span className="muted">
              Pagina {bookings?.page || 1} / {bookings?.pages || 1}
            </span>
            <button
              type="button"
              className="button secondary"
              disabled={!bookings || (bookings?.page || 1) >= (bookings?.pages || 1) || bookingsLoading}
              onClick={() => void loadBookings((bookings?.page || 1) + 1)}
            >
              Următor →
            </button>
          </div>
        </div>
      </section> : null}

      {activeSection === "reports" ? <section className={styles.sectionBlock}>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Reports / Moderation</h2>
          <span className="muted">
            {reports ? `${numberFmt(reports.total)} rezultate` : "—"}
          </span>
        </div>

        <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onReportsSubmit}>
          <div className={styles.filtersGrid}>
            <input
              className="input"
              placeholder="Caută după motiv, email, experiență sau id"
              value={reportQuery}
              onChange={(e) => setReportQuery(e.target.value)}
            />
            <select className={styles.select} value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value)}>
              <option value="OPEN_INBOX">Inbox (OPEN + INVESTIGATING)</option>
              <option value="all">Toate statusurile</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="HANDLED">HANDLED</option>
              <option value="IGNORED">IGNORED</option>
            </select>
            <select className={styles.select} value={reportTypeFilter} onChange={(e) => setReportTypeFilter(e.target.value)}>
              <option value="all">Toate tipurile</option>
              <option value="CONTENT">CONTENT</option>
              <option value="BOOKING_DISPUTE">BOOKING_DISPUTE</option>
              <option value="USER">USER</option>
              <option value="STRIPE_DISPUTE">STRIPE_DISPUTE</option>
            </select>
          </div>
          <div className={styles.filtersGrid}>
            <select className={styles.select} value={reportAssignedFilter} onChange={(e) => setReportAssignedFilter(e.target.value)}>
              <option value="all">Assignment: all</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
            </select>
            <div />
            <div />
          </div>
          <div className={styles.filtersActions}>
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setReportQuery("");
                setReportStatusFilter("OPEN_INBOX");
                setReportTypeFilter("all");
                setReportAssignedFilter("all");
                void loadReports(1);
              }}
            >
              Reset
            </button>
            <button className="button" type="submit" disabled={reportsLoading}>
              {reportsLoading ? "Se caută..." : "Caută"}
            </button>
          </div>
        </form>

        {reportsError ? <div className={`${styles.card} ${styles.errorCard}`}>{reportsError}</div> : null}

        <div className={styles.splitGrid}>
          <div className={styles.listStack}>
            {(reports?.items || []).map((item) => (
              <AdminReportRow
                key={item.id}
                item={item}
                selected={selectedReportId === item.id}
                busy={pendingKey?.startsWith(`report:${item.id}:`)}
                onSelect={(id) => setSelectedReportId(id)}
                onAction={(id, action) => {
                  if (!canWriteReports) {
                    setActionError("Nu ai permisiune pentru acțiuni pe reports.");
                    return Promise.resolve();
                  }
                  return runAction(`report:${id}:${action}`, async () => {
                    const needsReason = ["PAUSE_EXPERIENCE", "SUSPEND_USER"].includes(action) || action === "MARK_IGNORED";
                    let reason: string | undefined;
                    if (needsReason) {
                      const typedWord =
                        action === "PAUSE_EXPERIENCE" ? "PAUSE" : action === "SUSPEND_USER" ? "SUSPEND" : "IGNORE";
                      const decision = await askCriticalConfirmation({
                        title: `Report action: ${action}`,
                        impact:
                          action === "PAUSE_EXPERIENCE"
                            ? "Experiența raportată va fi pusă pe pauză."
                            : action === "SUSPEND_USER"
                              ? "Utilizatorul țintă va fi suspendat (blocked)."
                              : "Report-ul va fi marcat ca ignorat.",
                        requireReason: true,
                        reasonLabel: "Motiv (obligatoriu)",
                        reasonPlaceholder: "Ex: verificare finalizată de echipa support",
                        requireTypeText: typedWord,
                        confirmButtonLabel: "Confirmă acțiunea",
                      });
                      if (!decision.confirmed) return;
                      reason = decision.reason;
                    }
                    await postReportAction(id, action, reason || undefined);
                  });
                }}
              />
            ))}
            {!reportsLoading && (reports?.items || []).length === 0 ? (
              <div className={`${styles.card} ${styles.emptyCard}`}>Nu există reports pentru filtrele selectate.</div>
            ) : null}
            <div className={styles.pagination}>
              <button
                type="button"
                className="button secondary"
                disabled={!reports || reports.page <= 1 || reportsLoading}
                onClick={() => void loadReports((reports?.page || 1) - 1)}
              >
                ← Anterior
              </button>
              <span className="muted">
                Pagina {reports?.page || 1} / {reports?.pages || 1}
              </span>
              <button
                type="button"
                className="button secondary"
                disabled={!reports || (reports?.page || 1) >= (reports?.pages || 1) || reportsLoading}
                onClick={() => void loadReports((reports?.page || 1) + 1)}
              >
                Următor →
              </button>
            </div>
          </div>

          <div className={`${styles.card} ${styles.detailsCard}`}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.detailsTitle}>Moderation details</h3>
              {selectedReport ? <span className="muted">#{selectedReport.id.slice(-8)}</span> : null}
            </div>

            {!selectedReport ? <div className="muted">Selectează un report din inbox.</div> : null}
            {selectedReport ? (
              <>
                <div className={styles.detailGrid}>
                  <div><strong>Status</strong><span>{selectedReport.status || "—"}</span></div>
                  <div><strong>Type</strong><span>{selectedReport.type || "—"}</span></div>
                  <div><strong>Assigned</strong><span>{selectedReport.assignedTo || "—"}</span></div>
                  <div><strong>Handled by</strong><span>{selectedReport.handledBy || "—"}</span></div>
                  <div><strong>Age</strong><span>{numberFmt(selectedReport.ageHours)}h</span></div>
                  <div><strong>Deadline</strong><span>{formatDate(selectedReport.deadlineAt)}</span></div>
                  <div><strong>Reporter</strong><span>{selectedReport.reporter?.email || selectedReport.reporter?.name || "—"}</span></div>
                  <div><strong>Host</strong><span>{selectedReport.host?.email || selectedReport.host?.name || "—"}</span></div>
                  <div><strong>Target user</strong><span>{selectedReport.targetUser?.email || selectedReport.targetUser?.name || "—"}</span></div>
                  <div><strong>Booking</strong><span>{selectedReport.booking?.id ? `#${selectedReport.booking.id.slice(-6)} · ${selectedReport.booking.status || "—"}` : "—"}</span></div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Motiv</div>
                  <div className={styles.miniItem}>
                    <div><strong>{selectedReport.reason || "—"}</strong></div>
                    <div className="muted">{selectedReport.comment || "Fără comentariu"}</div>
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Entity links</div>
                  <div className={styles.buttonRow}>
                    {selectedReport.experience?.id ? (
                      <a className={styles.linkButton} href={`/experiences/${selectedReport.experience.id}`} target="_blank" rel="noreferrer">
                        Deschide experiența
                      </a>
                    ) : null}
                    {selectedReport.booking?.id ? (
                      <button type="button" className="button secondary" onClick={() => { setActiveSection("bookings"); setBookingQuery(selectedReport.booking?.id || ""); void loadBookings(1); }}>
                        Vezi booking în tab
                      </button>
                    ) : null}
                    {selectedReport.reporter?.email ? (
                      <button type="button" className="button secondary" onClick={() => { setActiveSection("users"); setUserQuery(selectedReport.reporter?.email || ""); void loadUsers(1); }}>
                        Vezi reporter în users
                      </button>
                    ) : null}
                    {selectedReport.host?.id || selectedReport.host?.email ? (
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => openHostRegistry(selectedReport.host?.id, selectedReport.host?.email || selectedReport.host?.id || "")}
                      >
                        Vezi host în hosts
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Quick moderation actions</div>
                  <div className={styles.buttonRow}>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!canWriteReports || !!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:MARK_INVESTIGATING`, () => postReportAction(selectedReport.id, "MARK_INVESTIGATING"))
                      }
                    >
                      Investigating
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!canWriteReports || !!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:MARK_HANDLED`, () => postReportAction(selectedReport.id, "MARK_HANDLED"))
                      }
                    >
                      Mark handled
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!canWriteReports || !!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:PAUSE_EXPERIENCE`, async () => {
                          const decision = await askCriticalConfirmation({
                            title: "Pause experience from report",
                            impact: "Experiența raportată va fi pusă pe pauză imediat.",
                            requireReason: true,
                            reasonLabel: "Motiv (obligatoriu)",
                            reasonPlaceholder: "Ex: risc confirmat de safety team",
                            requireTypeText: "PAUSE",
                            confirmButtonLabel: "Confirmă pause",
                          });
                          if (!decision.confirmed) return;
                          await postReportAction(selectedReport.id, "PAUSE_EXPERIENCE", decision.reason);
                        })
                      }
                    >
                      Pause experience
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!canWriteReports || !!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:SUSPEND_USER`, async () => {
                          const decision = await askCriticalConfirmation({
                            title: "Suspend user from report",
                            impact: "Utilizatorul țintă va fi suspendat (blocked).",
                            requireReason: true,
                            reasonLabel: "Motiv (obligatoriu)",
                            reasonPlaceholder: "Ex: încălcare gravă a regulilor",
                            requireTypeText: "SUSPEND",
                            confirmButtonLabel: "Confirmă suspendarea",
                          });
                          if (!decision.confirmed) return;
                          await postReportAction(selectedReport.id, "SUSPEND_USER", decision.reason);
                        })
                      }
                    >
                      Suspend user
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section> : null}

      {activeSection === "payments" ? (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Payments & Refunds</h2>
            <span className="muted">
              {paymentsHealth?.generatedAt ? `Actualizat: ${formatDate(paymentsHealth.generatedAt)}` : "—"}
            </span>
          </div>

          {paymentsError ? <div className={`${styles.card} ${styles.errorCard}`}>{paymentsError}</div> : null}
          {paymentsLoading ? <div className={`${styles.card} ${styles.emptyCard}`}>Se încarcă health checks...</div> : null}

          <div className={styles.statsGrid}>
            <StatCard
              label="Refund failed"
              value={paymentsHealth?.summary?.refundFailedBookings}
              hint={`+${numberFmt(paymentsHealth?.summary?.refundFailedLast7d)} în 7 zile`}
            />
            <StatCard
              label="Disputes"
              value={paymentsHealth?.summary?.disputedPayments}
              hint="Plăți în dispută Stripe"
            />
            <StatCard
              label="Stripe incomplete hosts"
              value={paymentsHealth?.summary?.stripeOnboardingIncompleteHosts}
              hint={`Fără cont: ${numberFmt(paymentsHealth?.summary?.stripeMissingAccountHosts)}`}
            />
            <StatCard
              label="Payout attention"
              value={paymentsHealth?.summary?.payoutAttentionBookings}
              hint={`Eligible bookings: ${numberFmt(paymentsHealth?.summary?.payoutEligibleBookings)}`}
            />
            <StatCard
              label="Compliance attention"
              value={paymentsHealth?.summary?.hostComplianceAttentionHosts}
              hint={`Mismatch nume: ${numberFmt(paymentsHealth?.summary?.hostComplianceNameMismatches)}`}
            />
            <StatCard
              label="Compliance gaps"
              value={paymentsHealth?.summary?.hostComplianceMissingBankReference}
              hint={`No snapshot: ${numberFmt(paymentsHealth?.summary?.hostComplianceNoSnapshot)}`}
            />
          </div>

          <div className={styles.overviewGrid}>
            <div className={`${styles.card} ${styles.inboxCard}`}>
              <div className={styles.panelTitle}>Refund failed (top 20)</div>
              {(paymentsHealth?.refundFailedBookings || []).length === 0 ? (
                <div className="muted">Nu există booking-uri cu REFUND_FAILED.</div>
              ) : (
                <div className={styles.stackSm}>
                  {(paymentsHealth?.refundFailedBookings || []).slice(0, 8).map((row) => (
                    <div key={row.id} className={styles.miniItem}>
                      <div>
                        <strong>{row.experience?.title || "Booking"}</strong> · {row.status}
                      </div>
                      <div className="muted">
                        Host: {row.host?.email || row.host?.name || "—"} · Attempts: {numberFmt(row.refundAttempts)}
                      </div>
                      <div className="muted">
                        {formatMoney(row.payment?.amount ?? row.amount, row.payment?.currency || row.currency)} · Last try: {formatDate(row.lastRefundAttemptAt)}
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("bookings");
                            setBookingQuery(row.id);
                            void loadBookings(1);
                          }}
                        >
                          Deschide în Bookings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${styles.card} ${styles.inboxCard}`}>
              <div className={styles.panelTitle}>Stripe onboarding incomplete (hosts)</div>
              {(paymentsHealth?.stripeOnboardingIncompleteHosts || []).length === 0 ? (
                <div className="muted">Toți host-ii verificați par OK în Stripe.</div>
              ) : (
                <div className={styles.stackSm}>
                  {(paymentsHealth?.stripeOnboardingIncompleteHosts || []).slice(0, 8).map((host) => (
                    <div key={host.id} className={styles.miniItem}>
                      <div>
                        <strong>{host.email || host.name || "Host"}</strong>
                      </div>
                      <div className="muted">
                        Role: {host.role || "—"} · Events: {numberFmt(host.totalEvents)} · Participants: {numberFmt(host.totalParticipants)}
                      </div>
                      <div className={styles.badgeRow}>
                        {(host.issues || []).map((issue) => (
                          <span key={`${host.id}-${issue}`} className={`${styles.badge} ${styles.badgeWarn}`}>{issue}</span>
                        ))}
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            openHostRegistry(host.id, host.email || host.id);
                          }}
                        >
                          Vezi host în Hosts
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${styles.card} ${styles.inboxCard}`}>
              <div className={styles.panelTitle}>Host compliance (identity + bank ref)</div>
              {(paymentsHealth?.hostComplianceAttentionHosts || []).length === 0 ? (
                <div className="muted">Nu există alerte de compliance pentru host-ii conectați la Stripe.</div>
              ) : (
                <div className={styles.stackSm}>
                  {(paymentsHealth?.hostComplianceAttentionHosts || []).slice(0, 12).map((host) => (
                    <div key={host.id} className={styles.miniItem}>
                      <div>
                        <strong>{host.email || host.name || "Host"}</strong>
                      </div>
                      <div className="muted">LIVADAI: {host.livadaiName || "—"}</div>
                      <div className="muted">Stripe legal: {host.stripeLegalName || host.stripeDisplayName || "—"}</div>
                      <div className="muted">
                        Bank ref: {host.bankReference || "—"} · Snapshot: {formatDate(host.snapshotAt || null)}
                      </div>
                      <div className={styles.badgeRow}>
                        {(host.issues || []).map((issue) => (
                          <span key={`${host.id}-${issue}`} className={`${styles.badge} ${styles.badgeWarn}`}>
                            {formatComplianceIssue(issue)}
                          </span>
                        ))}
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            openHostRegistry(host.id, host.email || host.id);
                          }}
                        >
                          Vezi host în Hosts
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.splitGrid}>
            <div className={`${styles.card} ${styles.detailsCardStatic}`}>
              <div className={styles.panelTitle}>Payout attention (eligible but blocked)</div>
              {(paymentsHealth?.payoutAttentionBookings || []).length === 0 ? (
                <div className="muted">Nu există payout-uri eligibile blocate.</div>
              ) : (
                <div className={styles.stackSm}>
                  {(paymentsHealth?.payoutAttentionBookings || []).map((row) => (
                    <div key={row.id} className={styles.miniItem}>
                      <div>
                        <strong>{row.experience?.title || "Booking"}</strong> · #{row.id.slice(-6)}
                      </div>
                      <div className="muted">
                        Payout eligible: {formatDate(row.payoutEligibleAt)} · Host: {row.host?.email || row.host?.name || "—"}
                      </div>
                      <div className={styles.badgeRow}>
                        {String(row.issueReason || "").split(",").filter(Boolean).map((issue) => (
                          <span key={`${row.id}-${issue}`} className={`${styles.badge} ${styles.badgeWarn}`}>{issue}</span>
                        ))}
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("bookings");
                            setBookingQuery(row.id);
                            void loadBookings(1);
                          }}
                        >
                          Booking
                        </button>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            openHostRegistry(row.host?.id, row.host?.email || row.host?.id || "");
                          }}
                        >
                          Host
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${styles.card} ${styles.detailsCardStatic}`}>
              <div className={styles.panelTitle}>Stripe disputes (latest)</div>
              {(paymentsHealth?.disputedPayments || []).length === 0 ? (
                <div className="muted">Nu există plăți în dispută.</div>
              ) : (
                <div className={styles.stackSm}>
                  {(paymentsHealth?.disputedPayments || []).map((row) => (
                    <div key={row.paymentId} className={styles.miniItem}>
                      <div>
                        <strong>{row.status || "DISPUTE"}</strong> · {row.paymentType || "PAYMENT"}
                      </div>
                      <div className="muted">
                        {formatMoney(row.amount, row.currency)} · {formatDate(row.updatedAt || row.createdAt)}
                      </div>
                      <div className="muted">
                        Booking: {row.bookingId ? `#${row.bookingId.slice(-6)}` : "—"} · {row.booking?.experience?.title || "fără booking"}
                      </div>
                      <div className={styles.buttonRow}>
                        {row.bookingId ? (
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => {
                              setActiveSection("bookings");
                              setBookingQuery(row.bookingId || "");
                              void loadBookings(1);
                            }}
                          >
                            Vezi booking
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "audit" ? (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Audit Log</h2>
            <span className="muted">{auditLogs ? `${numberFmt(auditLogs.total)} acțiuni` : "—"}</span>
          </div>

          <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onAuditSubmit}>
            <div className={styles.filtersGrid}>
              <input
                className="input"
                placeholder="Caută după actor, action, target, reason, targetId"
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
              />
              <input
                className="input"
                placeholder="Actor email"
                value={auditActorEmailFilter}
                onChange={(e) => setAuditActorEmailFilter(e.target.value)}
              />
              <select className={styles.select} value={auditActionTypeFilter} onChange={(e) => setAuditActionTypeFilter(e.target.value)}>
                <option value="all">Toate acțiunile</option>
                <option value="USER_ROLE_UPDATE">USER_ROLE_UPDATE</option>
                <option value="USER_BLOCK_UPDATE">USER_BLOCK_UPDATE</option>
                <option value="USER_BAN_UPDATE">USER_BAN_UPDATE</option>
                <option value="USER_SESSIONS_INVALIDATED">USER_SESSIONS_INVALIDATED</option>
                <option value="EXPERIENCE_ACTIVE_UPDATE">EXPERIENCE_ACTIVE_UPDATE</option>
                <option value="EXPERIENCE_STATUS_UPDATE">EXPERIENCE_STATUS_UPDATE</option>
                <option value="BOOKING_CANCEL_ADMIN">BOOKING_CANCEL_ADMIN</option>
                <option value="BOOKING_REFUND_ADMIN">BOOKING_REFUND_ADMIN</option>
                <option value="REPORT_ASSIGN_TO_ME">REPORT_ASSIGN_TO_ME</option>
                <option value="REPORT_MARK_HANDLED">REPORT_MARK_HANDLED</option>
                <option value="REPORT_MARK_IGNORED">REPORT_MARK_IGNORED</option>
                <option value="REPORT_PAUSE_EXPERIENCE">REPORT_PAUSE_EXPERIENCE</option>
                <option value="REPORT_SUSPEND_USER">REPORT_SUSPEND_USER</option>
              </select>
            </div>
            <div className={styles.filtersGrid}>
              <select className={styles.select} value={auditTargetTypeFilter} onChange={(e) => setAuditTargetTypeFilter(e.target.value)}>
                <option value="all">Toate target-urile</option>
                <option value="user">user</option>
                <option value="experience">experience</option>
                <option value="booking">booking</option>
                <option value="report">report</option>
              </select>
              <div />
              <div />
            </div>
            <div className={styles.filtersActions}>
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setAuditQuery("");
                  setAuditActorEmailFilter("");
                  setAuditActionTypeFilter("all");
                  setAuditTargetTypeFilter("all");
                  void loadAuditLogs(1);
                }}
              >
                Reset
              </button>
              <button className="button" type="submit" disabled={auditLoading}>
                {auditLoading ? "Se caută..." : "Caută"}
              </button>
            </div>
          </form>

          {auditError ? <div className={`${styles.card} ${styles.errorCard}`}>{auditError}</div> : null}

          <div className={styles.splitGrid}>
            <div className={styles.listStack}>
              {(auditLogs?.items || []).map((item) => (
                <AdminAuditRow
                  key={item.id}
                  item={item}
                  selected={selectedAuditId === item.id}
                  busy={false}
                  onSelect={setSelectedAuditId}
                />
              ))}
              {!auditLoading && (auditLogs?.items || []).length === 0 ? (
                <div className={`${styles.card} ${styles.emptyCard}`}>Nu există acțiuni admin pentru filtrele selectate.</div>
              ) : null}
              <div className={styles.pagination}>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!auditLogs || auditLogs.page <= 1 || auditLoading}
                  onClick={() => void loadAuditLogs((auditLogs?.page || 1) - 1)}
                >
                  ← Anterior
                </button>
                <span className="muted">
                  Pagina {auditLogs?.page || 1} / {auditLogs?.pages || 1}
                </span>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!auditLogs || (auditLogs?.page || 1) >= (auditLogs?.pages || 1) || auditLoading}
                  onClick={() => void loadAuditLogs((auditLogs?.page || 1) + 1)}
                >
                  Următor →
                </button>
              </div>
            </div>

            <div className={`${styles.card} ${styles.detailsCard}`}>
              <div className={styles.sectionTitleRow}>
                <h3 className={styles.detailsTitle}>Audit details</h3>
                {selectedAudit ? <span className="muted">#{selectedAudit.id.slice(-8)}</span> : null}
              </div>

              {!selectedAudit ? <div className="muted">Selectează o acțiune din audit log.</div> : null}
              {selectedAudit ? (
                <>
                  <div className={styles.detailGrid}>
                    <div><strong>Action</strong><span>{selectedAudit.actionType || "—"}</span></div>
                    <div><strong>Actor</strong><span>{selectedAudit.actorEmail || "—"}</span></div>
                    <div><strong>Target Type</strong><span>{selectedAudit.targetType || "—"}</span></div>
                    <div><strong>Target ID</strong><span>{selectedAudit.targetId || "—"}</span></div>
                    <div><strong>IP</strong><span>{selectedAudit.ip || "—"}</span></div>
                    <div><strong>At</strong><span>{formatDate(selectedAudit.createdAt)}</span></div>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Reason</div>
                    <div className={styles.miniItem}>
                      <div className="muted">{selectedAudit.reason || "Fără motiv"}</div>
                    </div>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Diff</div>
                    <pre className={styles.codeBlock}>{formatJson(selectedAudit.diff)}</pre>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Meta</div>
                    <pre className={styles.codeBlock}>{formatJson(selectedAudit.meta)}</pre>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Quick links</div>
                    <div className={styles.buttonRow}>
                      {selectedAudit.targetType === "booking" && selectedAudit.targetId ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("bookings");
                            setBookingQuery(selectedAudit.targetId || "");
                            void loadBookings(1);
                          }}
                        >
                          Open in Bookings
                        </button>
                      ) : null}
                      {selectedAudit.targetType === "experience" && selectedAudit.targetId ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("experiences");
                            setExperienceQuery(selectedAudit.targetId || "");
                            void loadExperiences(1);
                          }}
                        >
                          Open in Experiences
                        </button>
                      ) : null}
                      {selectedAudit.targetType === "user" && selectedAudit.targetId ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("users");
                            setUserQuery(selectedAudit.targetId || "");
                            void loadUsers(1);
                          }}
                        >
                          Open in Users
                        </button>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "messages" ? (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Messages / Conversations</h2>
            <span className="muted">{messagesData ? `${numberFmt(messagesData.total)} conversații` : "—"}</span>
          </div>

          <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onMessagesSubmit}>
            <div className={styles.filtersGrid}>
              <input
                className="input"
                placeholder="Caută după mesaj, email, experiență sau booking id"
                value={messagesQuery}
                onChange={(e) => setMessagesQuery(e.target.value)}
              />
              <select className={styles.select} value={messagesHasReportsFilter} onChange={(e) => setMessagesHasReportsFilter(e.target.value)}>
                <option value="all">Toate conversațiile</option>
                <option value="true">Doar cu reports</option>
                <option value="false">Fără reports</option>
              </select>
              <div />
            </div>
            <div className={styles.filtersActions}>
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setMessagesQuery("");
                  setMessagesHasReportsFilter("all");
                  void loadMessages(1);
                }}
              >
                Reset
              </button>
              <button className="button" type="submit" disabled={messagesLoading}>
                {messagesLoading ? "Se caută..." : "Caută"}
              </button>
            </div>
          </form>

          {messagesError ? <div className={`${styles.card} ${styles.errorCard}`}>{messagesError}</div> : null}

          <div className={styles.splitGrid}>
            <div className={styles.listStack}>
              {(messagesData?.items || []).map((item) => (
                <AdminMessageConversationRow
                  key={item.bookingId}
                  item={item}
                  selected={selectedMessageBookingId === item.bookingId}
                  busy={false}
                  onOpen={loadMessageThread}
                />
              ))}
              {!messagesLoading && (messagesData?.items || []).length === 0 ? (
                <div className={`${styles.card} ${styles.emptyCard}`}>Nu există conversații pentru filtrele selectate.</div>
              ) : null}
              <div className={styles.pagination}>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!messagesData || messagesData.page <= 1 || messagesLoading}
                  onClick={() => void loadMessages((messagesData?.page || 1) - 1)}
                >
                  ← Anterior
                </button>
                <span className="muted">
                  Pagina {messagesData?.page || 1} / {messagesData?.pages || 1}
                </span>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!messagesData || (messagesData?.page || 1) >= (messagesData?.pages || 1) || messagesLoading}
                  onClick={() => void loadMessages((messagesData?.page || 1) + 1)}
                >
                  Următor →
                </button>
              </div>
            </div>

            <div className={`${styles.card} ${styles.detailsCard}`}>
              <div className={styles.sectionTitleRow}>
                <h3 className={styles.detailsTitle}>Conversation details</h3>
                {selectedMessageBookingId ? <span className="muted">#{selectedMessageBookingId.slice(-8)}</span> : null}
              </div>

              {!selectedMessageBookingId ? <div className="muted">Selectează o conversație din listă.</div> : null}
              {selectedMessageBookingId && messageThreadLoading ? <div className="muted">Se încarcă thread-ul...</div> : null}
              {selectedMessageBookingId && messageThreadError ? <div className={`${styles.banner} ${styles.bannerError}`}>{messageThreadError}</div> : null}

              {selectedMessageBookingId && !messageThreadLoading && !messageThreadError && messageThread ? (
                <>
                  <div className={styles.detailGrid}>
                    <div><strong>Booking</strong><span>{messageThread.booking?.id || selectedMessageBookingId}</span></div>
                    <div><strong>Status</strong><span>{messageThread.booking?.status || "—"}</span></div>
                    <div><strong>Host</strong><span>{messageThread.booking?.host?.email || messageThread.booking?.host?.name || "—"}</span></div>
                    <div><strong>Explorer</strong><span>{messageThread.booking?.explorer?.email || messageThread.booking?.explorer?.name || "—"}</span></div>
                    <div><strong>Experiență</strong><span>{messageThread.booking?.experience?.title || "—"}</span></div>
                    <div><strong>Locație</strong><span>{[messageThread.booking?.experience?.city, messageThread.booking?.experience?.country].filter(Boolean).join(", ") || "—"}</span></div>
                    <div><strong>Mesaje</strong><span>{numberFmt(messageThread.summary?.messagesCount)}</span></div>
                    <div><strong>Reports</strong><span>{numberFmt(messageThread.summary?.reportsOpen)} open / {numberFmt(messageThread.summary?.reportsTotal)} total</span></div>
                    <div><strong>Primul mesaj</strong><span>{formatDate(messageThread.summary?.firstMessageAt || null)}</span></div>
                    <div><strong>Ultimul mesaj</strong><span>{formatDate(messageThread.summary?.lastMessageAt || null)}</span></div>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Quick links</div>
                    <div className={styles.buttonRow}>
                      {messageThread.booking?.experience?.id ? (
                        <a className={styles.linkButton} href={`/experiences/${messageThread.booking.experience.id}`} target="_blank" rel="noreferrer">
                          Deschide experiența
                        </a>
                      ) : null}
                      {messageThread.booking?.id ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("bookings");
                            setBookingQuery(messageThread.booking?.id || "");
                            void loadBookings(1);
                          }}
                        >
                          Vezi booking în Bookings
                        </button>
                      ) : null}
                      {(selectedMessageConversation?.openReportsCount || 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setActiveSection("reports");
                            setReportStatusFilter("OPEN_INBOX");
                            setReportQuery(messageThread.booking?.id || selectedMessageBookingId || "");
                            void loadReports(1);
                          }}
                        >
                          Vezi reports
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Thread ({numberFmt(messageThread.messages?.length)} mesaje încărcate)</div>
                    {!Array.isArray(messageThread.messages) || messageThread.messages.length === 0 ? (
                      <div className="muted">Nu există mesaje în conversație.</div>
                    ) : (
                      <div className={styles.threadList}>
                        {messageThread.messages.map((msg) => {
                          const senderId = msg.sender?.id || "";
                          const isHost = !!senderId && senderId === (messageThread.booking?.host?.id || "");
                          const isExplorer = !!senderId && senderId === (messageThread.booking?.explorer?.id || "");
                          return (
                            <div
                              key={msg.id}
                              className={`${styles.threadItem} ${isHost ? styles.threadItemHost : ""} ${isExplorer ? styles.threadItemExplorer : ""}`}
                            >
                              <div className={styles.threadMeta}>
                                <span>{msg.sender?.email || msg.sender?.name || "Unknown sender"}</span>
                                <span>{isHost ? "HOST" : isExplorer ? "EXPLORER" : "USER"}</span>
                                <span>{formatDate(msg.createdAt || null)}</span>
                              </div>
                              <div className={styles.threadBody}>{msg.message || "—"}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Reports (latest)</div>
                    {!Array.isArray(messageThread.reports) || messageThread.reports.length === 0 ? (
                      <div className="muted">Fără reports legate de acest booking.</div>
                    ) : (
                      <div className={styles.stackSm}>
                        {messageThread.reports.slice(0, 8).map((report, index) => {
                          const row = report as Record<string, unknown>;
                          return (
                            <div key={String(row.id || row._id || `report-${index}`)} className={styles.miniItem}>
                              <div><strong>{String(row.type || "REPORT")}</strong> · {String(row.status || "—")}</div>
                              <div className="muted">{String(row.reason || row.comment || "Fără motiv")}</div>
                              <div className="muted">{formatDate((row.createdAt as string) || null)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.detailsSection}>
                    <div className={styles.panelTitle}>Payments (latest)</div>
                    {!Array.isArray(messageThread.payments) || messageThread.payments.length === 0 ? (
                      <div className="muted">Fără plăți atașate booking-ului.</div>
                    ) : (
                      <div className={styles.stackSm}>
                        {messageThread.payments.map((payment, index) => {
                          const p = payment as Record<string, unknown>;
                          return (
                            <div key={String(p.id || p._id || `payment-${index}`)} className={styles.miniItem}>
                              <div><strong>{String(p.status || "—")}</strong> · {String(p.paymentType || "PAYMENT")}</div>
                              <div className="muted">{formatMoney(Number(p.amount || 0), String(p.currency || "RON"))}</div>
                              <div className="muted">{String(p.stripePaymentIntentId || p.stripeSessionId || "fără Stripe ref")}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "system" ? (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>System</h2>
            <span className="muted">
              {systemHealth?.generatedAt ? `Actualizat: ${formatDate(systemHealth.generatedAt)}` : "—"}
            </span>
          </div>

          {systemError ? <div className={`${styles.card} ${styles.errorCard}`}>{systemError}</div> : null}
          {systemLoading ? <div className={`${styles.card} ${styles.emptyCard}`}>Se încarcă System health...</div> : null}

          <div className={styles.statsGrid}>
            <StatCard label="Reports OPEN" value={systemHealth?.opsAttention?.openReports} hint="Moderation inbox" />
            <StatCard label="Reports INVESTIG." value={systemHealth?.opsAttention?.investigatingReports} hint="În lucru" />
            <StatCard label="Refund failed" value={systemHealth?.opsAttention?.refundFailedBookings} hint="Necesită intervenție" />
            <StatCard label="Disputes" value={systemHealth?.opsAttention?.disputedPayments} hint="Stripe / charge disputes" />
            <StatCard label="Plăți INITIATED stale" value={systemHealth?.opsAttention?.staleInitiatedPayments} hint="> 30 minute" />
            <StatCard label="Admin actions 24h" value={systemHealth?.opsAttention?.adminActionsLast24h} hint="Audit activity" />
          </div>

          <div className={styles.overviewGrid}>
            <div className={`${styles.card} ${styles.inboxCard}`}>
              <div className={styles.panelTitle}>Runtime</div>
              <div className={styles.detailGrid}>
                <div><strong>Node</strong><span>{systemHealth?.runtime?.nodeVersion || "—"}</span></div>
                <div><strong>Env</strong><span>{systemHealth?.runtime?.env || "—"}</span></div>
                <div><strong>Uptime</strong><span>{formatUptime(systemHealth?.runtime?.uptimeSeconds)}</span></div>
                <div><strong>PID</strong><span>{systemHealth?.runtime?.pid ?? "—"}</span></div>
              </div>
            </div>

            <div className={`${styles.card} ${styles.inboxCard}`}>
              <div className={styles.panelTitle}>Database</div>
              <div className={styles.detailGrid}>
                <div><strong>Status</strong><span>{systemHealth?.database?.state || "—"}</span></div>
                <div><strong>DB Name</strong><span>{systemHealth?.database?.name || "—"}</span></div>
                <div><strong>Host</strong><span>{systemHealth?.database?.host || "—"}</span></div>
                <div><strong>Generated</strong><span>{formatDate(systemHealth?.generatedAt)}</span></div>
              </div>
            </div>
          </div>

          <div className={styles.splitGrid}>
            <div className={styles.listStack}>
              <div className={`${styles.card} ${styles.inboxCard}`}>
                <div className={styles.panelTitle}>Security config</div>
                <div className={styles.stackSm}>
                  <div className={styles.miniItem}>
                    <div><strong>Admin allowlist</strong></div>
                    <div className="muted">
                      {systemHealth?.security?.adminAllowlistConfigured ? "Configured" : "Not configured"} · {numberFmt(systemHealth?.security?.adminAllowlistCount)} emailuri
                    </div>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.badge} ${systemHealth?.security?.jwtSecretConfigured ? styles.badgeOk : styles.badgeDanger}`}>JWT_SECRET</span>
                      <span className={`${styles.badge} ${systemHealth?.security?.cookieSecretConfigured ? styles.badgeOk : styles.badgeDanger}`}>COOKIE_SECRET</span>
                      <span className={`${styles.badge} ${systemHealth?.security?.adminActionSecretConfigured ? styles.badgeOk : styles.badgeWarn}`}>ADMIN_ACTION_SECRET</span>
                    </div>
                  </div>
                  <div className={styles.miniItem}>
                    <div><strong>Admin rate limit</strong></div>
                    <div className="muted">
                      Window: {numberFmt(systemHealth?.security?.adminRateLimitWindowMs)} ms · Max: {numberFmt(systemHealth?.security?.adminRateLimitMax)}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.card} ${styles.inboxCard}`}>
                <div className={styles.panelTitle}>Web / CORS config</div>
                <div className={styles.miniItem}>
                  <div className="muted">
                    ALLOWED_WEB_ORIGINS: {numberFmt(systemHealth?.web?.allowedWebOriginsCount)} origine
                  </div>
                  <div className={styles.badgeRow}>
                    {(systemHealth?.web?.allowedWebOrigins || []).length ? (
                      (systemHealth?.web?.allowedWebOrigins || []).map((origin) => (
                        <span key={origin} className={styles.badge}>{origin}</span>
                      ))
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeWarn}`}>Nu este configurat</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.card} ${styles.detailsCardStatic}`}>
              <div className={styles.panelTitle}>Integrations status</div>
              <div className={styles.stackSm}>
                {[
                  ["Stripe secret", systemHealth?.integrations?.stripeSecretConfigured],
                  ["Stripe webhook", systemHealth?.integrations?.stripeWebhookSecretConfigured],
                  ["Cloudinary", systemHealth?.integrations?.cloudinaryConfigured],
                  ["Resend", systemHealth?.integrations?.resendConfigured],
                  ["SMTP", systemHealth?.integrations?.smtpConfigured],
                  ["Reports email", systemHealth?.integrations?.reportsEmailConfigured],
                ].map(([label, ok]) => (
                  <div key={String(label)} className={styles.miniItem}>
                    <div className={styles.rowTop}>
                      <div><strong>{label}</strong></div>
                      <div className={styles.badgeRow}>
                        <span className={`${styles.badge} ${ok ? styles.badgeOk : styles.badgeDanger}`}>
                          {ok ? "Configured" : "Missing"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {criticalDialog ? (
        <div
          className={styles.modalOverlay}
          onClick={() => closeCriticalDialog({ confirmed: false, reason: "" })}
        >
          <div className={`${styles.card} ${styles.modalCard}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{criticalDialog.title}</h3>
              <button
                type="button"
                className="button secondary"
                onClick={() => closeCriticalDialog({ confirmed: false, reason: "" })}
              >
                Închide
              </button>
            </div>

            {criticalDialog.impact ? <div className={styles.modalImpact}>{criticalDialog.impact}</div> : null}

            {criticalDialog.requireReason ? (
              <label className={styles.modalField}>
                <span>{criticalDialog.reasonLabel || "Motiv (obligatoriu)"}</span>
                <textarea
                  className={styles.modalTextarea}
                  value={criticalReasonInput}
                  onChange={(e) => setCriticalReasonInput(e.target.value)}
                  placeholder={criticalDialog.reasonPlaceholder || "Descrie motivul acțiunii"}
                  rows={4}
                />
              </label>
            ) : null}

            {criticalDialog.requireTypeText ? (
              <label className={styles.modalField}>
                <span>Scrie exact: {String(criticalDialog.requireTypeText || "").toUpperCase()}</span>
                <input
                  className="input"
                  value={criticalConfirmTextInput}
                  onChange={(e) => setCriticalConfirmTextInput(e.target.value)}
                  placeholder={`Type ${String(criticalDialog.requireTypeText || "").toUpperCase()}`}
                />
              </label>
            ) : null}

            {criticalDialogError ? <div className={`${styles.banner} ${styles.bannerError}`}>{criticalDialogError}</div> : null}

            <div className={styles.modalActions}>
              <button
                type="button"
                className="button secondary"
                onClick={() => closeCriticalDialog({ confirmed: false, reason: "" })}
              >
                Renunță
              </button>
              <button
                type="button"
                className="button"
                onClick={submitCriticalDialog}
              >
                {criticalDialog.confirmButtonLabel || "Confirmă"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      </div>
    </div>
  );
}

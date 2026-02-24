"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
  stripeConnected?: boolean;
};

type AdminUsersResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: AdminUser[];
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

type AdminBookingDetailsResponse = {
  booking?: AdminBooking;
  payments?: Array<Record<string, unknown>>;
  reports?: Array<Record<string, unknown>>;
  messagesCount?: number;
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
  };
  refundFailedBookings?: AdminPaymentsHealthBooking[];
  stripeOnboardingIncompleteHosts?: AdminPaymentsHostIssue[];
  payoutAttentionBookings?: AdminPaymentsHealthBooking[];
  disputedPayments?: AdminDisputedPaymentItem[];
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
            <option value="EXPLORER">EXPLORER</option>
            <option value="HOST">HOST</option>
            <option value="BOTH">BOTH</option>
            <option value="ADMIN">ADMIN</option>
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
  busy,
  onToggleActive,
  onSaveStatus,
}: {
  item: AdminExperience;
  busy?: boolean;
  onToggleActive: (id: string, nextValue: boolean) => Promise<void>;
  onSaveStatus: (id: string, status: string) => Promise<void>;
}) {
  const [statusValue, setStatusValue] = useState(String(item.status || ""));

  useEffect(() => {
    setStatusValue(String(item.status || ""));
  }, [item.status]);

  return (
    <div className={`${styles.card} ${styles.rowCard}`}>
      <div className={styles.rowTop}>
        <div>
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

function AdminBookingRow({
  item,
  selected,
  busy,
  onOpenDetails,
  onCancel,
  onRefund,
}: {
  item: AdminBooking;
  selected?: boolean;
  busy?: boolean;
  onOpenDetails: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onRefund: (id: string) => Promise<void>;
}) {
  const canRefund = !!item.payment?.hasStripePaymentIntent && !["REFUNDED"].includes(String(item.payment?.status || "").toUpperCase());

  return (
    <div className={`${styles.card} ${styles.rowCard} ${selected ? styles.rowCardSelected : ""}`}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.rowTitle}>
            {item.experience?.title || "Booking"} <span className={styles.rowTitleMuted}>#{item.id.slice(-6)}</span>
          </div>
          <div className={styles.rowSub}>
            Explorer: {item.explorer?.name || item.explorer?.email || "—"} · Host: {item.host?.name || item.host?.email || "—"}
          </div>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{item.status || "—"}</span>
          {item.payment?.status ? <span className={styles.badge}>Pay: {item.payment.status}</span> : null}
          {(item.reportsCount || 0) > 0 ? <span className={`${styles.badge} ${styles.badgeWarn}`}>Reports {numberFmt(item.reportsCount)}</span> : null}
          {(item.messagesCount || 0) > 0 ? <span className={styles.badge}>Msg {numberFmt(item.messagesCount)}</span> : null}
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div><strong>ID:</strong> {item.id}</div>
        <div><strong>Creat:</strong> {formatDate(item.createdAt)}</div>
        <div><strong>Status prezență:</strong> {item.attendanceStatus || "—"}</div>
        <div><strong>Cantitate:</strong> {numberFmt(item.quantity)}</div>
        <div><strong>Sumă booking:</strong> {formatMoney(item.amount, item.currency)}</div>
        <div><strong>Plată:</strong> {item.payment ? formatMoney(item.payment.amount, item.payment.currency) : "—"}</div>
        <div><strong>Experiență:</strong> {[item.experience?.city, item.experience?.country].filter(Boolean).join(", ") || "—"}</div>
        <div><strong>Start:</strong> {formatDate(item.experience?.startsAt || null)}</div>
        <div><strong>Refundat:</strong> {formatDate(item.refundedAt || null)}</div>
      </div>

      <div className={styles.buttonRow}>
        <button type="button" className="button secondary" disabled={busy} onClick={() => void onOpenDetails(item.id)}>
          {selected ? "Reîncarcă detalii" : "Detalii"}
        </button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => void onCancel(item.id)}>
          Anulează booking
        </button>
        <button type="button" className="button secondary" disabled={busy || !canRefund} onClick={() => void onRefund(item.id)}>
          Refund manual
        </button>
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

  const [experiences, setExperiences] = useState<AdminExperiencesResponse | null>(null);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experiencesError, setExperiencesError] = useState("");
  const [experienceQuery, setExperienceQuery] = useState("");
  const [experienceStatusFilter, setExperienceStatusFilter] = useState("all");
  const [experienceActiveFilter, setExperienceActiveFilter] = useState("all");

  const [bookings, setBookings] = useState<AdminBookingsResponse | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPaidFilter, setBookingPaidFilter] = useState("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<AdminBookingDetailsResponse | null>(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
  const [bookingDetailsError, setBookingDetailsError] = useState("");

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

  const [systemHealth, setSystemHealth] = useState<AdminSystemHealthResponse | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState("");

  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "overview" | "users" | "experiences" | "bookings" | "reports" | "payments" | "audit" | "messages" | "system"
  >("overview");
  const [globalSearch, setGlobalSearch] = useState("");
  const [recentAdminActions, setRecentAdminActions] = useState<AdminAuditLogItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/admin");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (authLoading) return;
    if (token && user && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [authLoading, token, user, router]);

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
        params.set("limit", "12");
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

  const loadBookingDetails = useCallback(async (id: string) => {
    setSelectedBookingId(id);
    setBookingDetailsLoading(true);
    setBookingDetailsError("");
    try {
      const data = await apiGet<AdminBookingDetailsResponse>(`/admin/bookings/${id}`);
      setBookingDetails(data || null);
    } catch (err) {
      setBookingDetailsError((err as Error)?.message || "Nu am putut încărca detaliile booking-ului.");
    } finally {
      setBookingDetailsLoading(false);
    }
  }, []);

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

  const loadSystemHealth = useCallback(async () => {
    setSystemLoading(true);
    setSystemError("");
    try {
      const data = await apiGet<AdminSystemHealthResponse>("/admin/system/health");
      setSystemHealth(data || null);
    } catch (err) {
      setSystemError((err as Error)?.message || "Nu am putut încărca System health.");
    } finally {
      setSystemLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadUsers(users?.page || 1),
      loadExperiences(experiences?.page || 1),
      loadBookings(bookings?.page || 1),
      loadReports(reports?.page || 1),
      loadPaymentsHealth(),
      loadAuditLogs(auditLogs?.page || 1),
      loadSystemHealth(),
      loadRecentAdminActions(),
    ]);
  }, [loadDashboard, loadUsers, loadExperiences, loadBookings, loadReports, loadPaymentsHealth, loadAuditLogs, loadSystemHealth, loadRecentAdminActions, users?.page, experiences?.page, bookings?.page, reports?.page, auditLogs?.page]);

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

  const getCriticalReason = useCallback((title: string) => {
    if (typeof window === "undefined") return null;
    const confirmed = window.confirm(`${title}\n\nConfirmi acțiunea?`);
    if (!confirmed) return null;
    const reason = window.prompt("Motiv (obligatoriu):", "");
    if (!reason || !reason.trim()) {
      setActionError("Motivul este obligatoriu pentru această acțiune.");
      return null;
    }
    return reason.trim();
  }, []);

  const patchUser = useCallback(
    async (id: string, payload: Record<string, unknown>, info = "Utilizator actualizat") => {
      await apiPatch(`/admin/users/${id}`, payload);
      setActionInfo(info);
      await Promise.all([
        loadUsers(users?.page || 1),
        loadDashboard(),
        ...(selectedUserId === id ? [loadUserDetails(id)] : []),
        loadRecentAdminActions(),
      ]);
    },
    [loadUsers, loadDashboard, loadUserDetails, loadRecentAdminActions, users?.page, selectedUserId]
  );

  const patchExperience = useCallback(
    async (id: string, payload: Record<string, unknown>, info = "Experiență actualizată") => {
      await apiPatch(`/admin/experiences/${id}`, payload);
      setActionInfo(info);
      await Promise.all([loadExperiences(experiences?.page || 1), loadDashboard()]);
    },
    [loadExperiences, loadDashboard, experiences?.page]
  );

  const postBookingAction = useCallback(
    async (id: string, action: "cancel" | "refund", reason: string, info: string) => {
      await apiPost(`/admin/bookings/${id}/${action}`, { reason });
      setActionInfo(info);
      await Promise.all([loadBookings(bookings?.page || 1), loadDashboard(), loadRecentAdminActions()]);
      if (selectedBookingId === id) {
        await loadBookingDetails(id);
      }
    },
    [loadBookings, loadDashboard, loadRecentAdminActions, bookings?.page, selectedBookingId, loadBookingDetails]
  );

  const postReportAction = useCallback(
    async (id: string, action: string, reason?: string) => {
      await apiPost(`/admin/reports/${id}/action`, {
        action,
        ...(reason ? { reason } : {}),
      });
      setActionInfo(`Report actualizat (${action})`);
      await Promise.all([loadReports(reports?.page || 1), loadDashboard(), loadRecentAdminActions()]);
    },
    [loadReports, reports?.page, loadDashboard, loadRecentAdminActions]
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

  const sidebarItems: Array<{
    key: "overview" | "users" | "experiences" | "bookings" | "reports" | "payments" | "audit" | "messages" | "system";
    label: string;
    hint?: string;
  }> = [
    { key: "overview", label: "Overview", hint: "Control room" },
    { key: "users", label: "Users", hint: "Support & roles" },
    { key: "experiences", label: "Experiences", hint: "Quality & safety" },
    { key: "bookings", label: "Bookings", hint: "Ops & refunds" },
    { key: "reports", label: "Reports / Moderation", hint: "Inbox & safety" },
    { key: "payments", label: "Payments & Refunds", hint: "Health & issues" },
    { key: "audit", label: "Audit Log", hint: "Trace admin actions" },
    { key: "messages", label: "Messages", hint: "Coming next" },
    { key: "system", label: "System", hint: "Health & config" },
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
              <div className={styles.quickActionsRow}>
                <button type="button" className="button secondary" onClick={() => setActiveSection("users")}>
                  Users
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
                <button type="button" className="button secondary" onClick={() => setActiveSection("system")}>
                  System
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => void refreshAll()}
                  disabled={dashboardLoading || usersLoading || experiencesLoading || bookingsLoading || reportsLoading || paymentsLoading || auditLoading || systemLoading || recentLoading}
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
          <h2 className={styles.sectionTitle}>Utilizatori</h2>
          <span className="muted">
            {users ? `${numberFmt(users.total)} rezultate` : "—"}
          </span>
        </div>

        <form className={`${styles.card} ${styles.filtersCard}`} onSubmit={onUsersSubmit}>
          <div className={styles.filtersGrid}>
            <input
              className="input"
              placeholder="Caută după nume sau email"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
            <select className={styles.select} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
              <option value="all">Toate rolurile</option>
              <option value="EXPLORER">EXPLORER</option>
              <option value="HOST">HOST</option>
              <option value="BOTH">BOTH</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select className={styles.select} value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
              <option value="all">Toate statusurile</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div className={styles.filtersActions}>
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
            {(users?.items || []).map((item) => (
              <AdminUserRow
                key={item.id}
                item={item}
                selected={selectedUserId === item.id}
                busy={!!pendingKey?.startsWith(`user:${item.id}:`)}
                onOpenDetails={loadUserDetails}
                onSaveRole={(id, role) =>
                  runAction(`user:${id}:role`, () => patchUser(id, { role }, `Rol actualizat (${role})`))
                }
                onToggleBlocked={(id, nextValue) =>
                  runAction(`user:${id}:block`, async () => {
                    const reason = getCriticalReason(nextValue ? "Blocare utilizator" : "Deblocare utilizator");
                    if (!reason) return;
                    await patchUser(id, { isBlocked: nextValue, reason }, nextValue ? "Utilizator blocat" : "Utilizator deblocat");
                  })
                }
                onToggleBanned={(id, nextValue) =>
                  runAction(`user:${id}:ban`, async () => {
                    const reason = getCriticalReason(nextValue ? "Ban utilizator" : "Unban utilizator");
                    if (!reason) return;
                    await patchUser(id, { isBanned: nextValue, reason }, nextValue ? "Utilizator banat" : "Ban scos");
                  })
                }
                onInvalidateSessions={(id) =>
                  runAction(`user:${id}:invalidate`, () => patchUser(id, { invalidateSessions: true }, "Sesiuni invalidate"))
                }
              />
            ))}
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

            {!selectedUserId ? <div className="muted">Selectează un utilizator din listă.</div> : null}
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
            <button className="button secondary" type="button" onClick={() => { setExperienceQuery(""); setExperienceStatusFilter("all"); setExperienceActiveFilter("all"); void loadExperiences(1); }}>
              Reset
            </button>
            <button className="button" type="submit" disabled={experiencesLoading}>
              {experiencesLoading ? "Se caută..." : "Caută"}
            </button>
          </div>
        </form>

        {experiencesError ? <div className={`${styles.card} ${styles.errorCard}`}>{experiencesError}</div> : null}
        <div className={styles.listStack}>
          {(experiences?.items || []).map((item) => (
            <AdminExperienceRow
              key={item.id}
              item={item}
              busy={pendingKey?.startsWith(`exp:${item.id}:`)}
              onToggleActive={(id, nextValue) =>
                runAction(
                  `exp:${id}:active`,
                  async () => {
                    let reason: string | null = null;
                    if (!nextValue) {
                      reason = getCriticalReason("Dezactivare experiență");
                      if (!reason) return;
                    }
                    await patchExperience(
                      id,
                      { isActive: nextValue, ...(reason ? { reason } : {}) },
                      nextValue ? "Experiență activată" : "Experiență dezactivată"
                    );
                  }
                )
              }
              onSaveStatus={(id, status) =>
                runAction(`exp:${id}:status`, async () => {
                  const critical = ["DISABLED", "CANCELLED", "cancelled"].includes(status);
                  const reason = critical ? getCriticalReason(`Schimbare status experiență la ${status}`) : null;
                  if (critical && !reason) return;
                  await patchExperience(id, { status, ...(reason ? { reason } : {}) }, `Status salvat (${status})`);
                })
              }
            />
          ))}
          {!experiencesLoading && (experiences?.items || []).length === 0 ? (
            <div className={`${styles.card} ${styles.emptyCard}`}>Nu există experiențe pentru filtrele selectate.</div>
          ) : null}
        </div>
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

        <div className={styles.splitGrid}>
          <div className={styles.listStack}>
            {(bookings?.items || []).map((item) => (
              <AdminBookingRow
                key={item.id}
                item={item}
                selected={selectedBookingId === item.id}
                busy={pendingKey?.startsWith(`booking:${item.id}:`)}
                onOpenDetails={loadBookingDetails}
                onCancel={(id) =>
                  runAction(`booking:${id}:cancel`, async () => {
                    const reason = getCriticalReason("Anulare booking (admin)");
                    if (!reason) return;
                    await postBookingAction(id, "cancel", reason, "Booking anulat (admin)");
                  })
                }
                onRefund={(id) =>
                  runAction(`booking:${id}:refund`, async () => {
                    const reason = getCriticalReason("Refund booking (admin)");
                    if (!reason) return;
                    await postBookingAction(id, "refund", reason, "Refund declanșat (admin)");
                  })
                }
              />
            ))}
            {!bookingsLoading && (bookings?.items || []).length === 0 ? (
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

          <div className={`${styles.card} ${styles.detailsCard}`}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.detailsTitle}>Booking details</h3>
              {selectedBookingId ? <span className="muted">#{selectedBookingId.slice(-8)}</span> : null}
            </div>

            {!selectedBookingId ? <div className="muted">Selectează un booking pentru detalii.</div> : null}
            {bookingDetailsLoading ? <div className="muted">Se încarcă detaliile...</div> : null}
            {!bookingDetailsLoading && bookingDetailsError ? (
              <div className={`${styles.banner} ${styles.bannerError}`}>{bookingDetailsError}</div>
            ) : null}
            {!bookingDetailsLoading && !bookingDetailsError && bookingDetails?.booking ? (
              <>
                <div className={styles.detailGrid}>
                  <div><strong>Status</strong><span>{bookingDetails.booking.status || "—"}</span></div>
                  <div><strong>Attendance</strong><span>{bookingDetails.booking.attendanceStatus || "—"}</span></div>
                  <div><strong>Cantitate</strong><span>{numberFmt(bookingDetails.booking.quantity)}</span></div>
                  <div><strong>Sumă</strong><span>{formatMoney(bookingDetails.booking.amount, bookingDetails.booking.currency)}</span></div>
                  <div><strong>Host</strong><span>{bookingDetails.booking.host?.email || bookingDetails.booking.host?.name || "—"}</span></div>
                  <div><strong>Explorer</strong><span>{bookingDetails.booking.explorer?.email || bookingDetails.booking.explorer?.name || "—"}</span></div>
                  <div><strong>Experiență</strong><span>{bookingDetails.booking.experience?.title || "—"}</span></div>
                  <div><strong>Creat</strong><span>{formatDate(bookingDetails.booking.createdAt)}</span></div>
                  <div><strong>Anulat</strong><span>{formatDate(bookingDetails.booking.cancelledAt)}</span></div>
                  <div><strong>Refundat</strong><span>{formatDate(bookingDetails.booking.refundedAt)}</span></div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Payments ({numberFmt((bookingDetails.payments || []).length)})</div>
                  {(bookingDetails.payments || []).length === 0 ? (
                    <div className="muted">Fără payments legate.</div>
                  ) : (
                    <div className={styles.stackSm}>
                      {(bookingDetails.payments || []).slice(0, 5).map((payment, idx) => {
                        const row = payment as Record<string, unknown>;
                        return (
                          <div key={`${String(row._id || idx)}`} className={styles.miniItem}>
                            <div>
                              <strong>{String(row.status || "—")}</strong> · {String(row.paymentType || "—")}
                            </div>
                            <div className="muted">
                              {formatMoney(Number(row.totalAmount || row.amount || 0), String(row.currency || "RON"))}
                              {row.stripePaymentIntentId ? " · PI" : ""} {row.stripeSessionId ? " · Session" : ""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Reports ({numberFmt((bookingDetails.reports || []).length)})</div>
                  {(bookingDetails.reports || []).length === 0 ? (
                    <div className="muted">Fără rapoarte pe booking.</div>
                  ) : (
                    <div className={styles.stackSm}>
                      {(bookingDetails.reports || []).slice(0, 5).map((report, idx) => {
                        const row = report as Record<string, unknown>;
                        return (
                          <div key={`${String(row._id || idx)}`} className={styles.miniItem}>
                            <div>
                              <strong>{String(row.status || "—")}</strong> · {String(row.type || "report")}
                            </div>
                            <div className="muted">
                              {String(row.reason || row.comment || "fără motiv")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Mesaje</div>
                  <div className="muted">{numberFmt(bookingDetails.messagesCount)} mesaje în conversație</div>
                </div>
              </>
            ) : null}
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
                onAction={(id, action) =>
                  runAction(`report:${id}:${action}`, async () => {
                    const needsReason = ["PAUSE_EXPERIENCE", "SUSPEND_USER"].includes(action) || action === "MARK_IGNORED";
                    const reason = needsReason ? getCriticalReason(`Report action: ${action}`) : undefined;
                    if (needsReason && !reason) return;
                    await postReportAction(id, action, reason || undefined);
                  })
                }
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
                  </div>
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.panelTitle}>Quick moderation actions</div>
                  <div className={styles.buttonRow}>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:MARK_INVESTIGATING`, () => postReportAction(selectedReport.id, "MARK_INVESTIGATING"))
                      }
                    >
                      Investigating
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:MARK_HANDLED`, () => postReportAction(selectedReport.id, "MARK_HANDLED"))
                      }
                    >
                      Mark handled
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:PAUSE_EXPERIENCE`, async () => {
                          const reason = getCriticalReason("Pause experience from report");
                          if (!reason) return;
                          await postReportAction(selectedReport.id, "PAUSE_EXPERIENCE", reason);
                        })
                      }
                    >
                      Pause experience
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={!!pendingKey?.startsWith(`report:${selectedReport.id}:`)}
                      onClick={() =>
                        void runAction(`report:${selectedReport.id}:SUSPEND_USER`, async () => {
                          const reason = getCriticalReason("Suspend user from report");
                          if (!reason) return;
                          await postReportAction(selectedReport.id, "SUSPEND_USER", reason);
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
                            setActiveSection("users");
                            setUserQuery(host.email || host.id);
                            void loadUsers(1);
                          }}
                        >
                          Vezi host în Users
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
                            setActiveSection("users");
                            setUserQuery(row.host?.email || row.host?.id || "");
                            void loadUsers(1);
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

        {["messages"].includes(activeSection) ? (
          <section className={styles.sectionBlock}>
            <div className={`${styles.card} ${styles.placeholderCard}`}>
              <h2 className={styles.sectionTitle} style={{ marginTop: 0 }}>
                {sidebarItems.find((item) => item.key === activeSection)?.label}
              </h2>
              <p className="muted">
                Secțiunea este pregătită în layout-ul nou. Următorul pas: endpoint-uri + workflows dedicate.
              </p>
              <ul className={styles.inboxList}>
                <li>Filters + DataTable + details drawer</li>
                <li>Acțiuni cu confirm + reason</li>
                <li>Audit log pe toate mutațiile</li>
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

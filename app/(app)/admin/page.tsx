"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api";
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
  actorEmail?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  createdAt?: string;
};

const numberFmt = (value?: number) => new Intl.NumberFormat("ro-RO").format(Number(value || 0));

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
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
  busy,
  onSaveRole,
  onToggleBlocked,
  onToggleBanned,
  onInvalidateSessions,
}: {
  item: AdminUser;
  busy?: boolean;
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
    <div className={`${styles.card} ${styles.rowCard}`}>
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

  const [experiences, setExperiences] = useState<AdminExperiencesResponse | null>(null);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experiencesError, setExperiencesError] = useState("");
  const [experienceQuery, setExperienceQuery] = useState("");
  const [experienceStatusFilter, setExperienceStatusFilter] = useState("all");
  const [experienceActiveFilter, setExperienceActiveFilter] = useState("all");

  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "overview" | "users" | "experiences" | "bookings" | "reports" | "payments" | "messages" | "system"
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

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadUsers(users?.page || 1),
      loadExperiences(experiences?.page || 1),
      loadRecentAdminActions(),
    ]);
  }, [loadDashboard, loadUsers, loadExperiences, loadRecentAdminActions, users?.page, experiences?.page]);

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
      await Promise.all([loadUsers(users?.page || 1), loadDashboard()]);
    },
    [loadUsers, loadDashboard, users?.page]
  );

  const patchExperience = useCallback(
    async (id: string, payload: Record<string, unknown>, info = "Experiență actualizată") => {
      await apiPatch(`/admin/experiences/${id}`, payload);
      setActionInfo(info);
      await Promise.all([loadExperiences(experiences?.page || 1), loadDashboard()]);
    },
    [loadExperiences, loadDashboard, experiences?.page]
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
      setExperienceQuery(q);
      setActiveSection("experiences");
      void loadExperiences(1);
    },
    [globalSearch, loadExperiences, loadUsers]
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

  if (authLoading || (!token && !dashboard && !users && !experiences)) {
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

  const sidebarItems: Array<{
    key: "overview" | "users" | "experiences" | "bookings" | "reports" | "payments" | "messages" | "system";
    label: string;
    hint?: string;
  }> = [
    { key: "overview", label: "Overview", hint: "Control room" },
    { key: "users", label: "Users", hint: "Support & roles" },
    { key: "experiences", label: "Experiences", hint: "Quality & safety" },
    { key: "bookings", label: "Bookings", hint: "Coming next" },
    { key: "reports", label: "Reports / Moderation", hint: "Coming next" },
    { key: "payments", label: "Payments & Refunds", hint: "Coming next" },
    { key: "messages", label: "Messages", hint: "Coming next" },
    { key: "system", label: "System", hint: "Coming next" },
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
                <button
                  type="button"
                  className="button"
                  onClick={() => void refreshAll()}
                  disabled={dashboardLoading || usersLoading || experiencesLoading || recentLoading}
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
        <div className={styles.listStack}>
          {(users?.items || []).map((item) => (
            <AdminUserRow
              key={item.id}
              item={item}
              busy={pendingKey?.startsWith(`user:${item.id}:`)}
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
        </div>
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

        {["bookings", "reports", "payments", "messages", "system"].includes(activeSection) ? (
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

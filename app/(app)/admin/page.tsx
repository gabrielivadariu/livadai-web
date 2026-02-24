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

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/admin");
    }
  }, [authLoading, token, router]);

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
    await Promise.all([loadDashboard(), loadUsers(users?.page || 1), loadExperiences(experiences?.page || 1)]);
  }, [loadDashboard, loadUsers, loadExperiences, users?.page, experiences?.page]);

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

  if (!isAdmin) {
    return (
      <div className={`${styles.card} ${styles.unauthorized}`}>
        <h1>Admin</h1>
        <p>Nu ai acces la acest panou.</p>
      </div>
    );
  }

  const onUsersSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadUsers(1);
  };

  const onExperiencesSubmit = (e: FormEvent) => {
    e.preventDefault();
    void loadExperiences(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Control</h1>
          <p className={styles.subtitle}>
            Dashboard intern LIVADAI pentru utilizatori, experiențe și monitorizare operațională.
          </p>
          {dashboard?.generatedAt ? (
            <p className={styles.generatedAt}>Actualizat: {formatDate(dashboard.generatedAt)}</p>
          ) : null}
        </div>
        <button className="button" type="button" onClick={() => void refreshAll()} disabled={dashboardLoading || usersLoading || experiencesLoading}>
          Reîmprospătează
        </button>
      </div>

      {actionError ? <div className={`${styles.banner} ${styles.bannerError}`}>{actionError}</div> : null}
      {actionInfo ? <div className={`${styles.banner} ${styles.bannerInfo}`}>{actionInfo}</div> : null}

      <section>
        <div className={styles.sectionTitleRow}>
          <h2 className={styles.sectionTitle}>Dashboard</h2>
          {dashboardLoading ? <span className="muted">Se încarcă...</span> : null}
        </div>
        {dashboardError ? <div className={`${styles.card} ${styles.errorCard}`}>{dashboardError}</div> : null}
        <div className={styles.statsGrid}>
          {dashboardCards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
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
                runAction(`user:${id}:block`, () => patchUser(id, { isBlocked: nextValue }, nextValue ? "Utilizator blocat" : "Utilizator deblocat"))
              }
              onToggleBanned={(id, nextValue) =>
                runAction(`user:${id}:ban`, () => patchUser(id, { isBanned: nextValue }, nextValue ? "Utilizator banat" : "Ban scos"))
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
      </section>

      <section className={styles.sectionBlock}>
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
                  () => patchExperience(id, { isActive: nextValue }, nextValue ? "Experiență activată" : "Experiență dezactivată")
                )
              }
              onSaveStatus={(id, status) =>
                runAction(`exp:${id}:status`, () => patchExperience(id, { status }, `Status salvat (${status})`))
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
      </section>
    </div>
  );
}

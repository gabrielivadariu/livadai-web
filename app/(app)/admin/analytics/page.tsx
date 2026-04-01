"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import styles from "./analytics.module.css";

const ADMIN_ROLES = new Set(["OWNER_ADMIN", "ADMIN", "ADMIN_SUPPORT", "ADMIN_RISK", "ADMIN_FINANCE", "ADMIN_VIEWER"]);

type DateRangeKey = "today" | "yesterday" | "last7d" | "last30d" | "custom";

type OverviewMetrics = {
  visitorsToday?: number;
  visitorsLast7Days?: number;
  visitorsLast30Days?: number;
  uniqueVisitors?: number;
  totalSessions?: number;
  averageSessionDurationMs?: number;
  bounceRate?: number;
  exitRate?: number;
  pageViews?: number;
  newUsers?: number;
  returningUsers?: number;
  usersRegistered?: number;
  hostsRegistered?: number;
  experiencesPublished?: number;
  bookingsCreated?: number;
  paidBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  gmvMinor?: number;
  platformFeeRevenueEstimateMinor?: number;
};

type TrafficSourceRow = {
  source?: string;
  medium?: string;
  campaign?: string;
  channelGroup?: string;
  sessions?: number;
};

type SearchKeywordRow = {
  keyword?: string;
  count?: number;
};

type FilterRow = {
  filter?: string;
  count?: number;
};

type LocationRow = {
  location?: string;
  count?: number;
};

type CategoryRow = {
  category?: string;
  count?: number;
};

type FunnelRow = {
  key: string;
  label: string;
  sessions: number;
  conversionRate: number;
  dropOff: number;
};

type ExperienceRow = {
  experienceId: string;
  title: string;
  hostId?: string;
  hostName?: string;
  city?: string;
  country?: string;
  views?: number;
  impressions?: number;
  clickThroughRate?: number;
  bookings?: number;
  paidBookings?: number;
  conversionRate?: number;
  revenueMinor?: number;
  platformFeeMinor?: number;
  completionRate?: number;
  cancellationRate?: number;
  favoriteRate?: number;
  shareRate?: number;
};

type HostRow = {
  hostId: string;
  hostName: string;
  totalExperiences?: number;
  totalViews?: number;
  totalBookings?: number;
  conversionRate?: number;
  revenueMinor?: number;
  responseRate?: number | null;
  cancellationRate?: number;
  topPerformingExperiences?: Array<{
    experienceId: string;
    title: string;
    revenueMinor?: number;
    bookings?: number;
  }>;
};

type TopPageRow = {
  path: string;
  views?: number;
};

type ExitPointRow = {
  path: string;
  exits?: number;
};

type CtaClickRow = {
  ctaName: string;
  clicks?: number;
};

type NavigationPathRow = {
  fromPath: string;
  toPath: string;
  count?: number;
};

type ScrollDepthRow = {
  path: string;
  averageDepth?: number;
  maxDepth?: number;
  events?: number;
};

type TimeOnPageRow = {
  path: string;
  averageDurationMs?: number;
  exits?: number;
};

type AnalyticsDashboard = {
  generatedAt?: string;
  range?: {
    key?: string;
    label?: string;
    start?: string;
    endExclusive?: string;
  };
  overview?: OverviewMetrics;
  traffic?: {
    sources?: TrafficSourceRow[];
    topLandingPages?: Array<{ path: string; views?: number }>;
    devices?: Array<{ deviceType: string; sessions?: number }>;
    browsers?: Array<{ browser: string; sessions?: number }>;
    operatingSystems?: Array<{ os: string; sessions?: number }>;
    locations?: Array<{ country?: string; city?: string; sessions?: number }>;
  };
  searchInsights?: {
    topKeywords?: SearchKeywordRow[];
    noResults?: SearchKeywordRow[];
    topFilters?: FilterRow[];
    topLocations?: LocationRow[];
    topCategories?: CategoryRow[];
    conversion?: {
      searchSessions?: number;
      searchToResultsRate?: number;
      searchToExperienceRate?: number;
      searchToBookingRate?: number;
      searchToPaymentRate?: number;
    };
  };
  funnel?: FunnelRow[];
  experiences?: {
    topPerformers?: ExperienceRow[];
  };
  hosts?: {
    topPerformers?: HostRow[];
  };
  behavior?: {
    topPages?: TopPageRow[];
    exitPoints?: ExitPointRow[];
    ctaClicks?: CtaClickRow[];
    navigationPaths?: NavigationPathRow[];
    scrollDepth?: ScrollDepthRow[];
    timeOnPage?: TimeOnPageRow[];
  };
};

const numberFmt = new Intl.NumberFormat("en-US");
const currencyFmt = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
  maximumFractionDigits: 0,
});

const toMinorCurrency = (value?: number) => currencyFmt.format((Number(value || 0) || 0) / 100);

const formatPercent = (value?: number) => `${Number(value || 0).toFixed(1)}%`;

const formatDuration = (value?: number) => {
  const totalMs = Number(value || 0);
  if (!totalMs) return "0s";
  const totalSeconds = Math.round(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const csvEscape = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const csvFromRows = (rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce((acc, row) => {
      Object.keys(row).forEach((key) => acc.add(key));
      return acc;
    }, new Set<string>())
  );
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
};

const downloadCsv = (filename: string, csv: string) => {
  if (typeof window === "undefined" || !csv) return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
};

const isAdminRole = (role?: string | null) => ADMIN_ROLES.has(String(role || "").trim().toUpperCase());

const MetricCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className={styles.metricCard}>
    <span className={styles.metricLabel}>{label}</span>
    <strong className={styles.metricValue}>{value}</strong>
    {hint ? <span className={styles.metricHint}>{hint}</span> : null}
  </div>
);

const maxBy = (values: number[]) => Math.max(...values, 1);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const [range, setRange] = useState<DateRangeKey>("last7d");
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEn = lang === "en";
  const tx = useCallback((ro: string, en: string) => (isEn ? en : ro), [isEn]);

  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/admin/analytics");
      return;
    }
    if (user && !isAdmin) {
      router.replace("/");
    }
  }, [authLoading, isAdmin, router, token, user]);

  const loadDashboard = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("range", range);
      if (range === "custom") {
        params.set("from", from);
        params.set("to", to);
      }
      const next = await apiGet<AnalyticsDashboard>(`/admin/analytics/dashboard?${params.toString()}`);
      setData(next || null);
    } catch (err) {
      setError((err as Error).message || tx("Nu am putut încărca analytics.", "Failed to load analytics."));
    } finally {
      setLoading(false);
    }
  }, [from, isAdmin, range, to, token, tx]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const topTrafficMax = useMemo(
    () => maxBy((data?.traffic?.sources || []).map((row) => Number(row.sessions || 0))),
    [data?.traffic?.sources]
  );
  const topSearchMax = useMemo(
    () => maxBy((data?.searchInsights?.topKeywords || []).map((row) => Number(row.count || 0))),
    [data?.searchInsights?.topKeywords]
  );
  const funnelMax = useMemo(
    () => maxBy((data?.funnel || []).map((row) => Number(row.sessions || 0))),
    [data?.funnel]
  );
  const topExperienceRevenueMax = useMemo(
    () => maxBy((data?.experiences?.topPerformers || []).map((row) => Number(row.revenueMinor || 0))),
    [data?.experiences?.topPerformers]
  );
  const topHostRevenueMax = useMemo(
    () => maxBy((data?.hosts?.topPerformers || []).map((row) => Number(row.revenueMinor || 0))),
    [data?.hosts?.topPerformers]
  );

  const exportTraffic = () =>
    downloadCsv(
      `livadai-analytics-traffic-${new Date().toISOString().slice(0, 10)}.csv`,
      csvFromRows(
        (data?.traffic?.sources || []).map((row) => ({
          source: row.source || "direct",
          medium: row.medium || "none",
          campaign: row.campaign || "",
          channelGroup: row.channelGroup || "",
          sessions: row.sessions || 0,
        }))
      )
    );

  const exportSearch = () =>
    downloadCsv(
      `livadai-analytics-search-${new Date().toISOString().slice(0, 10)}.csv`,
      csvFromRows(
        (data?.searchInsights?.topKeywords || []).map((row) => ({
          keyword: row.keyword || "",
          searches: row.count || 0,
        }))
      )
    );

  const exportExperiences = () =>
    downloadCsv(
      `livadai-analytics-experiences-${new Date().toISOString().slice(0, 10)}.csv`,
      csvFromRows(
        (data?.experiences?.topPerformers || []).map((row) => ({
          title: row.title,
          hostName: row.hostName || "",
          views: row.views || 0,
          bookings: row.bookings || 0,
          conversionRate: row.conversionRate || 0,
          revenueMinor: row.revenueMinor || 0,
          shareRate: row.shareRate || 0,
          favoriteRate: row.favoriteRate || 0,
          cancellationRate: row.cancellationRate || 0,
        }))
      )
    );

  const exportHosts = () =>
    downloadCsv(
      `livadai-analytics-hosts-${new Date().toISOString().slice(0, 10)}.csv`,
      csvFromRows(
        (data?.hosts?.topPerformers || []).map((row) => ({
          hostName: row.hostName,
          totalExperiences: row.totalExperiences || 0,
          totalViews: row.totalViews || 0,
          totalBookings: row.totalBookings || 0,
          conversionRate: row.conversionRate || 0,
          revenueMinor: row.revenueMinor || 0,
          cancellationRate: row.cancellationRate || 0,
        }))
      )
    );
  const funnelLabel = useCallback(
    (row: FunnelRow) => {
      if (isEn) return row.label;
      const labels: Record<string, string> = {
        homepage_visit: "Vizită homepage",
        search_initiated: "Căutare pornită",
        search_results_viewed: "Rezultate căutare văzute",
        experience_page_viewed: "Pagină experiență văzută",
        booking_started: "Booking început",
        checkout_started: "Checkout început",
        payment_completed: "Plată finalizată",
        booking_confirmed: "Booking confirmat",
      };
      return labels[row.key] || row.label;
    },
    [isEn]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>LIVADAI Admin</div>
          <h1 className={styles.title}>{tx("Analytics și insight-uri de business", "Analytics & business insights")}</h1>
          <p className={styles.subtitle}>
            {tx("Vizibilitate orientată pe business pentru trafic, căutări, funnel, experiențe și gazde.", "Business-first visibility across traffic, search, funnel, experiences and hosts.")}
          </p>
          {data?.generatedAt ? (
            <div className={styles.generatedAt}>{tx("Generat la", "Generated at")} {new Date(data.generatedAt).toLocaleString(isEn ? "en-GB" : "ro-RO")}</div>
          ) : null}
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin" className="button secondary">
            {tx("Înapoi la admin", "Back to admin")}
          </Link>
          <button type="button" className="button" onClick={() => void loadDashboard()} disabled={loading}>
            {tx("Reîmprospătează", "Refresh")}
          </button>
        </div>
      </div>

      <section className={styles.filters}>
        <div className={styles.filterPills}>
          {[
            { key: "today", label: tx("Astăzi", "Today") },
            { key: "yesterday", label: tx("Ieri", "Yesterday") },
            { key: "last7d", label: tx("Ultimele 7 zile", "Last 7 days") },
            { key: "last30d", label: tx("Ultimele 30 zile", "Last 30 days") },
            { key: "custom", label: tx("Personalizat", "Custom") },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.filterPill} ${range === item.key ? styles.filterPillActive : ""}`}
              onClick={() => setRange(item.key as DateRangeKey)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {range === "custom" ? (
          <div className={styles.customRange}>
            <label className={styles.inputGroup}>
              <span>{tx("De la", "From")}</span>
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </label>
            <label className={styles.inputGroup}>
              <span>{tx("Până la", "To")}</span>
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </label>
          </div>
        ) : null}
        {data?.range?.label ? <div className={styles.rangeHint}>{data.range.label}</div> : null}
      </section>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {loading ? <div className={styles.loadingCard}>{tx("Se încarcă analytics...", "Loading analytics...")}</div> : null}

      <section className={styles.metricGrid}>
        <MetricCard label={tx("Vizitatori astăzi", "Visitors today")} value={numberFmt.format(Number(data?.overview?.visitorsToday || 0))} />
        <MetricCard label={tx("Vizitatori 7z", "Visitors 7d")} value={numberFmt.format(Number(data?.overview?.visitorsLast7Days || 0))} />
        <MetricCard label={tx("Vizitatori 30z", "Visitors 30d")} value={numberFmt.format(Number(data?.overview?.visitorsLast30Days || 0))} />
        <MetricCard label={tx("Vizitatori unici", "Unique visitors")} value={numberFmt.format(Number(data?.overview?.uniqueVisitors || 0))} />
        <MetricCard label={tx("Sesiuni", "Sessions")} value={numberFmt.format(Number(data?.overview?.totalSessions || 0))} />
        <MetricCard label={tx("Durată medie sesiune", "Avg. session")} value={formatDuration(data?.overview?.averageSessionDurationMs)} />
        <MetricCard label={tx("Rată bounce", "Bounce rate")} value={formatPercent(data?.overview?.bounceRate)} />
        <MetricCard label={tx("Rată exit", "Exit rate")} value={formatPercent(data?.overview?.exitRate)} />
        <MetricCard label={tx("Vizualizări pagină", "Page views")} value={numberFmt.format(Number(data?.overview?.pageViews || 0))} />
        <MetricCard
          label={tx("Noi vs reveniți", "New vs returning")}
          value={`${numberFmt.format(Number(data?.overview?.newUsers || 0))} / ${numberFmt.format(Number(data?.overview?.returningUsers || 0))}`}
          hint={tx("noi / reveniți", "new / returning")}
        />
        <MetricCard label={tx("Utilizatori înregistrați", "Users registered")} value={numberFmt.format(Number(data?.overview?.usersRegistered || 0))} />
        <MetricCard label={tx("Gazde înregistrate", "Hosts registered")} value={numberFmt.format(Number(data?.overview?.hostsRegistered || 0))} />
        <MetricCard label={tx("Experiențe publicate", "Experiences published")} value={numberFmt.format(Number(data?.overview?.experiencesPublished || 0))} />
        <MetricCard label={tx("Booking-uri create", "Bookings created")} value={numberFmt.format(Number(data?.overview?.bookingsCreated || 0))} />
        <MetricCard label={tx("Booking-uri plătite", "Paid bookings")} value={numberFmt.format(Number(data?.overview?.paidBookings || 0))} />
        <MetricCard label={tx("Booking-uri finalizate", "Completed bookings")} value={numberFmt.format(Number(data?.overview?.completedBookings || 0))} />
        <MetricCard label={tx("Booking-uri anulate", "Cancelled bookings")} value={numberFmt.format(Number(data?.overview?.cancelledBookings || 0))} />
        <MetricCard label="GMV" value={toMinorCurrency(data?.overview?.gmvMinor)} />
        <MetricCard label={tx("Estimare fee platformă", "Platform fee est.")} value={toMinorCurrency(data?.overview?.platformFeeRevenueEstimateMinor)} />
      </section>

      <div className={styles.sectionGrid}>
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>{tx("Surse de trafic", "Traffic sources")}</h2>
              <p>{tx("Source / medium / campaign și calitatea paginilor de intrare.", "Source / medium / campaign and landing page quality.")}</p>
            </div>
            <button type="button" className="button secondary" onClick={exportTraffic}>
              {tx("Export CSV", "Export CSV")}
            </button>
          </div>
          <div className={styles.barList}>
            {(data?.traffic?.sources || []).map((row) => (
              <div key={`${row.source}-${row.medium}-${row.campaign}`} className={styles.barRow}>
                <div className={styles.barMeta}>
                  <strong>{row.source || tx("direct", "direct")}</strong>
                  <span>
                    {row.medium || tx("fără", "none")} · {row.campaign || tx("(nesetat)", "(not set)")} · {row.channelGroup || tx("direct", "direct")}
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{ width: `${(Number(row.sessions || 0) / topTrafficMax) * 100}%` }}
                  />
                </div>
                <div className={styles.barValue}>{numberFmt.format(Number(row.sessions || 0))}</div>
              </div>
            ))}
          </div>
          <div className={styles.miniGrid}>
            <div className={styles.subCard}>
              <h3>{tx("Top landing pages", "Top landing pages")}</h3>
              {(data?.traffic?.topLandingPages || []).map((row) => (
                <div key={row.path} className={styles.inlineStat}>
                  <span>{row.path}</span>
                  <strong>{numberFmt.format(Number(row.views || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={styles.subCard}>
              <h3>{tx("Dispozitive", "Devices")}</h3>
              {(data?.traffic?.devices || []).map((row) => (
                <div key={row.deviceType} className={styles.inlineStat}>
                  <span>{row.deviceType}</span>
                  <strong>{numberFmt.format(Number(row.sessions || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={styles.subCard}>
              <h3>{tx("Browsere", "Browsers")}</h3>
              {(data?.traffic?.browsers || []).map((row) => (
                <div key={row.browser} className={styles.inlineStat}>
                  <span>{row.browser}</span>
                  <strong>{numberFmt.format(Number(row.sessions || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={styles.subCard}>
              <h3>{tx("Locații", "Locations")}</h3>
              {(data?.traffic?.locations || []).map((row) => (
                <div key={`${row.country}-${row.city}`} className={styles.inlineStat}>
                  <span>
                    {row.country || tx("Necunoscut", "Unknown")} / {row.city || tx("Necunoscut", "Unknown")}
                  </span>
                  <strong>{numberFmt.format(Number(row.sessions || 0))}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>{tx("Insight-uri din căutare", "Search insights")}</h2>
              <p>{tx("Ce caută oamenii și cum convertește căutarea.", "What people search for and how search converts.")}</p>
            </div>
            <button type="button" className="button secondary" onClick={exportSearch}>
              {tx("Export CSV", "Export CSV")}
            </button>
          </div>
          <div className={styles.barList}>
            {(data?.searchInsights?.topKeywords || []).map((row) => (
              <div key={row.keyword} className={styles.barRow}>
                <div className={styles.barMeta}>
                  <strong>{row.keyword || tx("Căutare necunoscută", "Unknown query")}</strong>
                  <span>{tx("căutări", "searches")}</span>
                </div>
                <div className={styles.barTrack}>
                  <span
                    className={`${styles.barFill} ${styles.barFillWarm}`}
                    style={{ width: `${(Number(row.count || 0) / topSearchMax) * 100}%` }}
                  />
                </div>
                <div className={styles.barValue}>{numberFmt.format(Number(row.count || 0))}</div>
              </div>
            ))}
          </div>
          <div className={styles.miniGrid}>
            <div className={styles.subCard}>
              <h3>{tx("Căutări fără rezultate", "No-result searches")}</h3>
              {(data?.searchInsights?.noResults || []).map((row) => (
                <div key={row.keyword} className={styles.inlineStat}>
                  <span>{row.keyword || tx("Necunoscut", "Unknown")}</span>
                  <strong>{numberFmt.format(Number(row.count || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={styles.subCard}>
              <h3>{tx("Top filtre", "Top filters")}</h3>
              {(data?.searchInsights?.topFilters || []).map((row) => (
                <div key={row.filter} className={styles.inlineStat}>
                  <span>{row.filter || tx("Necunoscut", "Unknown")}</span>
                  <strong>{numberFmt.format(Number(row.count || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={styles.subCard}>
              <h3>{tx("Top locații", "Top locations")}</h3>
              {(data?.searchInsights?.topLocations || []).map((row) => (
                <div key={row.location} className={styles.inlineStat}>
                  <span>{row.location || tx("Necunoscut", "Unknown")}</span>
                  <strong>{numberFmt.format(Number(row.count || 0))}</strong>
                </div>
              ))}
            </div>
            <div className={styles.subCard}>
              <h3>{tx("Conversie din căutare", "Search conversion")}</h3>
              <div className={styles.inlineStat}>
                <span>{tx("Sesiuni de căutare", "Search sessions")}</span>
                <strong>{numberFmt.format(Number(data?.searchInsights?.conversion?.searchSessions || 0))}</strong>
              </div>
              <div className={styles.inlineStat}>
                <span>{tx("Spre rezultate", "To results")}</span>
                <strong>{formatPercent(data?.searchInsights?.conversion?.searchToResultsRate)}</strong>
              </div>
              <div className={styles.inlineStat}>
                <span>{tx("Spre experiență", "To experience")}</span>
                <strong>{formatPercent(data?.searchInsights?.conversion?.searchToExperienceRate)}</strong>
              </div>
              <div className={styles.inlineStat}>
                <span>{tx("Spre booking", "To booking")}</span>
                <strong>{formatPercent(data?.searchInsights?.conversion?.searchToBookingRate)}</strong>
              </div>
              <div className={styles.inlineStat}>
                <span>{tx("Spre plată", "To payment")}</span>
                <strong>{formatPercent(data?.searchInsights?.conversion?.searchToPaymentRate)}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>{tx("Urmărire funnel", "Funnel tracking")}</h2>
            <p>{tx("Traseul complet de la homepage până la booking confirmat.", "Full path from homepage to booking confirmation.")}</p>
          </div>
        </div>
        <div className={styles.funnelGrid}>
          {(data?.funnel || []).map((row) => (
            <div key={row.key} className={styles.funnelStep}>
              <div className={styles.funnelLabel}>{funnelLabel(row)}</div>
              <div className={styles.funnelTrack}>
                <span className={styles.funnelFill} style={{ width: `${(row.sessions / funnelMax) * 100}%` }} />
              </div>
              <div className={styles.funnelMeta}>
                <strong>{numberFmt.format(Number(row.sessions || 0))}</strong>
                <span>{formatPercent(row.conversionRate)}</span>
                <span>{tx("drop-off", "drop-off")} {numberFmt.format(Number(row.dropOff || 0))}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionGrid}>
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>{tx("Performanța experiențelor", "Experience performance")}</h2>
              <p>{tx("Vezi ce merită promovat mai mult și ce pierde bani.", "Find what deserves more promotion and what is leaking revenue.")}</p>
            </div>
            <button type="button" className="button secondary" onClick={exportExperiences}>
              {tx("Export CSV", "Export CSV")}
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tx("Experiență", "Experience")}</th>
                  <th>{tx("Vizualizări", "Views")}</th>
                  <th>{tx("Booking-uri", "Bookings")}</th>
                  <th>CTR</th>
                  <th>CVR</th>
                  <th>{tx("Venit", "Revenue")}</th>
                  <th>{tx("Finalizare", "Completion")}</th>
                  <th>{tx("Anulare", "Cancel")}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.experiences?.topPerformers || []).map((row) => (
                  <tr key={row.experienceId}>
                    <td>
                      <div className={styles.tableTitle}>{row.title}</div>
                      <div className={styles.tableMeta}>
                        {row.hostName || tx("Gazdă necunoscută", "Unknown host")}{row.city ? ` · ${row.city}` : ""}
                      </div>
                      <div className={styles.inlineBar}>
                        <span
                          className={styles.inlineBarFill}
                          style={{ width: `${(Number(row.revenueMinor || 0) / topExperienceRevenueMax) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td>{numberFmt.format(Number(row.views || 0))}</td>
                    <td>{numberFmt.format(Number(row.bookings || 0))}</td>
                    <td>{formatPercent(row.clickThroughRate)}</td>
                    <td>{formatPercent(row.conversionRate)}</td>
                    <td>{toMinorCurrency(row.revenueMinor)}</td>
                    <td>{formatPercent(row.completionRate)}</td>
                    <td>{formatPercent(row.cancellationRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>{tx("Performanța gazdelor", "Host performance")}</h2>
              <p>{tx("Vezi ce gazde convertesc, păstrează booking-uri și generează venit.", "See which hosts convert, retain bookings and generate revenue.")}</p>
            </div>
            <button type="button" className="button secondary" onClick={exportHosts}>
              {tx("Export CSV", "Export CSV")}
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tx("Gazdă", "Host")}</th>
                  <th>{tx("Experiențe", "Experiences")}</th>
                  <th>{tx("Vizualizări", "Views")}</th>
                  <th>{tx("Booking-uri", "Bookings")}</th>
                  <th>CVR</th>
                  <th>{tx("Venit", "Revenue")}</th>
                  <th>{tx("Anulare", "Cancel")}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.hosts?.topPerformers || []).map((row) => (
                  <tr key={row.hostId}>
                    <td>
                      <div className={styles.tableTitle}>{row.hostName}</div>
                      <div className={styles.tableMeta}>
                        {(row.topPerformingExperiences || []).map((exp) => exp.title).join(" · ") || tx("Nu există încă experiențe de top", "No top experiences yet")}
                      </div>
                      <div className={styles.inlineBar}>
                        <span
                          className={`${styles.inlineBarFill} ${styles.inlineBarFillWarm}`}
                          style={{ width: `${(Number(row.revenueMinor || 0) / topHostRevenueMax) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td>{numberFmt.format(Number(row.totalExperiences || 0))}</td>
                    <td>{numberFmt.format(Number(row.totalViews || 0))}</td>
                    <td>{numberFmt.format(Number(row.totalBookings || 0))}</td>
                    <td>{formatPercent(row.conversionRate)}</td>
                    <td>{toMinorCurrency(row.revenueMinor)}</td>
                    <td>{formatPercent(row.cancellationRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>{tx("Comportament utilizatori", "User behavior")}</h2>
            <p>{tx("Cele mai vizitate pagini, puncte de ieșire, clickuri pe CTA-uri și trasee de navigare.", "Most visited pages, exit points, important CTA clicks and navigation paths.")}</p>
          </div>
        </div>
        <div className={styles.behaviorGrid}>
          <div className={styles.subCard}>
            <h3>{tx("Cele mai vizitate pagini", "Most visited pages")}</h3>
            {(data?.behavior?.topPages || []).map((row) => (
              <div key={row.path} className={styles.inlineStat}>
                <span>{row.path}</span>
                <strong>{numberFmt.format(Number(row.views || 0))}</strong>
              </div>
            ))}
          </div>
          <div className={styles.subCard}>
            <h3>{tx("Puncte de ieșire", "Exit points")}</h3>
            {(data?.behavior?.exitPoints || []).map((row) => (
              <div key={row.path} className={styles.inlineStat}>
                <span>{row.path}</span>
                <strong>{numberFmt.format(Number(row.exits || 0))}</strong>
              </div>
            ))}
          </div>
          <div className={styles.subCard}>
            <h3>{tx("Clickuri pe CTA", "CTA clicks")}</h3>
            {(data?.behavior?.ctaClicks || []).map((row) => (
              <div key={row.ctaName} className={styles.inlineStat}>
                <span>{row.ctaName}</span>
                <strong>{numberFmt.format(Number(row.clicks || 0))}</strong>
              </div>
            ))}
          </div>
          <div className={styles.subCard}>
            <h3>{tx("Trasee de navigare", "Navigation paths")}</h3>
            {(data?.behavior?.navigationPaths || []).map((row) => (
              <div key={`${row.fromPath}-${row.toPath}`} className={styles.inlineStat}>
                <span>
                  {row.fromPath} → {row.toPath}
                </span>
                <strong>{numberFmt.format(Number(row.count || 0))}</strong>
              </div>
            ))}
          </div>
          <div className={styles.subCard}>
            <h3>{tx("Adâncime scroll", "Scroll depth")}</h3>
            {(data?.behavior?.scrollDepth || []).map((row) => (
              <div key={row.path} className={styles.inlineStat}>
                <span>{row.path}</span>
                <strong>{formatPercent(row.averageDepth)}</strong>
              </div>
            ))}
          </div>
          <div className={styles.subCard}>
            <h3>{tx("Timp în pagină", "Time on page")}</h3>
            {(data?.behavior?.timeOnPage || []).map((row) => (
              <div key={row.path} className={styles.inlineStat}>
                <span>{row.path}</span>
                <strong>{formatDuration(row.averageDurationMs)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

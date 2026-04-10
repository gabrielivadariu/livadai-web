"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import styles from "./email-marketing.module.css";

const ADMIN_ROLES = new Set(["OWNER_ADMIN", "ADMIN", "ADMIN_SUPPORT", "ADMIN_RISK", "ADMIN_FINANCE", "ADMIN_VIEWER"]);

type AdminCapability = "PANEL_READ" | "USERS_WRITE" | "EXPERIENCES_WRITE" | "BOOKINGS_WRITE" | "REPORTS_WRITE" | "OWNER_WRITE";

type AdminPermissionsResponse = {
  role?: string;
  capabilities?: AdminCapability[];
  can?: {
    ownerWrite?: boolean;
  };
};

type EmailMarketingHistoryItem = {
  id: string;
  kind: "TEST" | "SUBSCRIBER_SEND" | string;
  status: "QUEUED" | "SENDING" | "SENT" | "PARTIAL" | "FAILED" | string;
  requestedByEmail?: string;
  testEmail?: string;
  subject?: string;
  introText?: string;
  mainExperienceTitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  audienceCount?: number;
  sentCount?: number;
  failedCount?: number;
  transportMode?: string;
  lastError?: string;
  createdAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

type EmailMarketingHistoryResponse = {
  summary?: {
    activeSubscribers?: number;
    transportMode?: string;
    emailsEnabled?: boolean;
  };
  items?: EmailMarketingHistoryItem[];
};

type CampaignResponse = {
  message?: string;
  campaign?: EmailMarketingHistoryItem;
  audienceCount?: number;
};

type CampaignFormState = {
  subject: string;
  introText: string;
  mainExperienceTitle: string;
  mainExperienceText: string;
  secondaryExperience1Title: string;
  secondaryExperience1Text: string;
  secondaryExperience2Title: string;
  secondaryExperience2Text: string;
  ctaLabel: string;
  ctaUrl: string;
  testEmail: string;
};

const buildDefaultForm = (tx: (ro: string, en: string) => string): CampaignFormState => ({
  subject: tx("Weekendul ăsta merită trăit altfel", "This weekend deserves more than routine"),
  introText: tx(
    "Salut,\n\nDin când în când, îți trimitem doar ce merită: experiențe reale, oameni faini și locuri care rămân cu tine mult după ce ajungi acasă.",
    "Hi,\n\nFrom time to time, we only send what feels worth opening: real experiences, warm people, and places that stay with you long after you get home."
  ),
  mainExperienceTitle: tx("Tabăra oamenilor liberi", "The camp of free spirits"),
  mainExperienceText: tx(
    "Foc de tabără, natură, oameni mișto și un weekend care chiar îți schimbă ritmul. Un tip de ieșire care te scoate curat din rutină.",
    "Campfire nights, nature, good people, and a weekend that genuinely resets your rhythm. The kind of outing that pulls you cleanly out of routine."
  ),
  secondaryExperience1Title: tx("Atelier de ceramică tradițională", "Traditional pottery workshop"),
  secondaryExperience1Text: tx(
    "Lut, răbdare și bucuria de a face ceva real cu mâinile tale, într-un loc calm și cald.",
    "Clay, patience, and the joy of making something real with your own hands in a warm, grounded place."
  ),
  secondaryExperience2Title: tx("Tur culinar local autentic", "Authentic local food tour"),
  secondaryExperience2Text: tx(
    "Gusturi locale, povești bune și gazde care transformă o simplă masă într-o experiență de ținut minte.",
    "Local flavors, good stories, and hosts who turn a simple meal into something memorable."
  ),
  ctaLabel: tx("Descoperă toate experiențele", "Discover all experiences"),
  ctaUrl: "https://www.livadai.com/experiences",
  testEmail: "",
});

const numberFmt = (value?: number) => new Intl.NumberFormat("ro-RO").format(Number(value || 0));
const isAdminRole = (role?: string | null) => ADMIN_ROLES.has(String(role || "").trim().toUpperCase());

const formatDate = (value?: string | null, lang: "ro" | "en" = "ro") => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const historyKindLabel = (kind?: string, tx?: (ro: string, en: string) => string) => {
  switch (String(kind || "").toUpperCase()) {
    case "TEST":
      return tx ? tx("Test", "Test") : "Test";
    case "SUBSCRIBER_SEND":
      return tx ? tx("Abonați", "Subscribers") : "Subscribers";
    default:
      return kind || "—";
  }
};

const transportLabel = (mode?: string, tx?: (ro: string, en: string) => string) => {
  switch (String(mode || "").toLowerCase()) {
    case "resend":
      return "Resend";
    case "smtp":
      return "SMTP";
    case "console-fallback":
      return tx ? tx("Preview local", "Local preview") : "Local preview";
    default:
      return mode || "—";
  }
};

const statusLabel = (status?: string, tx?: (ro: string, en: string) => string) => {
  switch (String(status || "").toUpperCase()) {
    case "QUEUED":
      return tx ? tx("În coadă", "Queued") : "Queued";
    case "SENDING":
      return tx ? tx("Se trimite", "Sending") : "Sending";
    case "SENT":
      return tx ? tx("Trimis", "Sent") : "Sent";
    case "PARTIAL":
      return tx ? tx("Trimis parțial", "Partial") : "Partial";
    case "FAILED":
      return tx ? tx("Eșuat", "Failed") : "Failed";
    default:
      return status || "—";
  }
};

export default function AdminEmailMarketingPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const isEn = lang === "en";
  const tx = useCallback((ro: string, en: string) => (isEn ? en : ro), [isEn]);
  const defaultForm = useMemo(() => buildDefaultForm(tx), [tx]);

  const [adminPermissions, setAdminPermissions] = useState<AdminPermissionsResponse | null>(null);
  const [historyData, setHistoryData] = useState<EmailMarketingHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [form, setForm] = useState<CampaignFormState>(defaultForm);
  const [hasEditedForm, setHasEditedForm] = useState(false);
  const [sendTestLoading, setSendTestLoading] = useState(false);
  const [sendSubscribersLoading, setSendSubscribersLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAdmin = isAdminRole(user?.role);
  const canOwnerWrite = !!adminPermissions?.can?.ownerWrite || String(user?.role || "").trim().toUpperCase() === "OWNER_ADMIN";

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/admin/email-marketing");
      return;
    }
    if (user && !isAdmin) {
      router.replace("/");
    }
  }, [authLoading, isAdmin, router, token, user]);

  useEffect(() => {
    if (!user?.email) return;
    setForm((prev) => (prev.testEmail ? prev : { ...prev, testEmail: user.email || "" }));
  }, [user?.email]);

  useEffect(() => {
    if (hasEditedForm) return;
    setForm((prev) => ({
      ...defaultForm,
      testEmail: prev.testEmail || defaultForm.testEmail,
    }));
  }, [defaultForm, hasEditedForm]);

  const loadAdminPermissions = useCallback(async () => {
    try {
      const data = await apiGet<AdminPermissionsResponse>("/admin/me/permissions");
      setAdminPermissions(data || null);
    } catch {
      setAdminPermissions({
        role: user?.role,
        capabilities: user?.role === "OWNER_ADMIN" ? ["OWNER_WRITE"] : [],
        can: {
          ownerWrite: user?.role === "OWNER_ADMIN",
        },
      });
    }
  }, [user?.role]);

  const loadHistory = useCallback(async () => {
    if (!token || !isAdmin) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await apiGet<EmailMarketingHistoryResponse>("/admin/email-marketing/history");
      setHistoryData(data || { items: [] });
    } catch (err) {
      setHistoryError((err as Error)?.message || tx("Nu am putut încărca istoricul.", "Failed to load history."));
    } finally {
      setHistoryLoading(false);
    }
  }, [isAdmin, token, tx]);

  useEffect(() => {
    void loadAdminPermissions();
    void loadHistory();
  }, [loadAdminPermissions, loadHistory]);

  useEffect(() => {
    if (!canOwnerWrite) return undefined;
    const timer = window.setInterval(() => {
      void loadHistory();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [canOwnerWrite, loadHistory]);

  const updateField = (field: keyof CampaignFormState, value: string) => {
    setHasEditedForm(true);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitTest = async (e?: FormEvent) => {
    e?.preventDefault();
    setSendTestLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      await apiPost<CampaignResponse>("/admin/email-marketing/test", form, { timeoutMs: 30000 });
      setActionSuccess(tx("Emailul de test a fost trimis.", "Test email sent."));
      await loadHistory();
    } catch (err) {
      const message = (err as Error)?.message || "";
      setActionError(
        /testemail/i.test(message)
          ? tx("Adresa de test nu este validă.", "Test email address is invalid.")
          : message || tx("Nu am putut trimite emailul de test.", "Failed to send test email.")
      );
    } finally {
      setSendTestLoading(false);
    }
  };

  const submitSubscribers = async () => {
    setSendSubscribersLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      await apiPost<CampaignResponse>(
        "/admin/email-marketing/send",
        { ...form, confirmSend: true },
        { timeoutMs: 30000 }
      );
      setActionSuccess(tx("Campania a fost pusă în coadă și începe trimiterea către abonați.", "Campaign queued for subscribers."));
      setConfirmOpen(false);
      await loadHistory();
    } catch (err) {
      const message = (err as Error)?.message || "";
      setActionError(
        /No subscribed recipients/i.test(message)
          ? tx("Nu există încă abonați activi pentru acest newsletter.", "There are no active subscribers yet for this newsletter.")
          : message || tx("Nu am putut porni trimiterea.", "Failed to queue subscriber send.")
      );
    } finally {
      setSendSubscribersLoading(false);
    }
  };

  const summary = historyData?.summary;
  const historyItems = historyData?.items || [];
  const hasSubscribers = Number(summary?.activeSubscribers || 0) > 0;

  const statCards = useMemo(
    () => [
      {
        label: tx("Abonați activi", "Active subscribers"),
        value: numberFmt(summary?.activeSubscribers),
      },
      {
        label: tx("Transport email", "Mail transport"),
        value: transportLabel(summary?.transportMode, tx),
      },
      {
        label: tx("Emailuri active", "Emails enabled"),
        value: summary?.emailsEnabled ? tx("Da", "Yes") : tx("Nu", "No"),
      },
      {
        label: tx("Campanii în istoric", "Campaigns in history"),
        value: numberFmt(historyItems.length),
      },
    ],
    [historyItems.length, summary?.activeSubscribers, summary?.emailsEnabled, summary?.transportMode, tx]
  );

  if (authLoading || (token && !user)) {
    return <div className="muted">{tx("Se încarcă panoul...", "Loading admin panel...")}</div>;
  }

  if (!token || !isAdmin) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>LIVADAI Admin</div>
          <h1 className={styles.title}>{tx("Email Marketing", "Email Marketing")}</h1>
          <p className={styles.subtitle}>
            {tx(
              "Compui și trimiți manual newslettere curate, cu branding LIVADAI, doar către utilizatorii care s-au abonat explicit.",
              "Compose and send polished LIVADAI newsletters manually, only to users who explicitly opted in."
            )}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/admin" className="button secondary">
            {tx("Înapoi la admin", "Back to Admin")}
          </Link>
          <button type="button" className="button secondary" onClick={() => void loadHistory()} disabled={historyLoading}>
            {historyLoading ? tx("Se reîncarcă...", "Refreshing...") : tx("Reîncarcă", "Refresh")}
          </button>
        </div>
      </div>

      {!canOwnerWrite ? (
        <div className={styles.errorBanner}>
          {tx("Doar owner admin poate compune și trimite newslettere LIVADAI.", "Only owner admin can compose and send LIVADAI newsletters.")}
        </div>
      ) : null}

      {actionError ? <div className={styles.errorBanner}>{actionError}</div> : null}
      {actionSuccess ? <div className={styles.successBanner}>{actionSuccess}</div> : null}
      {historyError ? <div className={styles.errorBanner}>{historyError}</div> : null}

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <form className={styles.composeCard} onSubmit={submitTest}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{tx("Compune newsletterul", "Compose newsletter")}</h2>
              <p>
                {tx(
                  "Folosește doar câmpuri structurate. Template-ul păstrează automat brandingul, unsubscribe-ul și footer-ul compliant.",
                  "Use only structured fields. The template keeps branding, unsubscribe, and compliant footer automatically."
                )}
              </p>
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>{tx("Subject", "Subject")}</span>
              <input className="input" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} required />
            </label>

            <label className={styles.field}>
              <span>{tx("Test email", "Test email")}</span>
              <input
                className="input"
                type="email"
                value={form.testEmail}
                onChange={(e) => updateField("testEmail", e.target.value)}
                required
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>{tx("Intro", "Intro")}</span>
              <textarea
                className={styles.textarea}
                rows={5}
                value={form.introText}
                onChange={(e) => updateField("introText", e.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>{tx("Titlu experiență principală", "Main experience title")}</span>
              <input
                className="input"
                value={form.mainExperienceTitle}
                onChange={(e) => updateField("mainExperienceTitle", e.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>{tx("CTA label", "CTA label")}</span>
              <input className="input" value={form.ctaLabel} onChange={(e) => updateField("ctaLabel", e.target.value)} required />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>{tx("Text experiență principală", "Main experience text")}</span>
              <textarea
                className={styles.textarea}
                rows={4}
                value={form.mainExperienceText}
                onChange={(e) => updateField("mainExperienceText", e.target.value)}
                required
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>{tx("CTA URL", "CTA URL")}</span>
              <input
                className="input"
                type="url"
                value={form.ctaUrl}
                onChange={(e) => updateField("ctaUrl", e.target.value)}
                required
              />
            </label>
          </div>

          <div className={styles.sectionBlock}>
            <div className={styles.sectionEyebrow}>{tx("Experiențe secundare", "Secondary experiences")}</div>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span>{tx("Titlu experiență #1", "Experience #1 title")}</span>
                <input
                  className="input"
                  value={form.secondaryExperience1Title}
                  onChange={(e) => updateField("secondaryExperience1Title", e.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>{tx("Titlu experiență #2", "Experience #2 title")}</span>
                <input
                  className="input"
                  value={form.secondaryExperience2Title}
                  onChange={(e) => updateField("secondaryExperience2Title", e.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>{tx("Text experiență #1", "Experience #1 text")}</span>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.secondaryExperience1Text}
                  onChange={(e) => updateField("secondaryExperience1Text", e.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>{tx("Text experiență #2", "Experience #2 text")}</span>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.secondaryExperience2Text}
                  onChange={(e) => updateField("secondaryExperience2Text", e.target.value)}
                  required
                />
              </label>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className="button secondary" disabled={!canOwnerWrite || sendTestLoading || sendSubscribersLoading}>
              {sendTestLoading ? tx("Se trimite testul...", "Sending test...") : tx("Send test", "Send test")}
            </button>
            <button
              type="button"
              className="button"
              disabled={!canOwnerWrite || !hasSubscribers || sendTestLoading || sendSubscribersLoading}
              onClick={() => {
                setActionError("");
                setActionSuccess("");
                setConfirmOpen(true);
              }}
            >
              {sendSubscribersLoading ? tx("Se pornește trimiterea...", "Starting send...") : tx("Send to subscribers", "Send to subscribers")}
            </button>
          </div>
        </form>

        <aside className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>{tx("Cum funcționează", "How it works")}</h2>
              <p>
                {tx(
                  "Newsletterul este compus în admin, randat cu template-ul branded LIVADAI și trimis doar către utilizatori cu consimțământ explicit.",
                  "The newsletter is composed in admin, rendered with the LIVADAI branded template, and sent only to users with explicit consent."
                )}
              </p>
            </div>
          </div>

          <div className={styles.infoStack}>
            <div className={styles.infoItem}>
              <strong>{tx("Flow sigur", "Safe flow")}</strong>
              <span>{tx("Send test merge doar la adresa introdusă. Send to subscribers intră în coadă și procesează în batch-uri.", "Send test goes only to the entered address. Send to subscribers is queued and processed in batches.")}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>{tx("Brand asset", "Brand asset")}</strong>
              <span>{tx("Template-ul folosește logo-ul LIVADAI din asset-ul public dedicat pentru email.", "The template uses the LIVADAI logo from the public asset prepared for email.")}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>{tx("Compliance", "Compliance")}</strong>
              <span>{tx("Fiecare email real include link de dezabonare și footer compliant. Emailurile de test folosesc un token de preview sigur.", "Each real email includes unsubscribe and compliant footer. Test emails use a safe preview token.")}</span>
            </div>
          </div>
        </aside>
      </div>

      <section className={styles.historyCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2>{tx("Istoric campanii", "Campaign history")}</h2>
            <p>{tx("Ultimele campanii și teste trimise din admin.", "Latest campaigns and tests sent from admin.")}</p>
          </div>
        </div>

        {historyLoading && !historyItems.length ? <div className={styles.emptyState}>{tx("Se încarcă istoricul...", "Loading history...")}</div> : null}
        {!historyLoading && !historyItems.length ? (
          <div className={styles.emptyState}>{tx("Nu există încă trimiteri în istoric.", "No sends in history yet.")}</div>
        ) : null}

        {historyItems.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tx("Tip", "Type")}</th>
                  <th>{tx("Subject", "Subject")}</th>
                  <th>{tx("Status", "Status")}</th>
                  <th>{tx("Destinație", "Destination")}</th>
                  <th>{tx("Rezultat", "Result")}</th>
                  <th>{tx("Creat", "Created")}</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id}>
                    <td>{historyKindLabel(item.kind, tx)}</td>
                    <td>
                      <div className={styles.subjectCell}>
                        <strong>{item.subject || "—"}</strong>
                        <span>{item.mainExperienceTitle || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${String(item.status || "").toUpperCase()}`] || ""}`}>
                        {statusLabel(item.status, tx)}
                      </span>
                      {item.lastError ? <div className={styles.inlineError}>{item.lastError}</div> : null}
                    </td>
                    <td>
                      <div className={styles.subjectCell}>
                        <strong>{item.kind === "TEST" ? item.testEmail || "—" : `${numberFmt(item.audienceCount)} ${tx("abonați", "subscribers")}`}</strong>
                        <span>{transportLabel(item.transportMode, tx)}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.subjectCell}>
                        <strong>{numberFmt(item.sentCount)} {tx("trimise", "sent")}</strong>
                        <span>{numberFmt(item.failedCount)} {tx("eșuate", "failed")}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.subjectCell}>
                        <strong>{formatDate(item.createdAt, lang)}</strong>
                        <span>{item.completedAt ? `${tx("Finalizat", "Completed")}: ${formatDate(item.completedAt, lang)}` : tx("În curs / în coadă", "In progress / queued")}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {confirmOpen ? (
        <div className={styles.modalOverlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>{tx("Confirmă trimiterea", "Confirm send")}</h3>
            <p>
              {tx(
                "Newsletterul va fi trimis către toți utilizatorii abonați activi. Acțiunea nu poate fi anulată după pornire.",
                "The newsletter will be sent to all active subscribed users. This cannot be undone once started."
              )}
            </p>
            {!hasSubscribers ? (
              <div className={styles.inlineError}>
                {tx("Nu există încă abonați activi. Trimite mai întâi un test sau așteaptă primele opt-in-uri.", "There are no active subscribers yet. Send a test first or wait for your first opt-ins.")}
              </div>
            ) : null}
            <div className={styles.modalMeta}>
              <span>{tx("Abonați activi", "Active subscribers")}: {numberFmt(summary?.activeSubscribers)}</span>
              <span>{tx("Transport", "Transport")}: {transportLabel(summary?.transportMode, tx)}</span>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="button secondary" onClick={() => setConfirmOpen(false)} disabled={sendSubscribersLoading}>
                {tx("Renunță", "Cancel")}
              </button>
              <button type="button" className="button" onClick={() => void submitSubscribers()} disabled={sendSubscribersLoading || !hasSubscribers}>
                {sendSubscribersLoading ? tx("Se pornește...", "Starting...") : tx("Trimite acum", "Send now")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

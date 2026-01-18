"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import ReportModal from "@/components/report-modal";
import styles from "./host-public.module.css";

type HostProfile = {
  id?: string;
  name?: string;
  display_name?: string;
  city?: string;
  country?: string;
  about_me?: string;
  languages?: string[];
  rating_avg?: number;
  rating_count?: number;
  total_participants?: number;
  total_events?: number;
  avatar?: string;
};

export default function HostPublicProfilePage() {
  const { id } = useParams();
  const t = useT();
  const { user } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<HostProfile>(`/hosts/${id}/profile`)
      .then((data) => {
        if (active) setProfile(data || null);
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const canReport = (user?.role === "EXPLORER" || user?.role === "BOTH") && String(user?._id) !== String(id);

  const onReportHost = async ({ reason, comment }: { reason: string; comment: string }) => {
    if (!id) return;
    setReporting(true);
    setReportError("");
    setReportSuccess("");
    try {
      await apiPost("/bookings/report-user", {
        targetUserId: id,
        reason,
        comment,
      });
      setReportSuccess(t("report_sent"));
      setReportOpen(false);
    } catch (err) {
      setReportError((err as Error).message || t("report_failed"));
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <div className="muted">{t("common_loading_profile")}</div>;
  if (!profile) return <div className="muted">{t("common_loading_profile")}</div>;

  const name = profile.display_name || profile.name || t("nav_profile_fallback");

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {profile.avatar ? <img src={profile.avatar} alt={name} /> : "👤"}
        </div>
        <div className={styles.name}>{name}</div>
        <div className={styles.rating}>⭐ {Number(profile.rating_avg || 0).toFixed(1)} ({profile.rating_count || 0})</div>
        {profile.city || profile.country ? (
          <div className={styles.meta}>📍 {profile.city || ""} {profile.country || ""}</div>
        ) : null}
        {canReport ? (
          <button className={styles.reportBtn} type="button" onClick={() => setReportOpen(true)}>
            {t("report_host")}
          </button>
        ) : null}
        {reportSuccess ? <div className={styles.reportSuccess}>{reportSuccess}</div> : null}
      </div>

      <div className={styles.card}>
        <div className={styles.statRow}>
          <div>
            <div className={styles.statLabel}>{t("host_stats_total_events")}</div>
            <div className={styles.statValue}>{profile.total_events || 0}</div>
          </div>
          <div>
            <div className={styles.statLabel}>{t("host_stats_total_participants")}</div>
            <div className={styles.statValue}>{profile.total_participants || 0}</div>
          </div>
        </div>
        {profile.languages?.length ? (
          <div className={styles.meta}>🗣 {profile.languages.join(", ")}</div>
        ) : null}
        {profile.about_me ? <div className={styles.about}>{profile.about_me}</div> : null}
      </div>

      <ReportModal
        open={reportOpen}
        title={t("report_host_title")}
        reasonLabel={t("report_reason")}
        reasonType="options"
        reasonOptions={[
          { value: "CONDUCT", label: t("report_reason_conduct") },
          { value: "HARASSMENT", label: t("report_reason_harassment") },
          { value: "FRAUD", label: t("report_reason_fraud") },
          { value: "OTHER", label: t("report_reason_other") },
        ]}
        defaultReason="CONDUCT"
        commentLabel={t("report_comment")}
        commentPlaceholder={t("report_comment_placeholder")}
        commentRequired
        submitLabel={t("report_submit")}
        cancelLabel={t("report_cancel")}
        submitting={reporting}
        error={reportError}
        onClose={() => setReportOpen(false)}
        onSubmit={onReportHost}
      />
    </div>
  );
}

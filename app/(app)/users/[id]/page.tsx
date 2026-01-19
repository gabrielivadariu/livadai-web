"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import ReportModal from "@/components/report-modal";
import styles from "./user-public.module.css";

type Profile = {
  name?: string;
  displayName?: string;
  avatar?: string;
  profilePhoto?: string;
  age?: number;
  languages?: string[];
  shortBio?: string;
  experiencesCount?: number;
  phoneVerified?: boolean;
  isTrustedParticipant?: boolean;
  city?: string;
  country?: string;
};

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const t = useT();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<Profile>(`/users/${id}/public-profile`)
      .then((data) => {
        if (!active) return;
        const normalized = data ? { ...data, avatar: data.avatar || data.profilePhoto } : null;
        setProfile(normalized);
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

  const canReport = (user?.role === "HOST" || user?.role === "BOTH") && String(user?._id) !== String(id);

  const onReportUser = async ({ reason, comment }: { reason: string; comment: string }) => {
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

  const name = profile.displayName || profile.name || t("nav_profile_fallback");

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {profile.avatar ? <img src={profile.avatar} alt={name} /> : "👤"}
        </div>
        <div className={styles.name}>{name}</div>
        {profile.city || profile.country ? (
          <div className={styles.meta}>📍 {profile.city || ""} {profile.country || ""}</div>
        ) : null}
        {canReport ? (
          <button className={styles.reportBtn} type="button" onClick={() => setReportOpen(true)}>
            {t("report_user")}
          </button>
        ) : null}
        {reportSuccess ? <div className={styles.reportSuccess}>{reportSuccess}</div> : null}
      </div>

      <div className={styles.card}>
        {profile.languages?.length ? (
          <div className={styles.meta}>🗣 {profile.languages.map((l) => l.toUpperCase()).join(", ")}</div>
        ) : null}
        {profile.shortBio ? <div className={styles.about}>{profile.shortBio}</div> : null}
        {profile.experiencesCount !== undefined ? (
          <div className={styles.meta}>✅ {profile.experiencesCount} {t("profile_completed")}</div>
        ) : null}
      </div>

      <ReportModal
        open={reportOpen}
        title={t("report_user_title")}
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
        onSubmit={onReportUser}
      />
    </div>
  );
}

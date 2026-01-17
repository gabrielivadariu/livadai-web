"use client";

import { useT } from "@/lib/i18n";

export default function SettingsPage() {
  const t = useT();
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{t("settings_title")}</h2>
      <p className="muted">{t("settings_soon")}</p>
    </div>
  );
}

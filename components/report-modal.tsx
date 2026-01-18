"use client";

import { useEffect, useState } from "react";
import styles from "./report-modal.module.css";

type ReasonOption = {
  value: string;
  label: string;
};

type Props = {
  open: boolean;
  title: string;
  reasonLabel: string;
  reasonPlaceholder?: string;
  reasonType: "text" | "options";
  reasonOptions?: ReasonOption[];
  defaultReason?: string;
  commentLabel: string;
  commentPlaceholder?: string;
  commentRequired?: boolean;
  submitLabel: string;
  cancelLabel: string;
  submitting?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: { reason: string; comment: string }) => void;
};

export default function ReportModal({
  open,
  title,
  reasonLabel,
  reasonPlaceholder,
  reasonType,
  reasonOptions = [],
  defaultReason = "",
  commentLabel,
  commentPlaceholder,
  commentRequired = false,
  submitLabel,
  cancelLabel,
  submitting,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState(defaultReason);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setReason(defaultReason);
      setComment("");
    }
  }, [open, defaultReason]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.card}>
        <div className={styles.title}>{title}</div>
        <div className={styles.label}>{reasonLabel}</div>
        {reasonType === "options" ? (
          <div className={styles.options}>
            {reasonOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.option} ${reason === opt.value ? styles.optionActive : ""}`}
                onClick={() => setReason(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <input
            className={styles.input}
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}

        <div className={styles.label}>{commentLabel}</div>
        <textarea
          className={styles.textarea}
          placeholder={commentPlaceholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error ? <div className={styles.error}>{error}</div> : null}
        <div className={styles.actions}>
          <button className="button secondary" type="button" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            className="button"
            type="button"
            onClick={() => onSubmit({ reason: reason.trim(), comment: comment.trim() })}
            disabled={submitting || (commentRequired && !comment.trim()) || !reason.trim()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

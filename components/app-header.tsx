"use client";

import React from "react";

type Props = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export default function AppHeader({ searchValue, onSearchChange }: Props) {
  return (
    <div className="header">
      <div className="header-logo">LIVADAI</div>
      {onSearchChange ? (
        <div className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="input"
            style={{ border: "none", padding: 0, background: "transparent" }}
            placeholder="Caută experiențe"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}

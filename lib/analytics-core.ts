type AnalyticsSessionState = {
  sessionId: string;
  landingPage: string;
  source: string;
  medium: string;
  campaign: string;
  channelGroup: string;
  referrer: string;
  startedAt: number;
  lastSeenAt: number;
};

export type AnalyticsContext = {
  anonymousId: string;
  sessionId: string;
  source: string;
  medium: string;
  campaign: string;
  channelGroup: string;
  landingPage: string;
  page: string;
  path: string;
  referrer: string;
  title: string;
  platform: "web";
};

const ANONYMOUS_ID_KEY = "livadai.analytics.anonymous-id";
const SESSION_KEY = "livadai.analytics.session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const SOCIAL_SOURCES = ["facebook", "instagram", "tiktok", "linkedin", "twitter", "x.com", "pinterest", "youtube"];
const SEARCH_SOURCES = ["google", "bing", "duckduckgo", "yahoo", "yandex"];
const PAID_MEDIUMS = ["cpc", "ppc", "paid", "paid_social", "display", "affiliate", "sponsored"];

const canUseBrowser = () => typeof window !== "undefined";

const safeRead = <T,>(key: string): T | null => {
  if (!canUseBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (!canUseBrowser()) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
};

const safeReadLocal = (key: string) => {
  if (!canUseBrowser()) return "";
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const safeWriteLocal = (key: string, value: string) => {
  if (!canUseBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
};

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const getCurrentPath = () => {
  if (!canUseBrowser()) return "";
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
};

const toHost = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

const classifyChannelGroup = (source: string, medium: string, referrer: string) => {
  const sourceValue = source.toLowerCase();
  const mediumValue = medium.toLowerCase();
  const referrerValue = referrer.toLowerCase();

  if (PAID_MEDIUMS.some((token) => mediumValue.includes(token))) return "paid";
  if (!sourceValue && !mediumValue && !referrerValue) return "direct";
  if (SOCIAL_SOURCES.some((token) => sourceValue.includes(token) || referrerValue.includes(token))) return "social";
  if (SEARCH_SOURCES.some((token) => sourceValue.includes(token) || referrerValue.includes(token))) return "organic";
  if (sourceValue || referrerValue) return "referral";
  return "direct";
};

const detectAttribution = (url: URL, referrer: string) => {
  const utmSource = url.searchParams.get("utm_source") || "";
  const utmMedium = url.searchParams.get("utm_medium") || "";
  const utmCampaign = url.searchParams.get("utm_campaign") || "";
  const hasUtm = utmSource || utmMedium || utmCampaign;
  if (hasUtm) {
    return {
      source: utmSource || "campaign",
      medium: utmMedium || "unknown",
      campaign: utmCampaign || "",
    };
  }

  if (url.searchParams.get("gclid")) {
    return { source: "google", medium: "cpc", campaign: url.searchParams.get("utm_campaign") || "" };
  }

  if (url.searchParams.get("fbclid")) {
    return { source: "facebook", medium: "paid_social", campaign: url.searchParams.get("utm_campaign") || "" };
  }

  const referrerHost = toHost(referrer);
  const currentHost = canUseBrowser() ? window.location.hostname.replace(/^www\./, "").toLowerCase() : "";

  if (referrerHost && referrerHost !== currentHost) {
    const medium = SEARCH_SOURCES.some((token) => referrerHost.includes(token)) ? "organic" : "referral";
    return {
      source: referrerHost,
      medium,
      campaign: "",
    };
  }

  return {
    source: "",
    medium: "",
    campaign: "",
  };
};

export const getAnonymousId = () => {
  const existing = safeReadLocal(ANONYMOUS_ID_KEY);
  if (existing) return existing;
  const next = createId("anon");
  safeWriteLocal(ANONYMOUS_ID_KEY, next);
  return next;
};

export const getAnalyticsSession = () => {
  if (!canUseBrowser()) {
    return {
      sessionId: "",
      landingPage: "",
      source: "",
      medium: "",
      campaign: "",
      channelGroup: "direct",
      referrer: "",
      startedAt: 0,
      lastSeenAt: 0,
      isNewSession: false,
    };
  }

  const now = Date.now();
  const currentPath = getCurrentPath();
  const currentUrl = new URL(window.location.href);
  const referrer = document.referrer || "";
  const existing = safeRead<AnalyticsSessionState>(SESSION_KEY);
  const sessionStillValid = existing && now - Number(existing.lastSeenAt || 0) < SESSION_TIMEOUT_MS;

  if (sessionStillValid && existing) {
    const nextState: AnalyticsSessionState = {
      ...existing,
      lastSeenAt: now,
      landingPage: existing.landingPage || currentPath,
    };
    safeWrite(SESSION_KEY, nextState);
    return { ...nextState, isNewSession: false };
  }

  const attribution = detectAttribution(currentUrl, referrer);
  const channelGroup = classifyChannelGroup(attribution.source, attribution.medium, referrer);
  const nextState: AnalyticsSessionState = {
    sessionId: createId("sess"),
    landingPage: currentPath,
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    channelGroup,
    referrer,
    startedAt: now,
    lastSeenAt: now,
  };
  safeWrite(SESSION_KEY, nextState);
  return { ...nextState, isNewSession: true };
};

export const getAnalyticsContext = (): AnalyticsContext => {
  const session = getAnalyticsSession();
  const path = getCurrentPath();
  return {
    anonymousId: getAnonymousId(),
    sessionId: session.sessionId,
    source: session.source,
    medium: session.medium,
    campaign: session.campaign,
    channelGroup: session.channelGroup,
    landingPage: session.landingPage,
    page: path,
    path,
    referrer: document.referrer || session.referrer || "",
    title: document.title || "",
    platform: "web",
  };
};

export const getAnalyticsHeaders = (): Record<string, string> => {
  if (!canUseBrowser()) return {};
  const context = getAnalyticsContext();
  return {
    "x-livadai-anonymous-id": context.anonymousId,
    "x-livadai-session-id": context.sessionId,
    "x-livadai-source": context.source,
    "x-livadai-medium": context.medium,
    "x-livadai-campaign": context.campaign,
    "x-livadai-channel-group": context.channelGroup,
    "x-livadai-landing-page": context.landingPage,
    "x-livadai-page": context.page,
    "x-livadai-path": context.path,
    "x-livadai-referrer": context.referrer,
    "x-livadai-title": context.title,
    "x-livadai-platform": context.platform,
  };
};

export const getAnalyticsPath = () => getCurrentPath();

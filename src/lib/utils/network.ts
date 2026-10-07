/**
 * Network Awareness Utility for Adaptive Data Loading
 * Detects 2G / 3G / 4G and saveData modes via Network Information API
 */

export interface NetworkStatus {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  saveData: boolean;
  downlink?: number;
  rtt?: number;
}

export function getNetworkStatus(): NetworkStatus {
  if (typeof window === "undefined" || !("connection" in navigator)) {
    return {
      effectiveType: "4g",
      saveData: false,
    };
  }

  const conn = (navigator as any).connection || {};
  return {
    effectiveType: conn.effectiveType || "4g",
    saveData: Boolean(conn.saveData),
    downlink: conn.downlink,
    rtt: conn.rtt,
  };
}

export function isSlowConnection(): boolean {
  const status = getNetworkStatus();
  return (
    status.saveData ||
    status.effectiveType === "slow-2g" ||
    status.effectiveType === "2g" ||
    status.effectiveType === "3g"
  );
}

export function shouldPrefetch(): boolean {
  return !isSlowConnection();
}

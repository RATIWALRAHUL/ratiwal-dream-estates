"use server";
import "server-only";
import { requireAdminSession } from "@/lib/auth/guard";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { ReportExportService } from "@/lib/services/report-export.service";
import { AnalyticsFilterParams, ReportType, ReportExecutionResult } from "@/types/analytics";
import type { ActionResult } from "@/lib/actions/types";
import { logger } from "@/lib/logger";

/**
 * Fetch overview analytics data for the active filter set.
 */
export async function getOverviewAnalyticsAction(params: AnalyticsFilterParams) {
  try {
    const session = await requireAdminSession();
    return await AnalyticsService.getOverviewAnalytics(params, session);
  } catch (error) {
    logger.error("[Analytics] getOverviewAnalyticsAction failed", { error });
    throw error;
  }
}

/**
 * Fetch funnel analytics data.
 */
export async function getFunnelAnalyticsAction(params: AnalyticsFilterParams) {
  try {
    const session = await requireAdminSession();
    return await AnalyticsService.getFunnelAnalytics(params, session);
  } catch (error) {
    logger.error("[Analytics] getFunnelAnalyticsAction failed", { error });
    throw error;
  }
}

/**
 * Fetch property demand analytics.
 */
export async function getPropertyDemandAnalyticsAction(params: AnalyticsFilterParams) {
  try {
    const session = await requireAdminSession();
    return await AnalyticsService.getPropertyDemandAnalytics(params, session);
  } catch (error) {
    logger.error("[Analytics] getPropertyDemandAnalyticsAction failed", { error });
    throw error;
  }
}

/**
 * Fetch advisor workload and response SLA analytics.
 */
export async function getAdvisorWorkloadAnalyticsAction(params: AnalyticsFilterParams) {
  try {
    const session = await requireAdminSession();
    return await AnalyticsService.getAdvisorWorkloadAnalytics(params, session);
  } catch (error) {
    logger.error("[Analytics] getAdvisorWorkloadAnalyticsAction failed", { error });
    throw error;
  }
}

/**
 * Fetch site visit analytics.
 */
export async function getSiteVisitAnalyticsAction(params: AnalyticsFilterParams) {
  try {
    const session = await requireAdminSession();
    return await AnalyticsService.getSiteVisitAnalytics(params, session);
  } catch (error) {
    logger.error("[Analytics] getSiteVisitAnalyticsAction failed", { error });
    throw error;
  }
}

/**
 * Fetch data quality and hygiene report.
 */
export async function getDataQualityReportAction() {
  try {
    const session = await requireAdminSession();
    return await AnalyticsService.getDataQualityReport(session);
  } catch (error) {
    logger.error("[Analytics] getDataQualityReportAction failed", { error });
    throw error;
  }
}

/**
 * Execute tabular report query.
 */
export async function executeReportAction(
  reportType: ReportType,
  page: number = 1,
  perPage: number = 25
): Promise<ReportExecutionResult> {
  try {
    const session = await requireAdminSession();
    return await ReportExportService.executeReport(reportType, page, perPage, session);
  } catch (error) {
    logger.error("[Analytics] executeReportAction failed", { error });
    throw error;
  }
}

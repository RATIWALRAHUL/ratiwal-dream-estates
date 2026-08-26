"use client";

import Link from "next/link";

interface PartnerHomeViewProps {
  data: any;
}

export function PartnerHomeView({ data }: PartnerHomeViewProps) {
  const { partner, compliance, stats, recentLeads, properties } = data;

  const isCompliant = compliance.status === "ACTIVE" || compliance.status === "APPROVED";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0e1626] via-[#121d33] to-[#0e1626] border border-[#233352] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {partner?.partnerType?.replace(/_/g, " ") || "Channel Partner"}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isCompliant
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
              }`}>
                {compliance.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Welcome, {partner?.displayName || "Partner"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Code: <span className="text-slate-200 font-mono font-medium">{partner?.partnerCode}</span> • Operating Markets: {partner?.operatingLocations?.join(", ")?.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/partner/leads/new"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105 inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Register New Lead</span>
            </Link>
            <Link
              href="/partner/commissions"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-all"
            >
              View Commission Ledger
            </Link>
          </div>
        </div>

        {/* Compliance Warning Banner if not fully verified */}
        {!compliance.isReraVerified && partner?.reraRequired && (
          <div className="mt-6 p-3.5 bg-yellow-950/40 border border-yellow-500/40 rounded-xl flex items-center justify-between text-xs text-yellow-200">
            <div className="flex items-center space-x-2.5">
              <svg className="w-5 h-5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>RERA Verification Pending:</strong> Please ensure your state RERA license certificate is uploaded to enable automated payouts.
              </span>
            </div>
            <Link href="/partner/documents" className="text-amber-400 hover:underline font-semibold ml-4 shrink-0">
              Upload Certificate →
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Leads</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.totalLeadsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Directly attributed in active windows</p>
        </div>

        <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Authorized Estates</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{stats.authorizedPropertiesCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Exclusive plotted projects assigned</p>
        </div>

        <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estimated Earnings</p>
          <p className="text-2xl font-bold text-sky-400 mt-2">{stats.estimatedGrossFormatted}</p>
          <p className="text-[11px] text-slate-400 mt-1">Accruing on active deals</p>
        </div>

        <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Approved Payable</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{stats.approvedPayableFormatted}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for scheduled payout</p>
        </div>
      </div>

      {/* Lead Pipeline & Authorized Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Leads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-white tracking-wide">
              Recent Lead Submissions
            </h2>
            <Link href="/partner/leads" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
              View All ({stats.totalLeadsCount}) →
            </Link>
          </div>

          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-lg">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <p>No leads submitted yet.</p>
                <Link
                  href="/partner/leads/new"
                  className="mt-3 inline-block text-xs text-amber-400 hover:underline font-semibold"
                >
                  Register your first client lead →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-200">{lead.clientNameMasked}</span>
                        <span className="text-xs font-mono text-slate-400">{lead.clientPhoneMasked}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Property: <span className="text-slate-300">{lead.propertyTitle}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        lead.status === "ACCEPTED" || lead.status === "BOOKING_ACHIEVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : lead.status === "UNDER_REVIEW" || lead.status === "SUBMITTED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {lead.status?.replace(/_/g, " ")}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(lead.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Authorized Estates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-white tracking-wide">
              Authorized Projects
            </h2>
            <span className="text-xs text-slate-400">{properties.length} Active</span>
          </div>

          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-4 shadow-lg space-y-3">
            {properties.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No specific properties assigned yet.</p>
            ) : (
              properties.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-amber-500/30 transition-all">
                  <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                  <p className="text-xs text-amber-400 mt-0.5">Starting at {p.priceFormatted}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {p.accessLevel}
                    </span>
                    <Link
                      href={`/partner/leads/new?propertyId=${p.id}`}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      + Register Lead
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { createChannelPartnerAction } from "@/lib/actions/partner-management.actions";

interface StaffPartnersViewProps {
  partners: any[];
}

export function StaffPartnersView({ partners }: StaffPartnersViewProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = partners.filter((p) => {
    const matchesFilter = filter === "ALL" || p.status === filter;
    const matchesSearch =
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.partnerCode.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreatePartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createChannelPartnerAction(formData);
    setLoading(false);

    if (res.success) {
      setShowModal(false);
      window.location.reload();
    } else {
      setError(res.error || "Failed to create partner.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Channel Partners & Broker Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized broker partners, compliance onboarding, RERA licenses, and lead attribution.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto inline-flex items-center space-x-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Onboard New Partner</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d131f] border border-[#232f48] p-4 rounded-xl">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by code, agency, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "ACTIVE", "APPROVED", "ONBOARDING", "UNDER_REVIEW", "INVITED", "SUSPENDED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === st
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No channel partners found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Partner Code</th>
                  <th className="px-5 py-3.5">Business Name / Type</th>
                  <th className="px-5 py-3.5">Primary Contact</th>
                  <th className="px-5 py-3.5">Operating Markets</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-amber-400">
                      {p.partnerCode}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{p.displayName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.partnerType.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-200">{p.primaryContact?.name || p.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.phone}</div>
                    </td>
                    <td className="px-5 py-4 uppercase text-slate-300">
                      {p.operatingLocations?.join(", ") || "JAIPUR"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : p.status === "SUSPENDED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/partners/${p._id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium rounded text-xs transition-colors"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d131f] border border-[#232f48] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-serif font-bold text-white">Onboard New Channel Partner</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Legal Entity / Broker Name</label>
                <input
                  type="text"
                  name="legalName"
                  required
                  placeholder="e.g. Apex Realty LLP"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Partner Type</label>
                  <select
                    name="partnerType"
                    defaultValue="CHANNEL_PARTNER"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="INDIVIDUAL_BROKER">Individual Broker</option>
                    <option value="REAL_ESTATE_AGENT">Real Estate Agent</option>
                    <option value="AGENCY">Agency / Firm</option>
                    <option value="CHANNEL_PARTNER">Channel Partner</option>
                    <option value="CORPORATE_PARTNER">Corporate Partner</option>
                    <option value="REFERRAL_PARTNER">Referral Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Operating City</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue="Jaipur"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="partner@agency.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Partner Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

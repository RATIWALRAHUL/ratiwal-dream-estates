"use client";

interface StatementItem {
  id: string;
  statementNumber: string;
  periodStart: string;
  periodEnd: string;
  totalGrossFormatted: string;
  totalTdsFormatted: string;
  totalGstFormatted: string;
  totalNetFormatted: string;
  totalPaidFormatted: string;
  closingOutstandingFormatted: string;
  accrualCount: number;
  payoutCount: number;
  generatedAt: string;
}

interface PartnerStatementsViewProps {
  statements: StatementItem[];
}

export function PartnerStatementsView({ statements }: PartnerStatementsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Financial Statements & Payout Records
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Periodic earnings statements, reconciled payouts, and annual tax certificates.
        </p>
      </div>

      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {statements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No periodic statements generated yet. Statements are issued at the close of each billing cycle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Statement #</th>
                  <th className="px-5 py-3.5">Billing Period</th>
                  <th className="px-5 py-3.5">Gross Commission</th>
                  <th className="px-5 py-3.5">TDS Withheld</th>
                  <th className="px-5 py-3.5">Net Disbursed</th>
                  <th className="px-5 py-3.5">Closing Balance</th>
                  <th className="px-5 py-3.5">Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {statements.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-amber-400 font-medium">
                      {st.statementNumber}
                    </td>
                    <td className="px-5 py-4 text-slate-200">
                      {new Date(st.periodStart).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – {new Date(st.periodEnd).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {st.totalGrossFormatted}
                    </td>
                    <td className="px-5 py-4 text-red-400">
                      - {st.totalTdsFormatted}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {st.totalPaidFormatted}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">
                      {st.closingOutstandingFormatted}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(st.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

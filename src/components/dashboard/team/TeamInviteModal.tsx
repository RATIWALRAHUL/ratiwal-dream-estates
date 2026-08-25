"use client";

import { useState } from "react";
import { X, Send, Copy, Check, Shield, AlertCircle } from "lucide-react";
import { createTeamInvitationAction } from "@/lib/actions/team.actions";
import { SYSTEM_ROLE_KEYS, DATA_SCOPES, DataScope } from "@/types/settings-team";

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export function TeamInviteModal({ isOpen, onClose, userRole }: TeamInviteModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("SALES");
  const [roleKey, setRoleKey] = useState("ADVISOR");
  const [dataScope, setDataScope] = useState<DataScope>("ASSIGNED");
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ rawToken: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await createTeamInvitationAction({
      email,
      fullName,
      jobTitle,
      department,
      roleKey,
      dataScope,
      expiresInHours,
    });

    setIsLoading(false);

    if (res.success && res.rawToken) {
      setInviteResult({
        rawToken: res.rawToken,
        expiresAt: res.expiresAt || "",
      });
    } else {
      setError(res.message || "Failed to create invitation.");
    }
  };

  const inviteLink = inviteResult
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/team/invitations/accept?token=${inviteResult.rawToken}`
    : "";

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(7,26,40,0.06)] flex justify-between items-center bg-[#f8f7f4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#087fc3]/10 text-[#087fc3] flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#071a28] text-base">Invite Team Member</h3>
              <p className="text-xs text-[#647581]">Generate a secure one-time invitation link.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {inviteResult ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <p className="font-bold text-sm mb-1">Invitation Link Created Successfully!</p>
                <p className="text-emerald-700">
                  Share this secure one-time link with <strong>{email}</strong>. The token is hashed with SHA-256 and expires on{" "}
                  {new Date(inviteResult.expiresAt).toLocaleString()}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1.5 font-mono uppercase">
                  One-Time Invitation Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-[#087fc3] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs hover:bg-[#076fa8]"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1.5">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@ratiwaldreamestates.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#071a28] mb-1.5">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Property Advisor"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#071a28] mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                  >
                    <option value="SALES">Sales & CRM</option>
                    <option value="LEGAL">Legal & Compliance</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="INVENTORY">Inventory & Plotting</option>
                    <option value="MANAGEMENT">Executive Management</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#071a28] mb-1.5">Role *</label>
                  <select
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value)}
                    className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                  >
                    {SYSTEM_ROLE_KEYS.map((rk) => (
                      <option key={rk} value={rk} disabled={rk === "SUPER_ADMIN" && userRole !== "SUPER_ADMIN"}>
                        {rk.replace(/_/g, " ")} {rk === "SUPER_ADMIN" && userRole !== "SUPER_ADMIN" ? "(Super Admin Only)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#071a28] mb-1.5">Data Scope</label>
                  <select
                    value={dataScope}
                    onChange={(e) => setDataScope(e.target.value as DataScope)}
                    className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                  >
                    {DATA_SCOPES.map((scope) => (
                      <option key={scope} value={scope}>
                        {scope.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1.5">Link Expiration</label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
                >
                  <option value={24}>24 Hours (1 Day)</option>
                  <option value={72}>72 Hours (3 Days - Recommended)</option>
                  <option value={168}>168 Hours (7 Days)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Generating Link..." : "Generate Invitation Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

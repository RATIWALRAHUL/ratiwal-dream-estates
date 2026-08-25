"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { rollbackSettingsAction } from "@/lib/actions/settings.actions";

interface SettingsRollbackButtonProps {
  changeId: string;
  section: string;
  versionBefore: number;
}

export function SettingsRollbackButton({
  changeId,
  section,
  versionBefore,
}: SettingsRollbackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRollback = async () => {
    if (!window.confirm(`Roll back ${section} settings to state before version ${versionBefore}?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await rollbackSettingsAction(changeId);
    setIsLoading(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.message || "Failed to roll back settings.");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1 font-sans">
      {error && <span className="text-[10px] text-rose-600 font-sans">{error}</span>}
      <button
        type="button"
        onClick={handleRollback}
        disabled={isLoading}
        className="px-2.5 py-1 rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:bg-[#f8f7f4] text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
      >
        <RotateCcw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
        <span>Rollback</span>
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  validateInventoryImportAction,
  executeInventoryImportAction,
} from "@/lib/actions/inventory-unit.actions";
import { IRowValidationError } from "@/models/InventoryImportJob";
import { ParsedCsvRow } from "@/lib/services/inventory-import.service";

interface InventoryImportWizardProps {
  properties: { _id: string; title: string }[];
}

export function InventoryImportWizard({ properties }: InventoryImportWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [propertyId, setPropertyId] = useState<string>(properties[0]?._id || "");
  const [importMode, setImportMode] = useState<"CREATE_NEW_ONLY" | "UPDATE_EXISTING_ONLY" | "CREATE_AND_UPDATE">("CREATE_NEW_ONLY");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation Results State
  const [jobId, setJobId] = useState<string>("");
  const [totalRows, setTotalRows] = useState(0);
  const [validRowsCount, setValidRowsCount] = useState(0);
  const [invalidRowsCount, setInvalidRowsCount] = useState(0);
  const [rowErrors, setRowErrors] = useState<IRowValidationError[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);

  // Final Result State
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; failed: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith(".csv")) {
        setError("Please upload a valid .csv file.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleValidate = () => {
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const text = await file.text();
        const res = await validateInventoryImportAction(propertyId, text, file.name, importMode);

        if (!res.success) {
          setError(res.message || "Failed to validate CSV file.");
          return;
        }

        setJobId(res.jobId);
        setTotalRows(res.totalRows);
        setValidRowsCount(res.validRows);
        setInvalidRowsCount(res.invalidRows);
        setRowErrors(res.rowErrors || []);
        setParsedRows(res.parsedRows || []);
        setStep(2);
      } catch (err: any) {
        setError(err.message || "An error occurred during CSV parsing.");
      }
    });
  };

  const handleExecute = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await executeInventoryImportAction(jobId, propertyId, parsedRows);
        if (!res.success) {
          setError(res.message || "Import execution failed.");
          return;
        }
        setImportResult({ created: res.created || 0, skipped: res.skipped || 0, failed: res.failed || 0 });
        setStep(3);
      } catch (err: any) {
        setError(err.message || "Failed to complete import.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* STEP 1: Upload & Config */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
            <div>
              <h3 className="text-base font-bold font-serif text-[#071a28]">
                Upload Inventory CSV
              </h3>
              <p className="text-xs text-[#647581] mt-0.5">
                Bulk create or update sellable units, villas, and plots.
              </p>
            </div>

            <a
              href="/api/inventory/import/template"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#087fc3]" />
              <span>Download Template</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Target Property / Township *</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
              >
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Import Mode</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as any)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
              >
                <option value="CREATE_NEW_ONLY">Create New Units Only (Reject Existing)</option>
                <option value="UPDATE_EXISTING_ONLY">Update Existing Units Only</option>
                <option value="CREATE_AND_UPDATE">Create New & Update Existing</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="border-2 border-dashed border-[rgba(7,26,40,0.15)] hover:border-[#087fc3] rounded-2xl p-8 text-center transition-colors bg-[#f8f7f4]/60">
            <FileSpreadsheet className="w-10 h-10 text-[#087fc3] mx-auto mb-3" />
            <p className="text-xs font-bold text-[#071a28]">
              {file ? file.name : "Drag and drop your .csv file here or browse"}
            </p>
            <p className="text-[10px] text-[#647581] mt-1">
              Supports UTF-8 encoded CSV files up to 500 units per batch.
            </p>
            <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white hover:bg-[#087fc3] text-xs font-bold cursor-pointer transition-all shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleValidate}
              disabled={!file || isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Validate & Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Preview & Validation */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
            <div>
              <h3 className="text-base font-bold font-serif text-[#071a28]">
                Validation Preview ({validRowsCount} Valid, {invalidRowsCount} Invalid)
              </h3>
              <p className="text-xs text-[#647581] mt-0.5">
                Review rows before committing mutations to the live database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                {validRowsCount} Ready
              </span>
              {invalidRowsCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200">
                  {invalidRowsCount} Errors
                </span>
              )}
            </div>
          </div>

          {/* Row Errors */}
          {rowErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Row Validation Errors:</span>
              </h4>
              <ul className="text-xs text-rose-800 space-y-1 list-disc list-inside font-mono">
                {rowErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.rowNumber} ({err.unitNumber || "Unknown"}): {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-[rgba(7,26,40,0.08)] rounded-xl overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] uppercase text-[#647581]">
                    <th className="py-2 px-3">Row</th>
                    <th className="py-2 px-3">Unit Number</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Config</th>
                    <th className="py-2 px-3">Area (Sq.Ft)</th>
                    <th className="py-2 px-3">Price (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
                  {parsedRows.slice(0, 50).map((row) => (
                    <tr key={row.rowNumber} className="hover:bg-[#f8f7f4]/60">
                      <td className="py-2 px-3 text-[#647581]">{row.rowNumber}</td>
                      <td className="py-2 px-3 font-bold text-[#071a28]">{row.unitNumber}</td>
                      <td className="py-2 px-3">{row.unitCategory}</td>
                      <td className="py-2 px-3">{row.configuration}</td>
                      <td className="py-2 px-3">{row.areaSqFt}</td>
                      <td className="py-2 px-3">
                        {row.basePriceRupees ? `₹${row.basePriceRupees.toLocaleString("en-IN")}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Upload</span>
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={validRowsCount === 0 || isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Commit {validRowsCount} Units to Database</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Complete */}
      {step === 3 && importResult && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold font-serif text-[#071a28]">
            Bulk Import Completed Successfully
          </h3>
          <p className="text-xs text-[#647581] max-w-md mx-auto">
            Successfully imported {importResult.created} units into the property inventory.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/inventory")}
              className="px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
            >
              View All Inventory Units
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

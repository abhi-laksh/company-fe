import React, { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Popover } from "react-tiny-popover";
import { useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IMPORT_MODES = [
  {
    label: "Create New",
    value: "insert",
    info: "Insert only new companies (based on unique email).",
  },
  {
    label: "Upsert (Without Overwrite)",
    value: "upsert-no-overwrite",
    info: "Create new and update existing companies (without overwrite). For existing ones (based on email), update only empty fields.",
  },
  {
    label: "Upsert (With Overwrite)",
    value: "upsert-with-overwrite",
    info: "Create new and update existing companies (with overwrite). If company already exists, overwrite all fields with new data from CSV.",
  },
  {
    label: "Update Only (Without Overwrite)",
    value: "update-no-overwrite",
    info: "Only update existing ones (based on email) without overwriting existing field values (update only where fields are empty).",
  },
  {
    label: "Update Only (With Overwrite)",
    value: "update-with-overwrite",
    info: "Only update companies that already exist in DB (based on email), and overwrite all existing fields with new data.",
  },
];

const ACCEPTED_TYPES = [".csv", ".xlsx"];

const FileImport: React.FC = () => {
  // Popover state for info icons
  const [popoverIdx, setPopoverIdx] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Mutation for file upload ---
  type ImportResponse = { inserted: number; updated: number; skipped: number };

  const mutation = useMutation<ImportResponse, Error, void>({
    mutationFn: async () => {
      if (!file || !importMode) throw new Error("Missing file or import mode");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", importMode);
      // Replace /api/import with your backend endpoint
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `Import successful! Inserted: ${data.inserted}, Updated: ${data.updated}, Skipped: ${data.skipped}`
      );
      setFile(null);
      setImportMode("");
    },
    onError: (err: Error) => {
      toast.error(`Import failed: ${err.message}`);
    },
  });

  // --- Handlers ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && ACCEPTED_TYPES.some((type) => f.name.endsWith(type))) {
      setFile(f);
    } else {
      toast.warning("Please select a .csv or .xlsx file.");
      setFile(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && ACCEPTED_TYPES.some((type) => f.name.endsWith(type))) {
      setFile(f);
    } else {
      toast.warning("Please drop a .csv or .xlsx file.");
      setFile(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning("Please select a file to upload.");
      return;
    }
    if (!importMode) {
      toast.warning("Please select an import mode.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-screen-lg w-full min-h-[60vh] mx-auto p-0 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-0">
        {/* Header */}
        <div className="px-12 pt-10 pb-4 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V19a2.5 2.5 0 002.5 2.5h13A2.5 2.5 0 0021 19v-2.5M16 10l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Data Import</h2>
          </div>
          <p className="text-gray-600 text-sm text-center max-w-md">
            Upload your <span className="font-medium">.csv</span> or{" "}
            <span className="font-medium">.xlsx</span> file and select how you
            want to import the data. All changes are previewed before final
            import.
          </p>
        </div>
        {/* Drag-and-drop area */}
        <div
          className={`mx-12 mt-4 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 outline-none focus:ring-2 ${
            isDragging
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
              : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          } ${file ? "border-green-400 bg-green-50" : ""}`}
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-10 h-10 text-blue-400 mb-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4m-8 8h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v7a2 2 0 002 2z"
              />
            </svg>
            {file ? (
              <span className="text-green-700 font-semibold text-base flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 00-1.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {file.name}
              </span>
            ) : (
              <span className="text-gray-600 font-medium">
                Drag & drop or{" "}
                <span className="underline text-blue-600">browse</span> file
              </span>
            )}
          </div>
        </div>
        {/* Divider */}
        <span className="bg-white text-gray-800 text-sm font-semibold tracking-wide mx-12 mt-8 mb-2">
          IMPORT MODE
        </span>

        <p className="text-gray-600 text-sm mx-12 mb-8">
          Select how you want to import the data.
        </p>

        {/* Import mode options */}
        <div className="mx-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          {IMPORT_MODES.map((mode, idx) => (
            <div key={mode.value} className="relative">
              <label
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors cursor-pointer shadow-sm w-full ${
                  importMode === mode.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-400"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value={mode.value}
                  checked={importMode === mode.value}
                  onChange={() => setImportMode(mode.value)}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-gray-900 font-medium text-sm">
                  {mode.label}
                </span>
                <span className="flex-1" />
                {/* Info Icon with Popover (popover only on icon hover/focus) */}
                <Popover
                  isOpen={popoverIdx === idx}
                  positions={["top", "bottom"]}
                  padding={8}
                  onClickOutside={() => setPopoverIdx(null)}
                  content={
                    <div
                      className="max-w-xs bg-white text-gray-900 rounded-lg shadow-lg p-3 text-sm border border-gray-200"
                      onMouseEnter={() => setPopoverIdx(idx)}
                      onMouseLeave={() => setPopoverIdx(null)}
                    >
                      {mode.info}
                    </div>
                  }
                >
                  <span
                    tabIndex={0}
                    aria-label="Show info"
                    className="ml-2 p-1 rounded-full hover:bg-blue-100 focus:bg-blue-200 focus:outline-none flex items-center justify-center"
                    onMouseEnter={() => setPopoverIdx(idx)}
                    onMouseLeave={() => setPopoverIdx(null)}
                    onFocus={() => setPopoverIdx(idx)}
                    onBlur={() => setPopoverIdx(null)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                    >
                      <g data-name="Layer 2" id="Layer_2">
                        <path d="M16,12a2,2,0,1,1,2-2A2,2,0,0,1,16,12Zm0-2Z" />
                        <path d="M16,29A13,13,0,1,1,29,16,13,13,0,0,1,16,29ZM16,5A11,11,0,1,0,27,16,11,11,0,0,0,16,5Z" />
                        <path d="M16,24a2,2,0,0,1-2-2V16a2,2,0,0,1,4,0v6A2,2,0,0,1,16,24Zm0-8v0Z" />
                      </g>
                      <g id="frame">
                        <rect className="cls-1" height="32" width="32" fill="none" />
                      </g>
                    </svg>
                  </span>
                </Popover>
              </label>
            </div>
          ))}
        </div>
        {/* Submit button */}
        <div className="mx-12 pb-10 pt-8 flex flex-col items-center gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:opacity-60 flex items-center gap-2 justify-center"
            disabled={mutation.isPending}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5"
              />
            </svg>
            {mutation.isPending ? "Uploading…" : "Upload & Import"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileImport;

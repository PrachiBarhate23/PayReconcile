import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import api from "../../api/api";

export function TransactionExportPage() {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("csv");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setLoading(true);
    setMessage("");

    try {
      const startDateTime = new Date(startDate).toISOString();
      const endDateTime = new Date(endDate).toISOString();

      let url = "";
      let filename = "";

      switch (format) {
        case "csv":
          url = `/exports/csv?startDate=${startDateTime}&endDate=${endDateTime}`;
          filename = "transactions.csv";
          break;
        case "excel":
          url = `/exports/excel?startDate=${startDateTime}&endDate=${endDateTime}`;
          filename = "transactions.xlsx";
          break;
        case "pdf":
          url = `/exports/pdf?startDate=${startDateTime}&endDate=${endDateTime}`;
          filename = "transactions.pdf";
          break;
      }

      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      setMessage(`✓ ${format.toUpperCase()} exported successfully`);
    } catch (err) {
      console.error("Failed to export", err);
      setMessage("✗ Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px 0" }}>Transaction Export</h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
          Export your transaction history in various formats
        </p>
      </div>

      <div style={{ maxWidth: "672px" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Format Selection */}
          <div>
            <span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>Export Format</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                { id: "csv", label: "CSV", icon: "📄" },
                { id: "excel", label: "Excel", icon: "📊" },
                { id: "pdf", label: "PDF", icon: "📑" },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: format === fmt.id ? "2px solid #2563eb" : "2px solid #e2e8f0",
                    backgroundColor: format === fmt.id ? "#eff6ff" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (format !== fmt.id) e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => {
                    if (format !== fmt.id) e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{fmt.icon}</div>
                  <p style={{ fontWeight: "500", color: "#0f172a", margin: "0" }}>{fmt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label htmlFor="export-start-date" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>Start Date</label>
              <input
                id="export-start-date"
                type="date"
                style={{ width: "100%", padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="export-end-date" style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>End Date</label>
              <input
                id="export-end-date"
                type="date"
                style={{ width: "100%", padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: loading ? "#93c5fd" : "#2563eb",
              color: "white",
              fontWeight: "600",
              borderRadius: "8px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "14px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#2563eb";
            }}
          >
            <Download className="w-5 h-5" />
            {loading ? "Exporting..." : `Export as ${format.toUpperCase()}`}
          </button>

          {/* Message */}
          {message && (
            <div style={{
              padding: "16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: message.startsWith("✓") ? "#ecfdf5" : "#fee2e2",
              color: message.startsWith("✓") ? "#059669" : "#dc2626",
              border: message.startsWith("✓") ? "1px solid #a7f3d0" : "1px solid #fecaca"
            }}>
              {message}
            </div>
          )}

          {/* Format Information */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ fontWeight: "600", color: "#0f172a", margin: "0" }}>Format Details:</h3>
            <ul style={{ fontSize: "14px", color: "#475569", margin: "0", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "4px" }}><strong>CSV:</strong> Universal spreadsheet format, easy to import</li>
              <li style={{ marginBottom: "4px" }}><strong>Excel:</strong> Formatted spreadsheet with dates and amounts</li>
              <li style={{ marginBottom: "0" }}><strong>PDF:</strong> Professional report with charts and summary</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

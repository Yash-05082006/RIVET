import { createFileRoute } from "@tanstack/react-router";
import { Download, Calendar, Users, BarChart, FileText, CheckCircle } from "lucide-react";
import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { useState, useMemo, useEffect } from "react";
import { accessibleDepartments, accessibleModules } from "../../lib/rivet/permissions";
import { users, departments, getModule, webinarSeries } from "../../lib/rivet/demo-data";
import { formatDate } from "../../lib/formatDate";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import mainLogo from "../../../assets/RIVET_main_logo_removebg.png";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { entries } = useRivet();
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"monthly" | "employee" | "meeting" | "calendar" | "export">("monthly");
  
  const myDepts = accessibleDepartments(user);
  const [selectedDept, setSelectedDept] = useState(myDepts[0]?.id || "");
  const [selectedUser, setSelectedUser] = useState(user.id);

  // Load logo once for PDFs
  const loadLogo = (): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img); // Resolve anyway to avoid breaking Promise chain
      img.src = mainLogo;
    });
  };

  // 1. Monthly Department Report
  const exportMonthlyPDF = async () => {
    try {
      const doc = new jsPDF();
      const img = await loadLogo();
      const deptName = departments.find(d => d.id === selectedDept)?.name || "Unknown Department";
      
      const deptEntries = entries.filter(e => e.departmentId === selectedDept && e.status !== "draft");
      const modCounts: Record<string, number> = {};
      deptEntries.forEach(e => {
        modCounts[e.moduleKey] = (modCounts[e.moduleKey] || 0) + 1;
      });

      const tableData = Object.entries(modCounts).map(([key, count]) => {
        return [getModule(key)?.name || key, count.toString()];
      });
      
      if (tableData.length === 0) {
        tableData.push(["No data available for this period", ""]);
      }

      const generatedDate = formatDate(new Date().toISOString());

      autoTable(doc, {
        head: [["Module", "Entries"]],
        body: tableData,
        startY: 50,
        margin: { top: 50 },
        didDrawPage: (data: any) => {
          if (img.complete && img.naturalWidth > 0) {
            doc.addImage(img, 'PNG', 14, 10, 32, 16);
          }
          
          doc.setFontSize(16);
          doc.setTextColor(20);
          doc.text(`Monthly Department Report`, 14, 36);
          
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Department: ${deptName}  |  Generated: ${generatedDate}`, 14, 43);
        }
      });
      
      doc.save(`monthly-report-${selectedDept}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  // 2. Individual Employee Report
  const exportEmployeeExcel = () => {
    const targetUserId = user.role === "employee" ? user.id : selectedUser;
    const empEntries = entries.filter(e => e.authorId === targetUserId && e.status !== "draft");
    const targetUser = users.find(u => u.id === targetUserId);
    
    let data: any[] = empEntries.map(e => {
      const mod = getModule(e.moduleKey);
      return {
        "Entry ID": e.id,
        "Module Name": mod?.name || e.moduleKey,
        "Date": formatDate(e.entryDate),
        "Status": e.status,
        ...e.values
      };
    });
    
    if (data.length === 0) {
      data = [{ "Entry ID": "No data found for this employee", "Module Name": "", "Date": "", "Status": "" }];
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
    XLSX.writeFile(wb, `employee-report-${targetUser?.name.replace(/\s+/g, '-') || 'unknown'}.xlsx`);
  };

  // 3. Weekly Meeting Summary
  const exportMeetingSummary = async () => {
    try {
      const doc = new jsPDF();
      const img = await loadLogo();
      
      const meetingEntries = entries.filter(e => e.moduleKey === "weekly-meeting-report" && e.status !== "draft");
      let tableData = meetingEntries.map(e => {
        const outcomes = typeof e.values["key-outcomes"] === "string" 
          ? e.values["key-outcomes"].replace(/—/g, '-').replace(/–/g, '-') 
          : "";
          
        return [
          formatDate(e.entryDate),
          users.find(u => u.id === e.authorId)?.name || "Unknown",
          e.values["meeting-type"] || "General",
          outcomes
        ];
      });

      if (tableData.length === 0) {
        tableData = [["No data available", "", "", ""]];
      }

      const generatedDate = formatDate(new Date().toISOString());

      autoTable(doc, {
        head: [["Date", "Submitted By", "Type", "Outcomes"]],
        body: tableData,
        startY: 50,
        margin: { top: 50 },
        styles: { overflow: 'linebreak', cellWidth: 'wrap' },
        columnStyles: { 3: { cellWidth: 80 } },
        didDrawPage: (data: any) => {
          if (img.complete && img.naturalWidth > 0) {
            doc.addImage(img, 'PNG', 14, 10, 32, 16);
          }
          
          doc.setFontSize(16);
          doc.setTextColor(20);
          doc.text("Weekly Meeting Summary", 14, 36);
          
          doc.setFontSize(10);
          doc.text(`Generated: ${generatedDate}`, 14, 43);
        }
      });
      
      doc.save(`meeting-summary.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  // 4. 52 Week Calendar
  const exportCalendarExcel = () => {
    let data: any[] = webinarSeries.map(w => ({
      "Series Number": w.seriesNumber,
      "Date": formatDate(w.scheduledDate),
      "Topic": w.topic,
      "Speaker": w.speaker,
      "Designation": w.speakerDesignation,
      "Mode": w.mode,
      "Status": w.status,
      "Notes": w.notes || ""
    }));

    if (data.length === 0) {
      data = [{ "Series Number": "No data available", "Date": "", "Topic": "", "Speaker": "", "Designation": "", "Mode": "", "Status": "", "Notes": "" }];
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Webinar Calendar");
    XLSX.writeFile(wb, "52-week-calendar.xlsx");
  };

  // 5. Full Data Export
  const exportFullData = () => {
    const wb = XLSX.utils.book_new();
    const mods = accessibleModules(user);
    let sheetCount = 0;

    mods.forEach(mod => {
      const modEntries = entries.filter(e => e.moduleKey === mod.key);
      let data: any[] = modEntries.map(e => ({
        "Entry ID": e.id,
        "Date": formatDate(e.entryDate),
        "Author": users.find(u => u.id === e.authorId)?.name || "Unknown",
        "Department": departments.find(d => d.id === e.departmentId)?.name || "Unknown",
        "Status": e.status,
        ...e.values
      }));
      
      if (data.length === 0) {
        data = [{ "Entry ID": "No data found for module", "Date": "", "Author": "", "Department": "", "Status": "" }];
      }
      
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, mod.name.substring(0, 31));
      sheetCount++;
    });

    if (sheetCount === 0) {
      const ws = XLSX.utils.json_to_sheet([{ "Note": "No modules accessible" }]);
      XLSX.utils.book_append_sheet(wb, ws, "Empty Export");
    }
    
    XLSX.writeFile(wb, "full-data-export.xlsx");
  };

  // UI rendering details
  const renderContent = () => {
    switch (activeTab) {
      case "monthly":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Monthly Department Report</h2>
            <p className="text-sm text-muted-foreground">Department-scoped monthly summary.</p>
            {myDepts.length > 0 ? (
              <div className="flex items-center gap-4">
                <select 
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  {myDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={exportMonthlyPDF} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Download className="h-4 w-4" /> Export PDF
                </button>
              </div>
            ) : (
              <p className="text-sm text-red-500">You do not have access to any departments.</p>
            )}
          </div>
        );
      case "employee":
        const deptUsers = user.role === "admin" 
          ? users 
          : user.role === "manager"
          ? users.filter(u => u.departmentIds.some(d => user.departmentIds.includes(d)))
          : [];

        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Individual Employee Report</h2>
            <p className="text-sm text-muted-foreground">Export work data for a specific employee.</p>
            <div className="flex items-center gap-4">
              {user.role === "employee" ? (
                <div className="text-sm font-medium border border-input rounded-md px-3 py-2 bg-muted/50 text-muted-foreground">
                  {user.name} (You)
                </div>
              ) : (
                <select 
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {deptUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.designation})</option>)}
                </select>
              )}
              <button onClick={exportEmployeeExcel} className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                <Download className="h-4 w-4" /> Export Excel
              </button>
            </div>
          </div>
        );
      case "meeting":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Weekly Meeting Summary</h2>
            <p className="text-sm text-muted-foreground">Generate a PDF summary of the Weekly Meeting Report data.</p>
            <button onClick={exportMeetingSummary} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">52 Week Webinar Calendar</h2>
            <p className="text-sm text-muted-foreground">Export the webinar series schedule as an Excel document.</p>
            <button onClick={exportCalendarExcel} className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <Download className="h-4 w-4" /> Export Excel
            </button>
          </div>
        );
      case "export":
        if (user.role !== "admin") return <p className="text-sm text-red-500">Admins only.</p>;
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Full Data Export</h2>
            <p className="text-sm text-muted-foreground">Export all organization-wide data (Excel).</p>
            <button onClick={exportFullData} className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              <Download className="h-4 w-4" /> Export Full Data
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Exports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Department summaries, data exports, and performance analytics.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab("monthly")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "monthly" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <BarChart className="h-4 w-4" /> Monthly Dept Report
          </button>
          <button 
            onClick={() => setActiveTab("employee")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "employee" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Users className="h-4 w-4" /> Employee Report
          </button>
          <button 
            onClick={() => setActiveTab("meeting")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "meeting" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <FileText className="h-4 w-4" /> Weekly Meeting
          </button>
          <button 
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Calendar className="h-4 w-4" /> 52 Week Calendar
          </button>
          {user.role === "admin" && (
            <button 
              onClick={() => setActiveTab("export")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "export" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Download className="h-4 w-4" /> Full Data Export
            </button>
          )}
        </div>
        <div className="flex-1 rounded-lg border border-border bg-background p-6 shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

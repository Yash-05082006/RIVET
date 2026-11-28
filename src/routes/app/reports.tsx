import { DateInput } from "../../components/ui/date-input";
import { entryDisplayId } from "../../lib/rivet/entryId";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { accessibleDepartments, canModule, hasPermission } from "../../lib/rivet/permissions";
import { getModule } from "../../lib/rivet/demo-data";
import { formatDate, matchesEntryDateRange } from "../../lib/formatDate";
import mainLogo from "../../../assets/RIVET_main_logo_removebg.png";
import type { LogEntry } from "../../lib/rivet/types";

export const Route = createFileRoute("/app/reports")({ component: ReportsPage });

const reports = {
  monthly: "Monthly Department Report",
  employee: "Individual Employee Report",
  meeting: "Weekly Meeting Summary",
  calendar: "52 Week Webinar Calendar",
  export: "Full Data Export",
};


const meetingFields = ["physicalMeetings", "onlineMeetings", "calls", "serviceCalls", "serviceMeetings"];
const calendarFields = ["seriesNumber", "scheduledDate", "topic", "speaker", "speakerDesignation", "mode", "status", "notes"];

type Cell = string | number | boolean;
interface ReportSheet {
  name: string;
  columns: string[];
  rows: Cell[][];
}

function ReportsPage() {
  const { visibleEntries, users, departments } = useRivet();
  const user = useCurrentUser();
  const reviewer = hasPermission(user, "review");
  const admin = hasPermission(user, "admin");
  const allowed = {
    monthly: reviewer,
    employee: true,
    meeting: reviewer && canModule(user, "view", "weekly-meeting-report"),
    calendar: canModule(user, "view", "webinar-series-planner"),
    export: admin,
  };
  const availableReports = (Object.keys(reports) as (keyof typeof reports)[]).filter((key) => allowed[key]);
  const [tab, setTab] = useState<keyof typeof reports>(reviewer ? "monthly" : "employee");
  const activeTab = allowed[tab] ? tab : "employee";
  const [month, setMonth] = useState<string | null>(() => new Date().toISOString().slice(0, 7));
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState(user.id);
  const [from, setFrom] = useState<string | null>("");
  const [to, setTo] = useState<string | null>("");
  const scope = accessibleDepartments(user);
  const selectedDepartment = scope.find((department) => department.id === departmentId) ?? scope[0];
  const submitted = visibleEntries.filter((entry) => entry.status !== "draft");
  const employees = reviewer
    ? users.filter((person) => person.id === user.id || person.departmentIds.some((id) => scope.some((department) => department.id === id)) || submitted.some((entry) => entry.authorId === person.id))
    : [user];
  const selectedEmployee = employees.find((person) => person.id === employeeId) ?? user;
  const invalidDate = activeTab === "employee" ? from === null || to === null :
    (activeTab === "monthly" || activeTab === "meeting") && month === null;
  const exportable = !invalidDate && (activeTab !== "employee" || !from || !to || from <= to);

  function moduleSheets(records: LogEntry[]): ReportSheet[] {
    return [...new Set(records.map((entry) => entry.moduleKey))].map((key) => {
      const mod = getModule(key);
      const moduleEntries = records.filter((entry) => entry.moduleKey === key);
      const fields = [...new Set([...(mod?.fields.map((field) => field.key) ?? []), ...moduleEntries.flatMap((entry) => Object.keys(entry.values))])];
      return {
        name: mod?.name ?? key,
        columns: ["Entry ID", "Employee", "Department", "Entry Date", "Approval Status", ...fields.map((field) => mod?.fields.find((item) => item.key === field)?.label ?? field)],
        rows: moduleEntries.map((entry) => [
          entryDisplayId(entry), users.find((person) => person.id === entry.authorId)?.name ?? entry.authorId,
          departments.find((department) => department.id === entry.departmentId)?.name ?? entry.departmentId,
          formatDate(entry.entryDate), entry.status,
          ...fields.map((field) => {
            const type = mod?.fields.find((item) => item.key === field)?.type;
            const value = entry.values[field] ?? "";
            return type === "date" || type === "month" ? formatDate(String(value)) : value;
          }),
        ]),
      };
    });
  }

  let sheets: ReportSheet[];
  switch (activeTab) {
    case "monthly":
      sheets = moduleSheets(month ? submitted.filter((entry) => entry.departmentId === selectedDepartment?.id && entry.entryDate.startsWith(month)) : []);
      break;
    case "employee":
      sheets = moduleSheets(exportable ? submitted.filter((entry) => entry.authorId === selectedEmployee.id &&
        matchesEntryDateRange(entry.entryDate, from ?? "", to ?? "")) : []);
      break;
    case "meeting":
      sheets = [{
        name: "Weekly Meeting Summary",
        columns: ["Entry ID", "Week Ending Date", "Employee", "Physical Meetings", "Online Meetings", "Calls", "Service Calls", "Service Meetings"],
        rows: submitted.filter((entry) => entry.moduleKey === "weekly-meeting-report" && !!month && entry.entryDate.startsWith(month))
          .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
          .map((entry) => [entryDisplayId(entry), formatDate(entry.entryDate), users.find((person) => person.id === entry.authorId)?.name ?? entry.authorId,
            ...meetingFields.map((field) => Number(entry.values[field]) || 0)]),
      }];
      break;
    case "calendar":
      sheets = [{
        name: "Webinar Calendar",
        columns: ["Entry ID", ...calendarFields.map((field) => getModule("webinar-series-planner")?.fields.find((item) => item.key === field)?.label ?? field)],
        rows: submitted.filter((entry) => entry.moduleKey === "webinar-series-planner")
          .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
          .map((entry) => [entryDisplayId(entry), ...calendarFields.map((field) => field === "scheduledDate" ? formatDate(entry.entryDate) : entry.values[field] ?? "")]),
      }];
      break;
    case "export":
      sheets = moduleSheets(visibleEntries);
      break;
  }
  const hasRows = sheets.some((sheet) => sheet.rows.length > 0);

  function downloadExcel() {
    const workbook = XLSX.utils.book_new();
    for (const sheet of sheets) {
      const name = sheet.name.replace(/[\[\]:*?/\\]/g, "-").slice(0, 28) || "Report";
      let unique = name;
      for (let suffix = 2; workbook.SheetNames.some((existing) => existing.toLowerCase() === unique.toLowerCase()); suffix++) {
        const ending = `-${suffix}`;
        unique = name.slice(0, 31 - ending.length) + ending;
      }
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.rows]), unique);
    }
    XLSX.writeFile(workbook, `${activeTab}-report.xlsx`);
  }

  async function downloadPDF() {
    const logo = await new Promise<HTMLImageElement | undefined>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(undefined);
      image.src = mainLogo;
    });
    const doc = new jsPDF({ orientation: "landscape" });
    sheets.forEach((sheet, index) => {
      if (index) doc.addPage();
      autoTable(doc, {
        startY: 43, margin: { top: 43 }, head: [sheet.columns], body: sheet.rows.map((row) => row.map(String)),
        styles: { fontSize: 8 },
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: 0,
        didDrawPage: () => {
          if (logo) doc.addImage(logo, "PNG", 14, 7, 32, 16);
          doc.setFontSize(15);
          doc.text(sheet.name, 14, 30);
          doc.setFontSize(9);
          doc.text(`Generated ${formatDate(new Date().toISOString())}`, 14, 36);
        },
      });
    });
    doc.save(`${activeTab}-report.pdf`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reports & Exports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Department summaries and data exports.</p>
      </div>
      <section className="min-w-0 space-y-5 rounded-lg border border-border bg-background p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-medium">{reports[activeTab]}</h2>
        <div className="flex flex-wrap items-end gap-3 text-sm">
          {availableReports.length > 1 && <label className="grid gap-1">Report
            <select aria-label="Report" className="rounded border bg-background px-2 py-1.5" value={activeTab}
              onChange={(event) => setTab(event.target.value as keyof typeof reports)}>
              {availableReports.map((key) => <option key={key} value={key}>{reports[key]}</option>)}
            </select>
          </label>}
          {activeTab === "monthly" && <label>Department <select value={selectedDepartment?.id ?? ""} onChange={(event) => setDepartmentId(event.target.value)} className="rounded border p-1">
            {scope.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select></label>}
          {(activeTab === "monthly" || activeTab === "meeting") && <label>Month <DateInput monthOnly value={month} onValueChange={setMonth} className="rounded border p-1" /></label>}
          {activeTab === "employee" && <>
            <label>Employee <select value={selectedEmployee.id} onChange={(event) => setEmployeeId(event.target.value)} className="rounded border p-1">
              {employees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select></label>
            <label>From <DateInput value={from} onValueChange={setFrom} className="rounded border p-1" /></label>
            <label>To <DateInput value={to} onValueChange={setTo} className="rounded border p-1" /></label>
          </>}
          <button disabled={!hasRows} onClick={downloadExcel} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"><Download className="h-4 w-4" /> Export Excel</button>
          {(activeTab === "employee" || activeTab === "calendar") && <button disabled={!hasRows} onClick={downloadPDF} className="rounded-md border px-4 py-2 disabled:opacity-50">Export PDF</button>}
        </div>
        {!hasRows && <p className="text-sm text-muted-foreground">{invalidDate ? "Enter a valid date in DD/MM/YYYY format." : !exportable ? "End date must be on or after start date." : "No records match these filters."}
          {activeTab === "monthly" && exportable && " Only submitted or reviewed entries are included. Drafts stay private."}</p>}
        {sheets.filter((sheet) => sheet.rows.length).map((sheet) => <div key={sheet.name} className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <caption className="px-3 py-2 text-left font-medium">{sheet.name}</caption>
            <thead className="bg-surface"><tr>{sheet.columns.map((column, index) => <th key={index} className="whitespace-nowrap px-3 py-2">{column}</th>)}</tr></thead>
            <tbody>{sheet.rows.map((row, index) => <tr key={index} className="border-t">{row.map((cell, column) => <td key={column} className={`px-3 py-2 align-top ${typeof cell === "number" ? "text-right tabular-nums" : "whitespace-pre-wrap"}`}>{String(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>)}
      </section>
    </div>
  );
}

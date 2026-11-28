import type { LogEntry } from "./types";

export function entryDisplayId(entry: Pick<LogEntry, "id" | "displayId">): string {
  return entry.displayId ?? entry.id;
}

export function highestEntryNumber(entries: Pick<LogEntry, "id" | "displayId">[]): number {
  return entries.reduce((highest, entry) => {
    const match = /^E-(\d+)$/.exec(entryDisplayId(entry));
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
}

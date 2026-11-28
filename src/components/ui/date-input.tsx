import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useState, type ComponentProps } from "react";
import { formatDate, parseDisplayDate } from "../../lib/formatDate";

interface DateInputProps extends Omit<ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: string | null;
  onValueChange: (value: string | null) => void;
  monthOnly?: boolean;
}

export function DateInput({ value, onValueChange, monthOnly = false, ...props }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(monthOnly ? `${value}-01` : value) : undefined;
  const [draft, setDraft] = useState<{ text: string; value: string | null }>();
  const text = draft && draft.value === value ? draft.text : formatDate(value);
  return (
    <span className="relative inline-flex max-w-full">
      <input
        {...props}
        className={`${props.className ?? ""} pr-8`}
        type="text"
        placeholder="DD/MM/YYYY"
        value={text}
        aria-invalid={value === null || props["aria-invalid"]}
        title={monthOnly ? "Enter a date in the month as DD/MM/YYYY" : "Enter a date as DD/MM/YYYY"}
        onChange={(event) => {
          const text = event.target.value;
          const iso = parseDisplayDate(text, monthOnly);
          setDraft({ text, value: iso });
          onValueChange(iso);
        }}
        onBlur={(event) => {
          if (value !== null) setDraft(undefined);
          props.onBlur?.(event);
        }}
      />
      {!props.disabled && <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="absolute inset-y-0 right-0 grid w-8 place-items-center rounded text-muted-foreground hover:text-foreground" aria-label="Open calendar">
            <CalendarDays className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" locale={enGB} selected={selected} defaultMonth={selected} onSelect={(day) => {
            if (!day) return;
            setDraft(undefined);
            onValueChange(format(day, monthOnly ? "yyyy-MM" : "yyyy-MM-dd"));
            setOpen(false);
          }} />
        </PopoverContent>
      </Popover>}
    </span>
  );
}

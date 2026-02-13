import * as React from "react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  className,
  id,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue = date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "";

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;
    onChange(format(selected, "yyyy-MM-dd"));
    setOpen(false);
  };

  const [inputValue, setInputValue] = React.useState(displayValue);
  React.useEffect(() => {
    setInputValue(displayValue);
  }, [displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    const formatted = raw
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2");
    setInputValue(formatted);
    if (raw.length === 8) {
      const d = parseInt(raw.slice(0, 2), 10);
      const m = parseInt(raw.slice(2, 4), 10);
      const y = parseInt(raw.slice(4, 8), 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
        onChange(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      }
    } else {
      onChange("");
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        id={id}
        type="text"
        placeholder="DD/MM/AAAA"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={() => setInputValue(displayValue)}
        onFocus={(e) => {
          if (inputValue) e.target.setSelectionRange(0, inputValue.length);
        }}
        maxLength={10}
        disabled={disabled}
        className="flex-1"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

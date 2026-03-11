"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatNumberForInput, parseNumber } from "@/lib/format";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number | string;
  onChange?: (value: number) => void;
  currency?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, currency, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() =>
      value != null && value !== "" ? formatNumberForInput(value) : ""
    );
    const isControlled = value !== undefined;

    React.useEffect(() => {
      if (isControlled) {
        setDisplay(value != null && value !== "" ? formatNumberForInput(value) : "");
      }
    }, [value, isControlled]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const parsed = parseNumber(raw);
      setDisplay(formatNumberForInput(parsed) || raw.replace(/[^\d,.]/g, ""));
      onChange?.(parsed);
    };

    const handleBlur = () => {
      const parsed = parseNumber(display);
      setDisplay(formatNumberForInput(parsed));
    };

    const input = (
      <input
        type="text"
        inputMode="numeric"
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          currency && "pl-8",
          className
        )}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
    if (currency) {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            Rp
          </span>
          {input}
        </div>
      );
    }
    return input;
  }
);
NumberInput.displayName = "NumberInput";

export { NumberInput };

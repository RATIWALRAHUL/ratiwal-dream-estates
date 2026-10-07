"use client";

import React, {
  SelectHTMLAttributes,
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder = "Select an option",
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled,
      required,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    const errorId = `${id}-error`;

    const internalSelectRef = useRef<HTMLSelectElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(
      (value as string) || (defaultValue as string) || ""
    );
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Keep state in sync if controlled externally
    useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(value as string);
      }
    }, [value]);

    // Merge forwarded ref with internal ref
    const setRef = useCallback(
      (node: HTMLSelectElement | null) => {
        internalSelectRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLSelectElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Handle Option Selection
    const handleSelectOption = (optionValue: string) => {
      if (disabled) return;
      setCurrentValue(optionValue);
      setIsOpen(false);

      if (internalSelectRef.current) {
        internalSelectRef.current.value = optionValue;

        // Dispatch synthetic change event for React Hook Form / standard forms
        const event = new Event("change", { bubbles: true });
        internalSelectRef.current.dispatchEvent(event);

        if (onChange) {
          // Create synthetic React ChangeEvent
          const syntheticEvent = {
            target: internalSelectRef.current,
            currentTarget: internalSelectRef.current,
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      }
    };

    // Keyboard accessibility
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelectOption(options[focusedIndex].value);
        } else {
          setIsOpen((prev) => !prev);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Tab") {
        setIsOpen(false);
      }
    };

    // Find current label
    const selectedOption = options.find((opt) => opt.value === currentValue);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;
    const hasSelectedValue = Boolean(selectedOption && currentValue !== "");
    const isPlaceholderActive = !hasSelectedValue;
    const isFloating = isOpen || hasSelectedValue;

    return (
      <div ref={containerRef} className="w-full flex flex-col space-y-1 relative">
        {/* Hidden Native Select for standard HTML form & React Hook Form integration */}
        <select
          ref={setRef}
          id={id}
          value={currentValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Luxury Dropdown Trigger Box */}
        <div className="relative w-full pt-1.5">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full min-h-[48px] px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between gap-2 border border-[1px] bg-white shadow-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
              error
                ? "border-red-500 focus:border-red-500"
                : isOpen
                ? "border-[#087fc3] focus:border-[#087fc3]"
                : "border-slate-300 hover:border-slate-400",
              disabled && "opacity-60 cursor-not-allowed bg-gray-50 border-[rgba(7,26,40,0.14)]",
              className
            )}
            style={{ outline: "none", boxShadow: "none" }}
          >
            <span
              className={cn(
                "truncate block transition-opacity duration-200",
                label && !isFloating
                  ? "opacity-0 select-none"
                  : isPlaceholderActive
                  ? "text-[var(--text-secondary)] font-normal"
                  : "text-[var(--midnight)] font-semibold"
              )}
            >
              {displayLabel}
            </span>

            <ChevronDown
              className={cn(
                "w-4 h-4 text-[var(--ratiwal-blue)] flex-shrink-0 transition-transform duration-300",
                isOpen && "rotate-180 text-[var(--ratiwal-blue-deep)]"
              )}
              aria-hidden="true"
            />
          </button>

          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute transition-all duration-200 ease-out pointer-events-none select-none flex items-center leading-none",
                isFloating
                  ? "top-1.5 -translate-y-1/2 left-3 px-1.5 bg-white text-[11px] sm:text-xs font-bold z-10"
                  : "top-1/2 -translate-y-1/2 left-4 text-xs sm:text-sm font-normal text-[var(--text-secondary)]",
                isFloating
                  ? isOpen
                    ? "text-[var(--ratiwal-blue)]"
                    : error
                    ? "text-red-500"
                    : "text-[var(--midnight)]"
                  : "text-[var(--text-secondary)]"
              )}
            >
              <span>{label}</span>
              {required && isOpen && (
                <span
                  className="text-red-500 ml-1 font-bold text-sm leading-none animate-in fade-in duration-200"
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </label>
          )}

          {/* Floating Custom Menu Overlay */}
          {isOpen && (
            <div
              role="listbox"
              aria-label={label || placeholder}
              className="absolute top-full left-0 right-0 mt-1.5 z-50 p-1.5 bg-white/98 backdrop-blur-xl border border-[rgba(7,26,40,0.1)] rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 [scrollbar-width:thin]"
            >
              {options.map((option, index) => {
                const isSelected = option.value === currentValue;
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectOption(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 select-none",
                      isSelected
                        ? "bg-[var(--mist-blue)] text-[var(--ratiwal-blue-deep)] font-bold"
                        : isFocused
                        ? "bg-[var(--surface)] text-[var(--midnight)] font-medium"
                        : "text-[var(--midnight)] hover:bg-[var(--surface)] hover:text-[var(--ratiwal-blue)]"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--ratiwal-blue)] flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs font-medium text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };

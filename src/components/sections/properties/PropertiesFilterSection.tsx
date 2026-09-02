"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, MapPin, RotateCcw, Building2, ChevronDown, Check, ArrowUpDown } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label?: string;
  icon?: React.ElementType;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  align?: "left" | "right";
}

function FilterDropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  align = "left",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 sm:py-3 rounded-xl bg-[var(--surface)] hover:bg-white border ${
          isOpen
            ? "border-[var(--ratiwal-blue)] bg-white ring-2 ring-[rgba(8,127,195,0.15)] shadow-sm"
            : "border-[rgba(7,26,40,0.08)] hover:border-[rgba(8,127,195,0.3)]"
        } text-xs sm:text-sm font-semibold text-[var(--midnight)] transition-all shadow-2xs text-left cursor-pointer`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && (
            <Icon size={15} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
          )}
          {label && (
            <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium whitespace-nowrap">
              {label}:
            </span>
          )}
          <span className="truncate font-bold text-[var(--midnight)] text-xs sm:text-sm">
            {selectedOption?.label || value}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-[var(--text-secondary)] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--ratiwal-blue)]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute top-[calc(100%+6px)] ${
            align === "right" ? "right-0" : "left-0"
          } z-50 w-full min-w-[210px] max-h-64 overflow-y-auto rounded-xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xl p-1.5 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm text-left transition-colors font-medium ${
                  isSelected
                    ? "bg-[var(--mist-blue)] text-[var(--ratiwal-blue-deep)] font-bold"
                    : "text-[var(--midnight)] hover:bg-[var(--surface)] hover:text-[var(--ratiwal-blue)]"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PropertiesFilterSectionProps {
  properties: Property[];
}

export function PropertiesFilterSection({ properties }: PropertiesFilterSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "name">("featured");

  // Extract unique cities from properties
  const cities = useMemo(() => {
    const unique = Array.from(new Set(properties.map((p) => p.city))).filter(Boolean);
    return ["All", ...unique];
  }, [properties]);

  const propertyTypes = ["All", "Residential Plot", "Commercial Plot"];
  const statuses = ["All", "Available", "Upcoming"];

  // Filter and sort logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Search query match
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchLocation = p.location.toLowerCase().includes(query);
          const matchCity = p.city.toLowerCase().includes(query);
          const matchDesc = p.shortDescription.toLowerCase().includes(query);
          if (!matchName && !matchLocation && !matchCity && !matchDesc) {
            return false;
          }
        }

        // City filter
        if (selectedCity !== "All" && p.city !== selectedCity) {
          return false;
        }

        // Type filter
        if (selectedType !== "All" && p.propertyType !== selectedType) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "All" && p.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "featured") {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [properties, searchQuery, selectedCity, selectedType, selectedStatus, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCity !== "All" ||
    selectedType !== "All" ||
    selectedStatus !== "All";

  function handleReset() {
    setSearchQuery("");
    setSelectedCity("All");
    setSelectedType("All");
    setSelectedStatus("All");
    setSortBy("featured");
  }

  const sortOptions: DropdownOption[] = [
    { label: "Featured First", value: "featured" },
    { label: "Newly Listed", value: "newest" },
    { label: "Property Name (A-Z)", value: "name" },
  ];

  const cityOptions: DropdownOption[] = cities.map((city) => ({
    label: city === "All" ? "All Cities (Location)" : city,
    value: city,
  }));

  const typeOptions: DropdownOption[] = propertyTypes.map((type) => ({
    label: type === "All" ? "All Property Types" : type,
    value: type,
  }));

  return (
    <div className="w-full">
      {/* Interactive Filter Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[rgba(7,26,40,0.1)] shadow-sm mb-8 space-y-4">
        
        {/* Top Row: Search Input & Sort Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          
          {/* Search Field (8 Cols) */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ratiwal-blue)] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plot name, road, corridor, or keyword (e.g. Ajmer Road, Ring Road, Panvel)..."
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] focus:border-[var(--ratiwal-blue)] focus:bg-white text-xs sm:text-sm text-[var(--midnight)] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--midnight)] font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector (4 Cols) with Custom UI */}
          <div className="md:col-span-4">
            <FilterDropdown
              label="Sort by"
              icon={ArrowUpDown}
              value={sortBy}
              options={sortOptions}
              onChange={(val) => setSortBy(val as "featured" | "newest" | "name")}
              ariaLabel="Sort properties"
              align="right"
            />
          </div>

        </div>

        {/* Mobile Dropdowns View (Visible on screens < md) */}
        <div className="md:hidden pt-3 border-t border-[rgba(7,26,40,0.06)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* City Dropdown */}
            <FilterDropdown
              label="City"
              icon={MapPin}
              value={selectedCity}
              options={cityOptions}
              onChange={setSelectedCity}
              ariaLabel="Filter by City"
            />

            {/* Type Dropdown */}
            <FilterDropdown
              label="Type"
              icon={Building2}
              value={selectedType}
              options={typeOptions}
              onChange={setSelectedType}
              ariaLabel="Filter by Property Type"
            />
          </div>

          {/* Reset Filters Action on Mobile */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                Active filters applied
              </span>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors py-1 px-2.5 rounded-lg hover:bg-red-50"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Filter Tabs & Chips (Visible on md+) */}
        <div className="hidden md:flex pt-3 border-t border-[rgba(7,26,40,0.06)] flex-wrap items-center justify-between gap-3">
          
          {/* Location Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--midnight)] mr-1 flex items-center gap-1">
              <MapPin size={13} className="text-[var(--ratiwal-blue)]" />
              City:
            </span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCity === city
                    ? "bg-[var(--ratiwal-blue)] text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--mist-blue)]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--midnight)] mr-1 flex items-center gap-1">
              <Building2 size={13} className="text-[var(--ratiwal-blue)]" />
              Type:
            </span>
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedType === type
                    ? "bg-[var(--midnight)] text-white shadow-xs"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--mist-blue)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors ml-auto"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
          Showing <strong className="text-[var(--midnight)]">{filteredProperties.length}</strong> verified {filteredProperties.length === 1 ? "land opportunity" : "land opportunities"}
        </div>
        {selectedCity !== "All" && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)]">
            Filtered by: {selectedCity}
          </span>
        )}
      </div>

      {/* Property Cards Grid or Empty State */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          title="No Plots Matching Your Criteria"
          description="We couldn't find any land parcels matching your exact filters. Try clearing your search query or selecting a different location."
          actionLabel="Reset Search Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-14">
          {filteredProperties.map((property) => (
            <div key={property.id} className="h-full">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

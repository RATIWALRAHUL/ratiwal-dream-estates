"use client";

import React, { useState, useMemo } from "react";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, MapPin, RotateCcw, Building2 } from "lucide-react";

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
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] focus:border-[var(--ratiwal-blue)] focus:bg-white text-xs sm:text-sm text-[var(--midnight)] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--midnight)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector (4 Cols) */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "newest" | "name")}
              aria-label="Sort properties"
              className="w-full py-3 px-3.5 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] text-xs sm:text-sm font-semibold text-[var(--midnight)] outline-none cursor-pointer focus:border-[var(--ratiwal-blue)]"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newly Listed</option>
              <option value="name">Property Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Bottom Row: Filter Tabs & Chips */}
        <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex flex-wrap items-center justify-between gap-3">
          
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

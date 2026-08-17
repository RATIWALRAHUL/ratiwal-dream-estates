"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronDown, IndianRupee, Loader2, MapPin, Search } from "lucide-react";
import type { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/PropertyCard";

type Option = { label: string; value: string };

function SearchDropdown({ label, value, options, icon: Icon, onChange }: { label: string; value: string; options: Option[]; icon: typeof MapPin; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  return <div className={`search-dropdown ${open ? "is-open" : ""}`} ref={root} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
    <span className="search-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.5}/></span>
    <button type="button" className="dropdown-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}><span className="search-field"><span>{label}</span><strong>{selected.label}</strong></span><ChevronDown className="select-chevron" size={15}/></button>
    {open && <div className="dropdown-menu" role="listbox" aria-label={label}>{options.map((option) => <button type="button" role="option" aria-selected={value === option.value} key={option.value || "all"} onClick={() => { onChange(option.value); setOpen(false); }}><span>{option.label}</span>{value === option.value && <Check size={15}/>}</button>)}</div>}
  </div>;
}

export function HomeSearch({ properties }: { properties: Property[] }) {
  const [location, setLocation] = useState(""); const [type, setType] = useState(""); const [budget, setBudget] = useState(""); const [submitted, setSubmitted] = useState(false); const [isSearching, setIsSearching] = useState(false);
  const locations = useMemo<Option[]>(() => [{ label: "City or area", value: "" }, ...Array.from(new Set(properties.map((p) => p.city))).map((city) => ({ label: city, value: city }))], [properties]);
  const propertyTypes = useMemo<Option[]>(() => [{ label: "All types", value: "" }, ...Array.from(new Set(properties.map((p) => p.propertyType))).map((item) => ({ label: item, value: item }))], [properties]);
  const budgets = useMemo<Option[]>(() => [{ label: "Any budget", value: "" }, ...Array.from(new Set(properties.map((p) => p.priceLabel))).map((item) => ({ label: item, value: item }))], [properties]);
  const matches = useMemo(() => properties.filter((p) => (!location || `${p.location} ${p.city} ${p.state}`.toLowerCase().includes(location.toLowerCase())) && (!type || p.propertyType === type) && (!budget || p.priceLabel === budget)), [location, type, budget, properties]);
  function submit(event: FormEvent) { event.preventDefault(); if (isSearching) return; setIsSearching(true); window.setTimeout(() => { setIsSearching(false); setSubmitted(true); requestAnimationFrame(() => document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" })); }, 250); }
  function clearFilters() { setLocation(""); setType(""); setBudget(""); setSubmitted(false); }
  return <section className="search-region" aria-label="Property search"><form className="search-bar" onSubmit={submit}>
    <SearchDropdown label="Location" value={location} options={locations} icon={MapPin} onChange={setLocation}/><SearchDropdown label="Property type" value={type} options={propertyTypes} icon={Building2} onChange={setType}/><SearchDropdown label="Price range" value={budget} options={budgets} icon={IndianRupee} onChange={setBudget}/>
    <button type="submit" disabled={isSearching} aria-busy={isSearching}>{isSearching ? <Loader2 size={18} className="spin"/> : <Search size={18}/>} Search</button></form>
    {submitted && <div id="search-results" className="search-results" aria-live="polite"><div className="section-heading-row"><div><p className="eyebrow">Search results</p><h2>{matches.length ? `${matches.length} ${matches.length === 1 ? "property" : "properties"} found` : "No matching properties"}</h2></div><button type="button" className="text-link" onClick={() => setSubmitted(false)}>Close results</button></div>{matches.length ? <div className="property-grid">{matches.map((property) => <PropertyCard property={property} key={property.id}/>)}</div> : <div className="empty-results"><p>No properties match the selected filters.</p><button type="button" className="text-link" onClick={clearFilters}>Clear filters</button></div>}</div>}
  </section>;
}

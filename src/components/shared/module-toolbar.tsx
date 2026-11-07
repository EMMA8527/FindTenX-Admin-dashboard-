"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModuleToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filter,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "Filter",
  trailing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filter?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { label: string; value: string }[];
  filterPlaceholder?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 bg-card pl-9 text-base md:text-sm"
        />
      </div>
      {filterOptions && onFilterChange ? (
        <Select
          value={filter}
          onValueChange={(v) => {
            if (v == null || v === "") return;
            onFilterChange(String(v));
          }}
        >
          <SelectTrigger className="h-11 w-full bg-card sm:w-[200px]">
            <SelectValue placeholder={filterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {trailing}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface AnalyticsFiltersProps {
  yearsList: string[];
}

export default function AnalyticsFilters({ yearsList }: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [month, setMonth] = useState<string>("any");
  const [year, setYear] = useState<string>("any");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("month");
    params.delete("year");

    if (month !== "any") params.set("month", month);
    if (year !== "any") params.set("year", year);

    router.push(`/analytics?${params.toString()}`);
  }, [month, year, router, searchParams]);

  const goToActivity = useCallback(() => {
    const params = new URLSearchParams();

    if (month !== "any") params.set("month", month);
    if (year !== "any") params.set("year", year);

    router.push(`/activity?${params.toString()}`);
  }, [month, year, router]);

  return (
    <div className="w-full flex justify-start">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
        {/* Month */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Month</label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-8 w-36 px-2 text-sm border-gray-300">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {new Date(2000, i, 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Year</label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-8 w-28 px-2 text-sm border-gray-300">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {yearsList.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-5 md:mt-0">
          <Button size="sm" className="h-8 px-4" onClick={applyFilters}>
            Apply
          </Button>
          {/* <Button size="sm" variant="secondary" className="h-8 px-4" onClick={goToActivity}>
            Details
          </Button> */}
        </div>
      </div>
    </div>
  );
}

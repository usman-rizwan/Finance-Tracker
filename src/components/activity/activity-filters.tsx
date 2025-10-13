'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { CalendarIcon, Filter, RotateCcw, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { TransactionType } from '@prisma/client';

interface Props {
  searchParams: any;
  userId: string;
}

export function ActivityFilters({ searchParams, userId }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [localFilters, setLocalFilters] = useState({
    type: searchParams.type || 'ALL',
    period: searchParams.period || 'month',
    year: searchParams.year || new Date().getFullYear().toString(),
    month: searchParams.month || (new Date().getMonth() + 1).toString(),
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || ''
  });

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: searchParams.startDate ? new Date(searchParams.startDate) : undefined,
    to: searchParams.endDate ? new Date(searchParams.endDate) : undefined
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  const applyFilters = () => {
    startTransition(() => {
      const newParams = new URLSearchParams();

      if (localFilters.type !== 'ALL') {
        newParams.set('type', localFilters.type);
      }

      newParams.set('period', localFilters.period);

      if (localFilters.period === 'custom') {
        if (dateRange.from) newParams.set('startDate', format(dateRange.from, 'yyyy-MM-dd'));
        if (dateRange.to) newParams.set('endDate', format(dateRange.to, 'yyyy-MM-dd'));
      } else {
        newParams.set('year', localFilters.year);
        if (localFilters.period === 'month') {
          newParams.set('month', localFilters.month);
        }
      }

      router.push(`/activity?${newParams.toString()}`);
    });
  };

  const clearFilters = () => {
    setLocalFilters({
      type: 'ALL',
      period: 'month',
      year: currentYear.toString(),
      month: (new Date().getMonth() + 1).toString(),
      startDate: '',
      endDate: ''
    });
    setDateRange({});

    startTransition(() => {
      router.push('/activity');
    });
  };

  const hasChanges = () => {
    const currentType = searchParams.type || 'ALL';
    const currentPeriod = searchParams.period || 'month';
    const currentYear = searchParams.year || new Date().getFullYear().toString();
    const currentMonth = searchParams.month || (new Date().getMonth() + 1).toString();

    return (
      localFilters.type !== currentType ||
      localFilters.period !== currentPeriod ||
      localFilters.year !== currentYear ||
      localFilters.month !== currentMonth ||
      (localFilters.period === 'custom' && (
        (dateRange.from && format(dateRange.from, 'yyyy-MM-dd') !== searchParams.startDate) ||
        (dateRange.to && format(dateRange.to, 'yyyy-MM-dd') !== searchParams.endDate)
      ))
    );
  };

  return (
    <Card className="border-slate-200 shadow-sm bg-white cursor-pointer">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          Filter Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 ">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Transaction Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: 'ALL', label: 'All Types', color: 'slate', bgColor: 'bg-slate-600' },
                { value: 'INCOME', label: 'Income', color: 'emerald', bgColor: 'bg-emerald-600' },
                { value: 'EXPENSE', label: 'Expense', color: 'red', bgColor: 'bg-red-600' },
                { value: 'TRANSFER', label: 'Transfer', color: 'blue', bgColor: 'bg-blue-600' },
                { value: 'ADJUSMENT', label: 'Adjustment', color: 'purple', bgColor: 'bg-purple-600' }
              ].map((type) => (
                <Button
                  key={type.value}
                  variant={localFilters.type === type.value ? 'default' : 'outline'}
                  onClick={() => setLocalFilters(prev => ({ ...prev, type: type.value }))}
                  className={cn(
                    "h-11 font-medium transition-all duration-200 cursor-pointer",
                    localFilters.type === type.value
                      ? `${type.bgColor} hover:bg-${type.color}-700 text-white border-${type.color}-600 shadow-sm`
                      : `hover:bg-${type.color}-50 hover:text-${type.color}-700 hover:border-${type.color}-300 text-slate-700`
                  )}
                  disabled={isPending}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Period Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
            {/* Period Type */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">Time Period</label>
              <Select
                value={localFilters.period}
                onValueChange={(period) => setLocalFilters(prev => ({ ...prev, period }))}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly View</SelectItem>
                  <SelectItem value="year">Yearly View</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Selector */}
            {(localFilters.period === 'year' || localFilters.period === 'month') && (
              <div className="space-y-3 ">
                <label className="text-sm font-semibold text-slate-700 block">Year</label>
                <Select
                  value={localFilters.year}
                  onValueChange={(year) => setLocalFilters(prev => ({ ...prev, year }))}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Month Selector */}
            {localFilters.period === 'month' && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 block">Month</label>
                <Select
                  value={localFilters.month}
                  onValueChange={(month) => setLocalFilters(prev => ({ ...prev, month }))}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Date Range */}
            {localFilters.period === 'custom' && (
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 justify-start text-left font-normal border-slate-300 hover:border-slate-400",
                        !dateRange.from && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-slate-500" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                        ) : (
                          format(dateRange.from, 'MMM dd, yyyy')
                        )
                      ) : (
                        'Select date range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 shadow-lg border-slate-200" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange(range || {})}
                      numberOfMonths={2}
                      className="rounded-lg"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <Button
                onClick={applyFilters}
                disabled={isPending || !hasChanges()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 h-11 font-medium shadow-sm"
              >
                <Search className="w-4 h-4 mr-2" />
                {isPending ? 'Applying...' : 'Apply Filters'}
              </Button>

              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={isPending}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 h-11 font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {hasChanges() && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                You have unsaved filter changes
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
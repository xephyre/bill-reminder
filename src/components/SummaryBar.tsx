import { Bill } from '../types/bill';
import { formatCurrency } from '../utils/bills';

interface SummaryBarProps {
  bills: Bill[];
  currentMonthLabel: string;
}

export function SummaryBar({ bills, currentMonthLabel }: SummaryBarProps) {
  const totalCount = bills.length;
  const paidBills = bills.filter((b) => b.paid);
  const unpaidBills = bills.filter((b) => !b.paid);

  const paidCount = paidBills.length;
  const unpaidCount = unpaidBills.length;

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const unpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <section
      aria-label="Monthly bill summary"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="px-5 sm:px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">{currentMonthLabel}</p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mt-0.5 tabular-nums">
            {totalCount === 0
              ? 'No bills scheduled this month'
              : `${paidCount} of ${totalCount} ${totalCount === 1 ? 'bill' : 'bills'} paid`}
          </h1>
        </div>
        {totalCount > 0 && (
          <p className="text-sm text-slate-600 tabular-nums">
            <span className="font-mono font-medium text-slate-900">{progressPercent}%</span> settled
          </p>
        )}
      </div>

      <div className="px-5 sm:px-6 pb-5">
        <div
          className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Bills paid progress"
        >
          <div
            className="h-full bg-emerald-600 rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="px-5 sm:px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Total This Month</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {totalCount} {totalCount === 1 ? 'bill' : 'bills'}
            </span>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4">
          <p className="text-xs font-medium text-emerald-700">Paid</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="font-mono text-lg font-semibold text-emerald-700 tabular-nums">
              {formatCurrency(paidAmount)}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {paidCount} paid
            </span>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Unpaid Remaining</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
              {formatCurrency(unpaidAmount)}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {unpaidCount} unpaid
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

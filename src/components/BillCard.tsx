import { Trash2 } from 'lucide-react';
import { Bill } from '../types/bill';
import { formatCurrency, formatOrdinalDay, getDueStatus } from '../utils/bills';

interface BillCardProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BillCard({ bill, onTogglePaid, onDelete }: BillCardProps) {
  const dueStatus = getDueStatus(bill.dueDay, bill.paid);

  const statusTextClass =
    dueStatus.tone === 'paid'
      ? 'text-emerald-700'
      : dueStatus.tone === 'overdue'
      ? 'text-red-600 font-medium'
      : dueStatus.tone === 'soon'
      ? 'text-amber-700 font-medium'
      : 'text-slate-500';

  return (
    <article
      className={`bg-white border rounded-xl px-5 py-4 transition-colors duration-150 ${
        bill.paid ? 'border-slate-200/80 bg-slate-50/40' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-semibold truncate ${
              bill.paid ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'
            }`}
          >
            {bill.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            <span className="tabular-nums">Due {formatOrdinalDay(bill.dueDay)} of month</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className={statusTextClass}>{dueStatus.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span
            className={`font-mono text-base sm:text-lg font-medium tabular-nums ${
              bill.paid ? 'text-slate-500' : 'text-slate-900'
            }`}
          >
            {formatCurrency(bill.amount)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={bill.paid}
              aria-label={`Mark ${bill.name} as ${bill.paid ? 'unpaid' : 'paid'}`}
              onClick={() => onTogglePaid(bill.id)}
              className={`inline-flex items-center gap-2.5 min-h-[40px] px-3 py-2 rounded-lg border text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 ${
                bill.paid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-150 ${
                  bill.paid ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full bg-white shadow-xs transition-transform duration-150 ${
                    bill.paid ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </span>
              <span>Paid</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(bill.id)}
              aria-label={`Delete ${bill.name}`}
              title={`Delete ${bill.name}`}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 shrink-0"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

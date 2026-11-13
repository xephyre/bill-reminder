import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { AddBillModal } from './components/AddBillModal';
import { BillCard } from './components/BillCard';
import { SummaryBar } from './components/SummaryBar';
import { Bill, BillFilter } from './types/bill';
import { getSampleBills, loadBills, saveBills, sortBillsAscending } from './utils/bills';

export default function App() {
  const [bills, setBills] = useState<Bill[]>(() => loadBills());
  const [filter, setFilter] = useState<BillFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletedBill, setDeletedBill] = useState<Bill | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const currentMonthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const sortedBills = useMemo(() => sortBillsAscending(bills), [bills]);

  const filteredBills = useMemo(() => {
    if (filter === 'paid') return sortedBills.filter((b) => b.paid);
    if (filter === 'unpaid') return sortedBills.filter((b) => !b.paid);
    return sortedBills;
  }, [sortedBills, filter]);

  const paidCount = useMemo(() => bills.filter((b) => b.paid).length, [bills]);
  const unpaidCount = bills.length - paidCount;

  const handleAddBill = (input: { name: string; amount: number; dueDay: number }) => {
    const newBill: Bill = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name,
      amount: input.amount,
      dueDay: input.dueDay,
      paid: false,
    };

    setBills((prev) => sortBillsAscending([...prev, newBill]));
  };

  const handleTogglePaid = (id: string) => {
    setBills((prev) =>
      prev.map((bill) => (bill.id === id ? { ...bill, paid: !bill.paid } : bill))
    );
  };

  const handleDeleteBill = (id: string) => {
    const target = bills.find((b) => b.id === id);
    if (!target) return;

    setBills((prev) => prev.filter((bill) => bill.id !== id));
    setDeletedBill(target);

    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = window.setTimeout(() => {
      setDeletedBill(null);
      undoTimerRef.current = null;
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!deletedBill) return;
    setBills((prev) => sortBillsAscending([...prev, deletedBill]));
    setDeletedBill(null);
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const handleResetAllUnpaid = () => {
    setBills((prev) => prev.map((bill) => ({ ...bill, paid: false })));
  };

  const handleLoadSampleBills = () => {
    setBills(getSampleBills());
    setFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Bill Ledger
          </span>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Bill</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <SummaryBar bills={bills} currentMonthLabel={currentMonthLabel} />

        <section aria-label="Recurring monthly bills" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recurring Bills</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sorted by due date ascending
              </p>
            </div>

            {bills.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <div
                  role="tablist"
                  aria-label="Filter bills by payment status"
                  className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={filter === 'all'}
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      filter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({bills.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={filter === 'unpaid'}
                    onClick={() => setFilter('unpaid')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      filter === 'unpaid'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unpaid ({unpaidCount})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={filter === 'paid'}
                    onClick={() => setFilter('paid')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      filter === 'paid'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paid ({paidCount})
                  </button>
                </div>

                {paidCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAllUnpaid}
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    title="Reset all bills to unpaid for a new month"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Mark All Unpaid</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {bills.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-14 text-center">
              <h3 className="text-base font-semibold text-slate-900">
                No monthly bills added yet
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
                Add your recurring bills with their due day and amount to keep track of what is paid each month.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add Your First Bill</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleBills}
                  className="inline-flex items-center min-h-[40px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Load Sample Bills
                </button>
              </div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                {filter === 'unpaid'
                  ? 'All monthly bills are marked paid.'
                  : 'No bills have been marked paid yet.'}
              </p>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-4 inline-flex items-center min-h-[40px] px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Show All Bills
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={handleTogglePaid}
                  onDelete={handleDeleteBill}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {deletedBill && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm"
        >
          <span className="truncate max-w-[220px]">Removed {deletedBill.name}</span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Undo
          </button>
        </div>
      )}

      <AddBillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBill={handleAddBill}
      />
    </div>
  );
}

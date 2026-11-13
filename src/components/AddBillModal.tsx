import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBill: (bill: { name: string; amount: number; dueDay: number }) => void;
}

export function AddBillModal({ isOpen, onClose, onAddBill }: AddBillModalProps) {
  const [name, setName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dueDayInput, setDueDayInput] = useState('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string; dueDay?: string }>({});

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setName('');
    setAmountInput('');
    setDueDayInput('');
    setErrors({});

    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedAmount = Number.parseFloat(amountInput);
    const parsedDueDay = Number(dueDayInput);

    const nextErrors: { name?: string; amount?: string; dueDay?: string } = {};

    if (!trimmedName) {
      nextErrors.name = 'Enter a bill name.';
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = 'Enter an amount greater than $0.00.';
    }

    if (
      dueDayInput.trim() === '' ||
      !Number.isInteger(parsedDueDay) ||
      parsedDueDay < 1 ||
      parsedDueDay > 31
    ) {
      nextErrors.dueDay = 'Enter a day between 1 and 31.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAddBill({
      name: trimmedName,
      amount: Math.round(parsedAmount * 100) / 100,
      dueDay: parsedDueDay,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-bill-title"
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="add-bill-title" className="text-lg font-semibold text-slate-900">
            Add Monthly Bill
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] -mr-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          <div>
            <label htmlFor="bill-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Bill Name
            </label>
            <input
              ref={nameInputRef}
              id="bill-name"
              type="text"
              maxLength={60}
              placeholder="e.g., Rent, Electric Utility, Internet"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`w-full h-11 px-3.5 text-sm text-slate-900 bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bill-amount" className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-500 font-mono"
                >
                  $
                </span>
                <input
                  id="bill-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  className={`w-full h-11 pl-7 pr-3.5 font-mono text-sm text-slate-900 bg-white border rounded-lg tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 ${
                    errors.amount ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.amount && <p className="mt-1.5 text-xs text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="bill-due-day" className="block text-sm font-medium text-slate-700 mb-1.5">
                Due Day (1–31)
              </label>
              <input
                id="bill-due-day"
                type="number"
                min="1"
                max="31"
                step="1"
                inputMode="numeric"
                placeholder="15"
                value={dueDayInput}
                onChange={(e) => {
                  setDueDayInput(e.target.value);
                  if (errors.dueDay) setErrors((prev) => ({ ...prev, dueDay: undefined }));
                }}
                className={`w-full h-11 px-3.5 font-mono text-sm text-slate-900 bg-white border rounded-lg tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 ${
                  errors.dueDay ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.dueDay && <p className="mt-1.5 text-xs text-red-600">{errors.dueDay}</p>}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
            >
              Save Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

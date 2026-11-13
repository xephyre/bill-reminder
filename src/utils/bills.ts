import { Bill } from '../types/bill';

const STORAGE_KEY = 'bill_ledger_bills_v1';

const DEFAULT_BILLS: Bill[] = [
  {
    id: 'bill-rent',
    name: 'Apartment Rent',
    amount: 1650.0,
    dueDay: 1,
    paid: true,
  },
  {
    id: 'bill-internet',
    name: 'Fiber Internet',
    amount: 75.0,
    dueDay: 6,
    paid: true,
  },
  {
    id: 'bill-electric',
    name: 'Electric & Gas Utility',
    amount: 142.5,
    dueDay: 10,
    paid: true,
  },
  {
    id: 'bill-insurance',
    name: 'Auto Insurance',
    amount: 128.0,
    dueDay: 15,
    paid: false,
  },
  {
    id: 'bill-mobile',
    name: 'Mobile Phone Plan',
    amount: 65.0,
    dueDay: 24,
    paid: false,
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOrdinalDay(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function sortBillsAscending(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => {
    if (a.dueDay !== b.dueDay) {
      return a.dueDay - b.dueDay;
    }
    return a.name.localeCompare(b.name);
  });
}

export interface DueStatus {
  label: string;
  tone: 'paid' | 'overdue' | 'soon' | 'upcoming';
}

export function getDueStatus(dueDay: number, paid: boolean, referenceDate: Date = new Date()): DueStatus {
  if (paid) {
    return { label: 'Paid this month', tone: 'paid' };
  }

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const effectiveDueDay = Math.min(dueDay, daysInMonth);
  const currentDay = referenceDate.getDate();
  const diff = effectiveDueDay - currentDay;

  if (diff < 0) {
    const daysLate = Math.abs(diff);
    return {
      label: daysLate === 1 ? 'Overdue by 1 day' : `Overdue by ${daysLate} days`,
      tone: 'overdue',
    };
  }
  if (diff === 0) {
    return { label: 'Due today', tone: 'soon' };
  }
  if (diff <= 3) {
    return {
      label: diff === 1 ? 'Due tomorrow' : `Due in ${diff} days`,
      tone: 'soon',
    };
  }
  return { label: `Due in ${diff} days`, tone: 'upcoming' };
}

export function loadBills(): Bill[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BILLS));
      return sortBillsAscending(DEFAULT_BILLS);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return sortBillsAscending(DEFAULT_BILLS);
    }
    const sanitized: Bill[] = parsed
      .filter(
        (item): item is Bill =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.amount === 'number' &&
          Number.isFinite(item.amount) &&
          typeof item.dueDay === 'number' &&
          Number.isInteger(item.dueDay) &&
          item.dueDay >= 1 &&
          item.dueDay <= 31 &&
          typeof item.paid === 'boolean'
      );
    return sortBillsAscending(sanitized);
  } catch {
    return sortBillsAscending(DEFAULT_BILLS);
  }
}

export function saveBills(bills: Bill[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function getSampleBills(): Bill[] {
  return sortBillsAscending(
    DEFAULT_BILLS.map((bill) => ({
      ...bill,
      id: `${bill.id}-${Date.now()}`,
    }))
  );
}

import React from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  ShoppingBag,
  CreditCard,
  Bell,
  ArrowRight,
  User,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { AppData, CoupleUser, ShoppingItem, Reminder, WorkShift } from '../types.js';

interface DashboardProps {
  data: AppData;
  currentUser: CoupleUser;
  setActiveTab: (tab: string) => void;
  onToggleShoppingItem: (id: string, purchased: boolean) => void;
  onToggleReminder: (id: string, completed: boolean) => void;
}

export default function Dashboard({
  data,
  currentUser,
  setActiveTab,
  onToggleShoppingItem,
  onToggleReminder
}: DashboardProps) {
  // Get today's date formatted as YYYY-MM-DD
  const todayStr = '2026-07-04'; // Fixed context date
  const tomorrowStr = '2026-07-05';

  const userNames = data.userNames || ['Sofía', 'Mateo'];
  const user1 = userNames[0];
  const user2 = userNames[1];

  // 1. Calculate Upcoming Shifts
  const getShiftForDate = (user: CoupleUser, dateStr: string) => {
    return data.shifts.find(s => s.user === user && s.date === dateStr);
  };

  const sofiaTodayShift = getShiftForDate(user1, todayStr);
  const mateoTodayShift = getShiftForDate(user2, todayStr);
  const sofiaTomorrowShift = getShiftForDate(user1, tomorrowStr);
  const mateoTomorrowShift = getShiftForDate(user2, tomorrowStr);

  // 2. Filter Upcoming Reminders (uncompleted, sorted by date)
  const pendingReminders = data.reminders
    .filter(r => !r.completed)
    .slice(0, 3);

  // 3. Filter Pending Shopping Items
  const pendingShopping = data.shoppingList
    .filter(item => !item.purchased)
    .slice(0, 3);

  // 4. Monthly Expenses & Balance
  const currentMonthExpenses = data.expenses.filter(e => {
    // Check if expense is in July 2026 (or current seed month)
    return e.date.startsWith('2026-07') && e.type === 'gasto';
  });

  const totalMonthExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate balance between both (only expenses count for owing)
  const paidBySofia = data.expenses
    .filter(e => e.type === 'gasto' && e.paidBy === user1)
    .reduce((sum, e) => sum + e.amount, 0);

  const paidByMateo = data.expenses
    .filter(e => e.type === 'gasto' && e.paidBy === user2)
    .reduce((sum, e) => sum + e.amount, 0);

  let balanceText = '';
  let balanceAmount = 0;
  let debtor: CoupleUser | null = null;
  let creditor: CoupleUser | null = null;

  if (paidBySofia > paidByMateo) {
    balanceAmount = (paidBySofia - paidByMateo) / 2;
    debtor = user2;
    creditor = user1;
    balanceText = `${user2} le debe ${balanceAmount.toFixed(2)}€ a ${user1}`;
  } else if (paidByMateo > paidBySofia) {
    balanceAmount = (paidByMateo - paidBySofia) / 2;
    debtor = user1;
    creditor = user2;
    balanceText = `${user1} le debe ${balanceAmount.toFixed(2)}€ a ${user2}`;
  } else {
    balanceText = '¡Están al día!';
  }

  // Shift Badge color mapping
  const getShiftBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mañana':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30';
      case 'tarde':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/30';
      case 'noche':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/30';
      case 'partido':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/30';
      case 'vacaciones':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30';
      case 'festivos':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/30';
      case 'libranzas':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/50';
      default:
        return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/30';
    }
  };

  // Turn string into capital first letter
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6 px-4 py-3 max-w-lg mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/10 p-5 dark:from-pink-950/20 dark:via-zinc-900">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> BIENVENIDO A NUESTRO HOGAR
            </span>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
              ¡Hola, {currentUser}! 👋
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Hoy es Sábado, 4 de Julio de 2026. Tienen un día espléndido por delante en pareja.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Shifts Summary */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-500" /> Turnos de Hoy y Mañana
          </h3>
          <button
            onClick={() => setActiveTab('calendario')}
            className="text-xs font-medium text-pink-600 dark:text-pink-400 flex items-center gap-0.5 hover:underline"
          >
            Ver calendario <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Sofía Shift Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{user1}</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Hoy</span>
                <span className={`inline-block text-xs px-2 py-0.5 mt-0.5 rounded-full border ${getShiftBadgeColor(sofiaTodayShift?.type || 'libranzas')}`}>
                  {cap(sofiaTodayShift?.type || 'libranzas')}
                </span>
                {sofiaTodayShift?.note && (
                  <p className="text-[10px] text-zinc-500 mt-1 italic line-clamp-1">"{sofiaTodayShift.note}"</p>
                )}
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Mañana</span>
                <span className={`inline-block text-xs px-2 py-0.5 mt-0.5 rounded-full border ${getShiftBadgeColor(sofiaTomorrowShift?.type || 'libranzas')}`}>
                  {cap(sofiaTomorrowShift?.type || 'libranzas')}
                </span>
              </div>
            </div>
          </div>

          {/* Mateo Shift Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{user2}</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Hoy</span>
                <span className={`inline-block text-xs px-2 py-0.5 mt-0.5 rounded-full border ${getShiftBadgeColor(mateoTodayShift?.type || 'libranzas')}`}>
                  {cap(mateoTodayShift?.type || 'libranzas')}
                </span>
                {mateoTodayShift?.note && (
                  <p className="text-[10px] text-zinc-500 mt-1 italic line-clamp-1">"{mateoTodayShift.note}"</p>
                )}
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Mañana</span>
                <span className={`inline-block text-xs px-2 py-0.5 mt-0.5 rounded-full border ${getShiftBadgeColor(mateoTomorrowShift?.type || 'libranzas')}`}>
                  {cap(mateoTomorrowShift?.type || 'libranzas')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Row: Financial Summary & Balance */}
      <section className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" /> Finanzas Compartidas (Julio)
          </h3>
          <button
            onClick={() => setActiveTab('gastos')}
            className="text-xs font-medium text-pink-600 dark:text-pink-400 flex items-center gap-0.5 hover:underline"
          >
            Ver gastos <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-zinc-200 dark:divide-zinc-700/60">
          <div className="space-y-0.5">
            <span className="text-[11px] text-zinc-400 block">Gasto Total del Mes</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {totalMonthExpenses.toFixed(2)}€
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> 50% cada uno
            </span>
          </div>
          <div className="pl-4 space-y-1">
            <span className="text-[11px] text-zinc-400 block">Balance de Cuentas</span>
            {debtor ? (
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${currentUser === debtor ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {currentUser === debtor ? (
                    <>Debes {balanceAmount.toFixed(2)}€ a {creditor}</>
                  ) : (
                    <>{creditor} te debe {balanceAmount.toFixed(2)}€</>
                  )}
                </span>
                <p className="text-[10px] text-zinc-500 leading-none">
                  Saldar cuentas con Bizum en un clic.
                </p>
              </div>
            ) : (
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">
                🎉 Estás al día con tus gastos.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Two Columns: Shopping List and Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shopping Card Column */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-sky-500" /> COMPRA PENDIENTE
            </h4>
            <button
              onClick={() => setActiveTab('compra')}
              className="text-[11px] font-medium text-pink-600 dark:text-pink-400 hover:underline flex items-center"
            >
              Comprar <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {pendingShopping.length > 0 ? (
            <ul className="space-y-2">
              {pendingShopping.map(item => (
                <li
                  key={item.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 hover:border-pink-200 dark:hover:border-pink-900/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    onChange={() => onToggleShoppingItem(item.id, !item.purchased)}
                    className="w-4 h-4 rounded-md border-zinc-300 dark:border-zinc-700 text-pink-500 focus:ring-pink-500 mt-0.5 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {item.quantity} • {item.section}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-2xl mb-1">🛒</span>
              <p className="text-xs text-zinc-400">¡Nevera llena! No hay compras pendientes.</p>
            </div>
          )}
        </div>

        {/* Reminders Card Column */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" /> RECORDATORIOS
            </h4>
            <button
              onClick={() => setActiveTab('recordatorios')}
              className="text-[11px] font-medium text-pink-600 dark:text-pink-400 hover:underline flex items-center"
            >
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {pendingReminders.length > 0 ? (
            <ul className="space-y-2">
              {pendingReminders.map(rem => (
                <li
                  key={rem.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 hover:border-pink-200 dark:hover:border-pink-900/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={rem.completed}
                    onChange={() => onToggleReminder(rem.id, !rem.completed)}
                    className="w-4 h-4 rounded-md border-zinc-300 dark:border-zinc-700 text-pink-500 focus:ring-pink-500 mt-0.5 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block truncate">
                      {rem.description}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      Vence: {rem.dueDate === todayStr ? 'Hoy' : rem.dueDate} {rem.dueTime ? `a las ${rem.dueTime}` : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-2xl mb-1">📅</span>
              <p className="text-xs text-zinc-400">Todo hecho por hoy. ¡Buen trabajo!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

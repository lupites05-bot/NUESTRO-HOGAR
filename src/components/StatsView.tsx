import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Briefcase,
  Bell,
  ShoppingBag,
  Award,
  ChevronDown,
  Calendar,
  Zap,
  TrendingDown,
  BarChart as ChartIcon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AppData, CoupleUser } from '../types.js';

interface StatsViewProps {
  data: AppData;
  currentUser: CoupleUser;
}

export default function StatsView({ data, currentUser }: StatsViewProps) {
  const userNames = data.userNames || ['Sofía', 'Mateo'];
  const user1 = userNames[0];
  const user2 = userNames[1];

  const [statsPeriod, setStatsPeriod] = useState<'semanal' | 'mensual'>('mensual');

  // Helper date parsing (Fixed anchor date Saturday, July 4, 2026)
  const filterByPeriod = (dateStr: string) => {
    if (statsPeriod === 'semanal') {
      // Last 7 days (June 28 to July 4, 2026)
      const date = new Date(dateStr);
      const startLimit = new Date('2026-06-28');
      const endLimit = new Date('2026-07-04');
      return date >= startLimit && date <= endLimit;
    }
    // Monthly: July 2026
    return dateStr.startsWith('2026-07');
  };

  // 1. Expense Stats
  const activeExpenses = data.expenses.filter(e => filterByPeriod(e.date) && e.type === 'gasto');
  const totalExpenseSum = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseByPersonData = [
    { name: user1, amount: parseFloat(activeExpenses.filter(e => e.paidBy === user1).reduce((sum, e) => sum + e.amount, 0).toFixed(2)) },
    { name: user2, amount: parseFloat(activeExpenses.filter(e => e.paidBy === user2).reduce((sum, e) => sum + e.amount, 0).toFixed(2)) }
  ];

  // 2. Shift stats (turnos trabajados, excluding 'libranzas')
  const activeShifts = data.shifts.filter(s => filterByPeriod(s.date) && s.type !== 'libranzas');
  const sofiaShiftsCount = activeShifts.filter(s => s.user === user1).length;
  const mateoShiftsCount = activeShifts.filter(s => s.user === user2).length;

  const shiftTypesData = [
    { name: user1, turnos: sofiaShiftsCount },
    { name: user2, turnos: mateoShiftsCount }
  ];

  // Detailed shift types
  const shiftBreakdown = (user: CoupleUser) => {
    const userShifts = activeShifts.filter(s => s.user === user);
    const m = userShifts.filter(s => s.type === 'mañana').length;
    const t = userShifts.filter(s => s.type === 'tarde').length;
    const n = userShifts.filter(s => s.type === 'noche').length;
    const p = userShifts.filter(s => s.type === 'partido').length;
    const o = userShifts.length - (m + t + n + p);
    return { m, t, n, p, o };
  };

  const sofiaBreakdown = shiftBreakdown(user1);
  const mateoBreakdown = shiftBreakdown(user2);

  // 3. Reminders completed
  // Since our fake model doesn't store completion dates, we filter completed ones
  const completedReminders = data.reminders.filter(r => r.completed);
  const totalCompletedReminders = completedReminders.length;

  // 4. Shopping purchased items (completed purchases)
  const purchasedItems = data.shoppingList.filter(i => i.purchased);
  const totalPurchasedItems = purchasedItems.length;

  return (
    <div className="space-y-5 px-4 py-3 max-w-lg mx-auto">
      {/* Title & Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-pink-500" /> Estadísticas de Convivencia
        </h2>

        {/* Weekly/Monthly Period Switcher */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-0.5 border border-zinc-200 dark:border-zinc-700/60">
          <button
            onClick={() => setStatsPeriod('semanal')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              statsPeriod === 'semanal'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setStatsPeriod('mensual')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              statsPeriod === 'mensual'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Grid bento stats summary boxes */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">
            <TrendingDown className="w-3.5 h-3.5" /> GASTOS DE CONVIVENCIA
          </div>
          <span className="text-2xl font-black font-mono block text-zinc-900 dark:text-zinc-50">
            {totalExpenseSum.toFixed(2)}€
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Repartido: {(totalExpenseSum / 2).toFixed(2)}€ c/u
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5" /> TURNOS TRABAJADOS
          </div>
          <span className="text-2xl font-black font-mono block text-zinc-900 dark:text-zinc-50">
            {activeShifts.length}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            {user1[0]}: {sofiaShiftsCount} turnos • {user2[0]}: {mateoShiftsCount} turnos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-3.5 h-3.5" /> COMPRAS REALIZADAS
          </div>
          <span className="text-2xl font-black font-mono block text-zinc-900 dark:text-zinc-50">
            {totalPurchasedItems}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            En catálogo frecuente
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" /> RECORDATORIOS HECHOS
          </div>
          <span className="text-2xl font-black font-mono block text-zinc-900 dark:text-zinc-50">
            {totalCompletedReminders}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">
            ¡Hogar libre de olvidos!
          </span>
        </div>
      </div>

      {/* CHART 1: EXPENSES BY PERSON BAR CHART */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Aportación de Gastos</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseByPersonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <Tooltip formatter={(value: any) => [`${value}€`, 'Gasto']} />
              <Bar dataKey="amount" fill="#ec4899" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED WORK SHIFTS STATS GRAPH/BREAKDOWN */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Distribución de Turnos</h3>
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
            Excluye Libranza
          </span>
        </div>

        <div className="space-y-4 divide-y divide-zinc-200/50 dark:divide-zinc-800">
          {/* Sofía Turn Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> {user1} ({sofiaShiftsCount} turnos)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                <span className="block text-xs font-bold font-mono">{sofiaBreakdown.m}</span> Mañana
              </div>
              <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400">
                <span className="block text-xs font-bold font-mono">{sofiaBreakdown.t}</span> Tarde
              </div>
              <div className="p-1.5 rounded-xl bg-purple-50 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400">
                <span className="block text-xs font-bold font-mono">{sofiaBreakdown.n}</span> Noche
              </div>
              <div className="p-1.5 rounded-xl bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400">
                <span className="block text-xs font-bold font-mono">{sofiaBreakdown.p}</span> Partido
              </div>
            </div>
          </div>

          {/* Mateo Turn Stats */}
          <div className="space-y-2 pt-3">
            <div className="flex justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {user2} ({mateoShiftsCount} turnos)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                <span className="block text-xs font-bold font-mono">{mateoBreakdown.m}</span> Mañana
              </div>
              <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400">
                <span className="block text-xs font-bold font-mono">{mateoBreakdown.t}</span> Tarde
              </div>
              <div className="p-1.5 rounded-xl bg-purple-50 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400">
                <span className="block text-xs font-bold font-mono">{mateoBreakdown.n}</span> Noche
              </div>
              <div className="p-1.5 rounded-xl bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400">
                <span className="block text-xs font-bold font-mono">{mateoBreakdown.p}</span> Partido
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AWARD BANNER FOR GREAT RELATIONSHIP SYNC */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/10 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl shrink-0">
          🏆
        </div>
        <div>
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
            Pareja Sincronizada <Award className="w-3.5 h-3.5 text-amber-500 fill-current" />
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            Están manteniendo un excelente nivel de comunicación en el hogar esta semana. ¡Sigan así!
          </p>
        </div>
      </div>
    </div>
  );
}

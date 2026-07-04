import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Plus,
  TrendingDown,
  TrendingUp,
  User,
  Calendar,
  Camera,
  Upload,
  PieChart as ChartIcon,
  X,
  FileText,
  Trash2,
  Check,
  ChevronDown,
  AlertCircle,
  PiggyBank
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { AppData, CoupleUser, Expense } from '../types.js';

interface ExpenseTrackerProps {
  data: AppData;
  currentUser: CoupleUser;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseTracker({
  data,
  currentUser,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: ExpenseTrackerProps) {
  const userNames = data.userNames || ['Sofía', 'Mateo'];
  const user1 = userNames[0];
  const user2 = userNames[1];

  const [timeframe, setTimeframe] = useState<'semanal' | 'mensual' | 'anual'>('mensual');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form states
  const [expType, setExpType] = useState<'gasto' | 'ingreso'>('gasto');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<string>('Alimentación');
  const [expDate, setExpDate] = useState('2026-07-04');
  const [expPaidBy, setExpPaidBy] = useState<CoupleUser>(currentUser);
  const [expPhoto, setExpPhoto] = useState<string>(''); // base64 string
  
  // Camera simulation state
  const [showCameraStream, setShowCameraStream] = useState(false);
  const [cameraFlash, setCameraFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Ocio',
    'Salud',
    'Mascotas',
    'Facturas',
    'Suscripciones',
    'Otras'
  ];

  // Helper date filters
  const filterByTimeframe = (e: Expense) => {
    const expenseDate = new Date(e.date);
    const today = new Date('2026-07-04'); // context anchor

    if (timeframe === 'semanal') {
      const oneWeekAgo = new Date('2026-06-27');
      return expenseDate >= oneWeekAgo && expenseDate <= today;
    }
    if (timeframe === 'mensual') {
      return e.date.startsWith('2026-07');
    }
    // Anual: all of 2026
    return e.date.startsWith('2026');
  };

  // Filtered transactions
  const filteredTransactions = data.expenses
    .filter(filterByTimeframe)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalSpent = filteredTransactions
    .filter(e => e.type === 'gasto')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = filteredTransactions
    .filter(e => e.type === 'ingreso')
    .reduce((sum, e) => sum + e.amount, 0);

  // Paid stats
  const spentBySofia = filteredTransactions
    .filter(e => e.type === 'gasto' && e.paidBy === user1)
    .reduce((sum, e) => sum + e.amount, 0);

  const spentByMateo = filteredTransactions
    .filter(e => e.type === 'gasto' && e.paidBy === user2)
    .reduce((sum, e) => sum + e.amount, 0);

  // Balance calculation (expenses only)
  let balanceAmount = 0;
  let debtor: CoupleUser | null = null;
  let creditor: CoupleUser | null = null;

  if (spentBySofia > spentByMateo) {
    balanceAmount = (spentBySofia - spentByMateo) / 2;
    debtor = user2;
    creditor = user1;
  } else if (spentByMateo > spentBySofia) {
    balanceAmount = (spentByMateo - spentBySofia) / 2;
    debtor = user1;
    creditor = user2;
  }

  // Categories sum for charts
  const categoryChartData = categories.map(cat => {
    const sum = filteredTransactions
      .filter(e => e.type === 'gasto' && e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    return { name: cat, value: parseFloat(sum.toFixed(2)) };
  }).filter(c => c.value > 0);

  // Colors for chart cells
  const COLORS = {
    Alimentación: '#f43f5e', // rose
    Transporte: '#3b82f6', // blue
    Vivienda: '#8b5cf6', // purple
    Ocio: '#f59e0b', // amber
    Salud: '#10b981', // emerald
    Mascotas: '#ec4899', // pink
    Facturas: '#06b6d4', // cyan
    Suscripciones: '#6366f1', // indigo
    Otras: '#64748b' // slate
  };

  // Add Expense Handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDesc.trim()) return;

    onAddExpense({
      type: expType,
      amount: parseFloat(expAmount),
      description: expDesc.trim(),
      date: expDate,
      category: expType === 'ingreso' ? 'Otras' : expCategory,
      paidBy: expPaidBy,
      ticketPhoto: expPhoto || undefined
    });

    setIsAddModalOpen(false);
    // Reset Form
    setExpAmount('');
    setExpDesc('');
    setExpCategory('Alimentación');
    setExpPhoto('');
    setExpPaidBy(currentUser);
  };

  // Liquidate Balance Bizum (Settlement Shortcut)
  const handleLiquidateBalance = () => {
    if (!debtor || !creditor || balanceAmount <= 0) return;
    // To settle, the debtor pays creditor the exact balance amount.
    // We register an expense of balanceAmount paid by debtor with category "Otras" and description "Liquidación de cuentas 🤝"
    onAddExpense({
      type: 'gasto',
      amount: parseFloat(balanceAmount.toFixed(2)),
      description: `Liquidación: Pago de ${debtor} a ${creditor} 🤝`,
      date: '2026-07-04',
      category: 'Otras',
      paidBy: debtor,
    });
  };

  // Image Upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setExpPhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Simulated Camera Capture
  const handleCameraCapture = () => {
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 200);

    // Create a gorgeous realistic simulated ticket photo (Receipt canvas)
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 300;
    mockCanvas.height = 400;
    const ctx = mockCanvas.getContext('2d');
    if (ctx) {
      // Receipt styled backdrop
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, 300, 400);

      // Receipt border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 4;
      ctx.strokeRect(5, 5, 290, 390);

      // Jagged bottom
      ctx.fillStyle = '#ffffff';
      for (let x = 5; x < 295; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 390);
        ctx.lineTo(x + 5, 380);
        ctx.lineTo(x + 10, 390);
        ctx.fill();
      }

      // Title
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 16px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('NUESTRO HOGAR S.L.', 150, 40);
      ctx.font = '12px Courier New';
      ctx.fillText('TICKET DE GASTO SIMULADO', 150, 60);
      ctx.fillText('------------------------', 150, 80);

      // Items
      ctx.textAlign = 'left';
      ctx.fillText('Alimentación Hogar       18.50', 30, 110);
      ctx.fillText('Limpieza y Detergente    12.20', 30, 130);
      ctx.fillText('Artículos Mascotas       15.30', 30, 150);
      ctx.fillText('------------------------', 30, 180);

      // Total
      ctx.font = 'bold 14px Courier New';
      ctx.fillText('TOTAL EUR', 30, 210);
      ctx.textAlign = 'right';
      ctx.fillText(`${expAmount ? parseFloat(expAmount).toFixed(2) : '46.00'}`, 270, 210);

      // Date / Info
      ctx.textAlign = 'center';
      ctx.font = '10px Courier New';
      ctx.fillStyle = '#666666';
      ctx.fillText(`FECHA: ${expDate}`, 150, 270);
      ctx.fillText(`PAGADO POR: ${expPaidBy.toUpperCase()}`, 150, 290);
      ctx.font = 'bold 12px Courier New';
      ctx.fillStyle = '#ff4d80';
      ctx.fillText('SINC COMPARTIDA OK', 150, 335);

      setExpPhoto(mockCanvas.toDataURL('image/jpeg'));
    }
    setShowCameraStream(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Alimentación': return '🛒';
      case 'Transporte': return '🚗';
      case 'Vivienda': return '🏠';
      case 'Ocio': return '🍿';
      case 'Salud': return '💊';
      case 'Mascotas': return '🐶';
      case 'Facturas': return '⚡';
      case 'Suscripciones': return '🎬';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-5 px-4 py-3 max-w-lg mx-auto">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-pink-500" /> Control de Gastos
        </h2>
        
        <button
          onClick={() => {
            setExpType('gasto');
            setExpAmount('');
            setExpDesc('');
            setExpCategory('Alimentación');
            setExpPhoto('');
            setExpPaidBy(currentUser);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/15 transition-all"
        >
          <Plus className="w-4 h-4" /> Registrar Gasto
        </button>
      </div>

      {/* Timeframe selector tab row */}
      <div className="flex rounded-full bg-zinc-100 dark:bg-zinc-800/80 p-0.5 border border-zinc-200 dark:border-zinc-700/60">
        {['semanal', 'mensual', 'anual'].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t as any)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
              timeframe === t
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {t === 'semanal' ? 'Semana' : t === 'mensual' ? 'Mes' : 'Año'}
          </button>
        ))}
      </div>

      {/* Financial Summary Widget */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-400 block uppercase">Total Gastado</span>
            <span className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              {totalSpent.toFixed(2)}€
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-400 block uppercase">Ingresos</span>
            <span className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              {totalIncome.toFixed(2)}€
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE BALANCE BAR & SETTLEMENT */}
      <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Balance de Cuentas</h4>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
            Reparto al 50%
          </span>
        </div>

        {/* Visual balance bar comparison */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Sofía: {spentBySofia.toFixed(2)}€
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Mateo: {spentByMateo.toFixed(2)}€
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex">
            {totalSpent > 0 ? (
              <>
                <div
                  style={{ width: `${(spentBySofia / totalSpent) * 100}%` }}
                  className="bg-indigo-500 h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${(spentByMateo / totalSpent) * 100}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                />
              </>
            ) : (
              <div className="w-full h-full bg-zinc-300 dark:bg-zinc-700" />
            )}
          </div>
        </div>

        {/* Owing status result */}
        {debtor ? (
          <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">🤝</span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block">
                  {debtor} debe {balanceAmount.toFixed(2)}€ a {creditor}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  Al liquidar se registra un traspaso de compensación.
                </span>
              </div>
            </div>

            <button
              onClick={handleLiquidateBalance}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 shrink-0"
            >
              Liquidar Bizum
            </button>
          </div>
        ) : (
          <div className="text-center py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            🎉 ¡Están completamente al día! Ninguno debe dinero al otro.
          </div>
        )}
      </div>

      {/* CATEGORY CHARTS (RECHARTS) */}
      {categoryChartData.length > 0 && (
        <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <ChartIcon className="w-3.5 h-3.5" /> Distribución por Categoría
          </h4>

          {/* Recharts PieChart */}
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8b5cf6'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}€`, 'Gastado']}
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '11px',
                    border: '1px solid #e4e4e7',
                    background: '#ffffff',
                    color: '#18181b'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic Percentage Legend Bars (bulletproof responsive visual fallback) */}
          <div className="grid grid-cols-2 gap-2">
            {categoryChartData.map((item, idx) => {
              const pct = ((item.value / totalSpent) * 100).toFixed(0);
              const color = COLORS[item.name as keyof typeof COLORS] || '#8b5cf6';

              return (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-50 dark:border-zinc-800/50">
                  <span className="text-sm">{getCategoryIcon(item.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate">{item.name}</span>
                      <span className="text-[9px] font-semibold text-zinc-400 font-mono">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                      <div style={{ width: `${pct}%`, backgroundColor: color }} className="h-full rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORIC LIST */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historial de Transacciones</h4>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedExpense(t)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 hover:border-pink-200 dark:hover:border-pink-900/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category icon bubble */}
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center text-lg shadow-inner">
                    {getCategoryIcon(t.category)}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate group-hover:text-pink-500 transition-colors">
                      {t.description}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <span className="font-semibold">{t.paidBy}</span>
                      <span>•</span>
                      <span>{t.date}</span>
                      {t.ticketPhoto && (
                        <>
                          <span>•</span>
                          <span className="text-pink-500 font-medium flex items-center gap-0.5 bg-pink-50 dark:bg-pink-950/20 px-1 rounded">
                            <Camera className="w-2.5 h-2.5" /> ticket
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-mono ${t.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                    {t.type === 'ingreso' ? '+' : '-'}{t.amount.toFixed(2)}€
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteExpense(t.id);
                    }}
                    className="p-1 rounded text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
            <span className="text-2xl">💸</span>
            <p className="text-xs text-zinc-400 mt-1">No hay transacciones registradas en este periodo.</p>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / POPUP FOR TICKET VIEW */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Detalle del Gasto</h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <span className="text-2xl">{getCategoryIcon(selectedExpense.category)}</span>
                  <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-100">{selectedExpense.description}</h4>
                  <span className="text-2xl font-black font-mono text-zinc-950 dark:text-zinc-50">
                    {selectedExpense.amount.toFixed(2)}€
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-zinc-100 dark:border-zinc-800 py-3 text-zinc-600 dark:text-zinc-400">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Pagado por</span>
                    <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedExpense.paidBy}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Categoría</span>
                    <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedExpense.category}</strong>
                  </div>
                  <div className="mt-2">
                    <span className="text-zinc-400 block text-[10px] uppercase">Fecha</span>
                    <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedExpense.date}</strong>
                  </div>
                  <div className="mt-2">
                    <span className="text-zinc-400 block text-[10px] uppercase">Tipo</span>
                    <strong className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">{selectedExpense.type}</strong>
                  </div>
                </div>

                {/* Receipt Image Display */}
                {selectedExpense.ticketPhoto ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Foto del Ticket adjunto:</span>
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 shadow-inner max-h-56 flex items-center justify-center">
                      <img
                        src={selectedExpense.ticketPhoto}
                        alt="Foto de ticket"
                        className="object-contain w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-dashed border-zinc-200 dark:border-zinc-700 text-center text-xs text-zinc-400">
                    No se adjuntó foto del ticket para este registro.
                  </div>
                )}

                <button
                  onClick={() => {
                    onDeleteExpense(selectedExpense.id);
                    setSelectedExpense(null);
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar Transacción
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD TRANSACTION WITH INTEGRATED SIMULATED CAMERA & FILE PICKER */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3.5">
                Registrar Gasto o Ingreso
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-3">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpType('gasto')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      expType === 'gasto'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Gasto (Salida)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpType('ingreso')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      expType === 'ingreso'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Ingreso (Entrada)
                  </button>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Importe (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Fecha</label>
                    <input
                      type="date"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Concepto / Descripción</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Compra Mercadona, recibo luz..."
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                {/* Category Selection (Only for expenses) */}
                {expType === 'gasto' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Categoría</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Who paid */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Pagado por / Beneficiario</label>
                  <div className="grid grid-cols-2 gap-2">
                    {userNames.map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setExpPaidBy(u as CoupleUser)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          expPaidBy === u
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Attachment Section */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block">Adjuntar Ticket / Recibo</label>
                  
                  {/* Camera Simulation view */}
                  {showCameraStream ? (
                    <div className="relative rounded-2xl border-2 border-dashed border-pink-500 overflow-hidden bg-black aspect-video flex flex-col items-center justify-center p-4">
                      {cameraFlash && <div className="absolute inset-0 bg-white z-20" />}
                      <span className="text-3xl animate-bounce mb-2">📸</span>
                      <p className="text-[11px] text-pink-400 font-bold uppercase tracking-wider text-center">
                        CÁMARA VIRTUAL DIGITAL INTELIGENTE
                      </p>
                      <p className="text-[9px] text-zinc-500 text-center max-w-[200px] mt-1 leading-normal">
                        Alinea el recibo de compra. El escáner capturará los datos automáticamente.
                      </p>
                      <button
                        type="button"
                        onClick={handleCameraCapture}
                        className="mt-3 bg-pink-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors shadow"
                      >
                        [ Capturar Recibo ]
                      </button>
                    </div>
                  ) : expPhoto ? (
                    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-32 bg-zinc-50 flex items-center justify-center">
                      <img src={expPhoto} alt="Ticket adjunto" className="object-contain w-full h-full max-h-32" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setExpPhoto('')}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraStream(true)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-pink-500" /> Cámara
                      </button>
                      <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4 text-sky-500" /> Galería
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/10"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Repeat,
  Sparkles,
  Inbox
} from 'lucide-react';
import { AppData, CoupleUser, Reminder } from '../types.js';

interface RemindersListProps {
  data: AppData;
  currentUser: CoupleUser;
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersList({
  data,
  currentUser,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder
}: RemindersListProps) {
  const userNames = data.userNames || ['Sofía', 'Mateo'];
  const user1 = userNames[0];
  const user2 = userNames[1];

  const [filterMode, setFilterMode] = useState<'todos' | 'propios' | 'compartidos'>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [remDescription, setRemDescription] = useState('');
  const [remUser, setRemUser] = useState<CoupleUser | 'compartido'>('compartido');
  const [remDueDate, setRemDueDate] = useState('2026-07-04');
  const [remDueTime, setRemDueTime] = useState('');
  const [remRepetition, setRemRepetition] = useState<Reminder['repetition']>('ninguna');

  // Interactive local notification simulation
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const triggerMockNotification = (text: string) => {
    setNotificationToast(text);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Filter reminders based on tab
  const filteredReminders = data.reminders.filter(r => {
    if (filterMode === 'compartidos') return r.user === 'compartido';
    if (filterMode === 'propios') return r.user === currentUser;
    return true; // 'todos'
  });

  const pendingReminders = filteredReminders.filter(r => !r.completed);
  const completedReminders = filteredReminders.filter(r => r.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remDescription.trim()) return;

    onAddReminder({
      description: remDescription.trim(),
      user: remUser,
      dueDate: remDueDate,
      dueTime: remDueTime || undefined,
      repetition: remRepetition,
      completed: false
    });

    setIsAddModalOpen(false);
    triggerMockNotification(`🔔 Recordatorio creado para ${remUser === 'compartido' ? 'Ambos' : remUser}`);
    // Reset Form
    setRemDescription('');
    setRemUser('compartido');
    setRemDueDate('2026-07-04');
    setRemDueTime('');
    setRemRepetition('ninguna');
  };

  const handleToggleCompleted = (rem: Reminder) => {
    const nextCompletedState = !rem.completed;
    onUpdateReminder(rem.id, {
      completed: nextCompletedState,
      completedBy: nextCompletedState ? currentUser : null
    });

    if (nextCompletedState) {
      triggerMockNotification(`✅ ¡Felicidades! ${currentUser} completó: "${rem.description}"`);
    }
  };

  const getRepetitionLabel = (rep: Reminder['repetition']) => {
    switch (rep) {
      case 'diaria': return 'Cada día';
      case 'semanal': return 'Cada semana';
      case 'mensual': return 'Cada mes';
      case 'personalizada': return 'Personalizado';
      default: return 'No se repite';
    }
  };

  return (
    <div className="space-y-5 px-4 py-3 max-w-lg mx-auto relative">
      {/* Dynamic Toast Notifications mimicking Mobile Alerts */}
      <AnimatePresence>
        {notificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-80 bg-zinc-900/95 dark:bg-white/95 text-white dark:text-zinc-900 p-3.5 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-start gap-3 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-pink-500 uppercase block">Notificación de Nuestro Hogar</span>
              <p className="text-xs font-semibold leading-tight">{notificationToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Quick Add */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Bell className="w-5 h-5 text-pink-500" /> Recordatorios
        </h2>
        
        <button
          onClick={() => {
            setRemDescription('');
            setRemUser('compartido');
            setRemDueDate('2026-07-04');
            setRemDueTime('');
            setRemRepetition('ninguna');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md shadow-pink-500/15 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Recordatorio
        </button>
      </div>

      {/* Filtering Selector Tab Row */}
      <div className="flex rounded-full bg-zinc-100 dark:bg-zinc-800/80 p-0.5 border border-zinc-200 dark:border-zinc-700/60">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'propios', label: `De ${currentUser}` },
          { id: 'compartidos', label: 'Compartidos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
              filterMode === tab.id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE / PENDING REMINDERS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tareas Pendientes</h3>

        {pendingReminders.length > 0 ? (
          <div className="space-y-2">
            {pendingReminders.map(rem => (
              <div
                key={rem.id}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 hover:border-pink-200 dark:hover:border-pink-900/30 transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Styled trigger check circle */}
                  <button
                    onClick={() => handleToggleCompleted(rem)}
                    className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 hover:border-pink-500 hover:bg-pink-500/10 transition-colors shrink-0 mt-0.5 cursor-pointer"
                  />

                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block break-words leading-tight">
                      {rem.description}
                    </span>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2.5 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {rem.dueDate} {rem.dueTime ? `a las ${rem.dueTime}` : ''}
                      </span>

                      {rem.repetition !== 'ninguna' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-pink-500 font-semibold bg-pink-50 dark:bg-pink-950/20 px-1.5 py-0.5 rounded-md">
                          <Repeat className="w-3 h-3 text-pink-400" />
                          {getRepetitionLabel(rem.repetition)}
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                        rem.user === 'compartido'
                          ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/20'
                          : rem.user === 'Sofía'
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/20'
                          : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/20'
                      }`}>
                        {rem.user === 'compartido' ? (
                          <><Users className="w-2.5 h-2.5" /> Compartido</>
                        ) : (
                          <><User className="w-2.5 h-2.5" /> Para {rem.user}</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-1 rounded text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 rounded-3xl">
            <span className="text-3xl">📭</span>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2">No hay tareas pendientes</h4>
            <p className="text-xs text-zinc-400 mt-1">¡Buen trabajo! Estás al día con todos los recordatorios.</p>
          </div>
        )}
      </div>

      {/* COMPLETED / DONE REMINDERS */}
      {completedReminders.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completados</h3>

          <div className="space-y-1.5 opacity-60 hover:opacity-100 transition-opacity">
            {completedReminders.map(rem => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/50"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleCompleted(rem)}
                    className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </button>

                  <div className="min-w-0 flex-1 line-through text-zinc-400 dark:text-zinc-500">
                    <span className="text-xs font-medium block truncate">
                      {rem.description}
                    </span>
                    {rem.completedBy && (
                      <span className="text-[9px] block text-emerald-600 dark:text-emerald-400 font-semibold italic mt-0.5">
                        Hecho por {rem.completedBy} ✔️
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-1 rounded text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400"
                  title="Eliminar del historial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD REMINDER */}
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
                Crear Nuevo Recordatorio
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">¿Qué hay que recordar?</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Regar terraza 🌿, comprar comida perro..."
                    value={remDescription}
                    onChange={(e) => setRemDescription(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                {/* Who is it for */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">¿Para quién es?</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 'compartido', label: 'Ambos' },
                      { val: user1, label: user1 },
                      { val: user2, label: user2 }
                    ].map(u => (
                      <button
                        key={u.val}
                        type="button"
                        onClick={() => setRemUser(u.val as any)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all ${
                          remUser === u.val
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      required
                      value={remDueDate}
                      onChange={(e) => setRemDueDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Hora (Opcional)</label>
                    <input
                      type="time"
                      value={remDueTime}
                      onChange={(e) => setRemDueTime(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                {/* Repetition */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Repetición</label>
                  <select
                    value={remRepetition}
                    onChange={(e) => setRemRepetition(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  >
                    <option value="ninguna">No se repite</option>
                    <option value="diaria">Repetir diariamente</option>
                    <option value="semanal">Repetir semanalmente</option>
                    <option value="mensual">Repetir mensualmente</option>
                    <option value="personalizada">Personalizada</option>
                  </select>
                </div>

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
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-md shadow-pink-500/10"
                  >
                    Crear Recordatorio
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

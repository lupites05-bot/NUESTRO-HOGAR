import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Trash2,
  FileText
} from 'lucide-react';
import { AppData, CoupleUser, WorkShift, CalendarEvent } from '../types.js';

interface CalendarSharedProps {
  data: AppData;
  currentUser: CoupleUser;
  onAddShift: (shift: Omit<WorkShift, 'id'>) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

export default function CalendarShared({
  data,
  currentUser,
  onAddShift,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}: CalendarSharedProps) {
  const userNames = data.userNames || ['Sofía', 'Mateo'];
  const user1 = userNames[0];
  const user2 = userNames[1];

  const [viewMode, setViewMode] = useState<'mensual' | 'semanal' | 'diaria'>('mensual');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-04'); // Saturday July 4, 2026
  
  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Shift form state
  const [shiftUser, setShiftUser] = useState<CoupleUser>(currentUser);
  const [shiftType, setShiftType] = useState<string>('mañana');
  const [customShiftType, setCustomShiftType] = useState<string>('');
  const [shiftNote, setShiftNote] = useState<string>('');

  // Event form state
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventUser, setEventUser] = useState<CoupleUser | 'compartido'>('compartido');
  const [eventTime, setEventTime] = useState<string>('');
  const [eventNotes, setEventNotes] = useState<string>('');
  const [eventReminder, setEventReminder] = useState<number>(60); // 1 hour default

  // Calendar math helper for July 2026
  // July 2026 has 31 days. Starts on Wednesday, ends on Friday.
  // Weeks starts on Monday.
  // July 1 is a Wednesday (offset 2 days if week starts on Monday)
  const daysInJuly = 31;
  const startDayOffset = 2; // Wed is index 2 (Mon=0, Tue=1, Wed=2)
  const totalSlots = 35; // We can show 5 rows of 7 days

  const julyDays: string[] = [];
  // Add trailing June days
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const day = 30 - i;
    julyDays.push(`2026-06-${day}`);
  }
  // Add July days
  for (let i = 1; i <= daysInJuly; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    julyDays.push(`2026-07-${pad}`);
  }
  // Add early August days to complete 35 slots
  const remaining = totalSlots - julyDays.length;
  for (let i = 1; i <= remaining; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    julyDays.push(`2026-08-${pad}`);
  }

  // Active shifts and events for selected day
  const activeShifts = data.shifts.filter(s => s.date === selectedDateStr);
  const activeEvents = data.events.filter(e => e.date === selectedDateStr);

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  const getDayLabel = (dateStr: string) => {
    return dateStr.split('-')[2];
  };

  const getMonthName = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts[1] === '06') return 'Jun';
    if (parts[1] === '08') return 'Ago';
    return 'Jul';
  };

  // Turn scheduler action
  const submitShift = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = shiftType === 'personalizado' ? customShiftType : shiftType;
    onAddShift({
      user: shiftUser,
      date: selectedDateStr,
      type: finalType,
      note: shiftNote || undefined
    });
    setIsShiftModalOpen(false);
    // Reset
    setShiftNote('');
    setCustomShiftType('');
  };

  // Event schedule action
  const submitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, {
        title: eventTitle,
        user: eventUser,
        date: selectedDateStr,
        time: eventTime || undefined,
        notes: eventNotes || undefined,
        reminderMinutes: eventReminder
      });
      setEditingEvent(null);
    } else {
      onAddEvent({
        title: eventTitle,
        user: eventUser,
        date: selectedDateStr,
        time: eventTime || undefined,
        notes: eventNotes || undefined,
        reminderMinutes: eventReminder
      });
    }
    setIsEventModalOpen(false);
    // Reset
    setEventTitle('');
    setEventTime('');
    setEventNotes('');
    setEventReminder(60);
  };

  const openEditEvent = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setEventTitle(evt.title);
    setEventUser(evt.user);
    setEventTime(evt.time || '');
    setEventNotes(evt.notes || '');
    setEventReminder(evt.reminderMinutes ?? 60);
    setIsEventModalOpen(true);
  };

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Color getters
  const getUserBg = (user: string) => {
    return user === user1 ? 'bg-indigo-500' : 'bg-amber-500';
  };
  const getUserText = (user: string) => {
    return user === user1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400';
  };
  const getUserBorder = (user: string) => {
    return user === user1 ? 'border-indigo-200 dark:border-indigo-900/40' : 'border-amber-200 dark:border-amber-900/40';
  };

  const getShiftColorClass = (type: string, isSofia: boolean) => {
    const textCol = isSofia ? 'text-indigo-800 dark:text-indigo-300' : 'text-amber-800 dark:text-amber-300';
    const bgCol = isSofia
      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/20'
      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/20';

    if (type?.toLowerCase() === 'libranzas') {
      return 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300';
    }
    return `${bgCol} ${textCol} border`;
  };

  // Format date readable
  const formatReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    const day = parseInt(parts[2]);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = months[parseInt(parts[1]) - 1];
    
    // Day of week calculation for July 2026
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, day);
    const dayOfWeek = daysOfWeek[d.getDay()];

    return `${dayOfWeek}, ${day} de ${month} de ${parts[0]}`;
  };

  const currentMonthLabel = () => {
    const parts = selectedDateStr.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    const parts = selectedDateStr.split('-');
    let m = parseInt(parts[1]);
    let y = parseInt(parts[0]);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    const pad = m < 10 ? `0${m}` : `${m}`;
    setSelectedDateStr(`${y}-${pad}-01`);
  };

  const handleNextMonth = () => {
    const parts = selectedDateStr.split('-');
    let m = parseInt(parts[1]);
    let y = parseInt(parts[0]);
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
    const pad = m < 10 ? `0${m}` : `${m}`;
    setSelectedDateStr(`${y}-${pad}-01`);
  };

  // Shifts helper
  const getDayShifts = (dateStr: string) => {
    return data.shifts.filter(s => s.date === dateStr);
  };

  const getDayEvents = (dateStr: string) => {
    return data.events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-5 px-4 py-3 max-w-lg mx-auto">
      {/* Calendar View Selectors & Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pink-500" /> Calendario Compartido
          </h2>
          
          <div className="flex rounded-full bg-zinc-100 dark:bg-zinc-800/80 p-0.5 border border-zinc-200 dark:border-zinc-700/60">
            <button
              onClick={() => setViewMode('mensual')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                viewMode === 'mensual'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('semanal')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                viewMode === 'semanal'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('diaria')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                viewMode === 'diaria'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Día
            </button>
          </div>
        </div>

        {/* Date Selector Header */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-sans tracking-wide">
            {currentMonthLabel()}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* MONTHLY VIEW */}
      {viewMode === 'mensual' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Calendar Grid */}
          <div className="p-3.5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, idx) => (
                <span key={idx} className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 py-1 uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-1">
              {julyDays.map((dateStr, idx) => {
                const dayShifts = getDayShifts(dateStr);
                const dayEvents = getDayEvents(dateStr);
                const isSelected = selectedDateStr === dateStr;
                const isToday = dateStr === '2026-07-04';
                const isCurrentMonth = dateStr.includes('-07-');

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(dateStr)}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all outline-none border ${
                      isSelected
                        ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20 z-10'
                        : isToday
                        ? 'bg-white border-pink-200 text-pink-600 font-bold dark:bg-zinc-900 dark:border-pink-900/40'
                        : isCurrentMonth
                        ? 'bg-white border-transparent text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        : 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20'
                    }`}
                  >
                    {/* Day number */}
                    <span className="text-xs font-semibold leading-none mt-0.5">
                      {getDayLabel(dateStr)}
                    </span>

                    {/* Shifts Indicators */}
                    <div className="flex gap-0.5 justify-center w-full min-h-[4px]">
                      {dayShifts.map((sh, sIdx) => (
                        <span
                          key={sIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : getUserBg(sh.user)
                          }`}
                          title={`${sh.user}: ${sh.type}`}
                        />
                      ))}
                    </div>

                    {/* Event Dots */}
                    {dayEvents.length > 0 && (
                      <span className={`w-1 h-1 rounded-full absolute top-1 right-1 ${
                        isSelected ? 'bg-white' : 'bg-rose-500 dark:bg-rose-400'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* WEEKLY VIEW */}
      {viewMode === 'semanal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {/* Find start of current selected week */}
          {(() => {
            const index = julyDays.indexOf(selectedDateStr);
            const startOfWeeklyIdx = index !== -1 ? Math.floor(index / 7) * 7 : 7;
            const weekDays = julyDays.slice(startOfWeeklyIdx, startOfWeeklyIdx + 7);

            return (
              <div className="space-y-2.5">
                {weekDays.map((dateStr, wIdx) => {
                  const dayShifts = getDayShifts(dateStr);
                  const dayEvents = getDayEvents(dateStr);
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = dateStr === '2026-07-04';

                  return (
                    <div
                      key={wIdx}
                      onClick={() => handleDayClick(dateStr)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-pink-300 bg-pink-500/5 dark:bg-pink-950/10'
                          : isToday
                          ? 'border-pink-200 bg-white dark:bg-zinc-900 dark:border-pink-950'
                          : 'border-zinc-100 bg-white dark:bg-zinc-900/60 dark:border-zinc-800 hover:border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                            isToday ? 'bg-pink-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}>
                            {getMonthName(dateStr)} {getDayLabel(dateStr)}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatReadableDate(dateStr).split(',')[0]}
                          </span>
                        </div>

                        {/* Events Badge count */}
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 px-1.5 py-0.5 rounded-md font-medium">
                            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                          </span>
                        )}
                      </div>

                      {/* Shifts in Weekly view */}
                      <div className="grid grid-cols-2 gap-2">
                        {userNames.map(user => {
                          const userShift = dayShifts.find(s => s.user === user);
                          return (
                            <div
                              key={user}
                              className={`p-1.5 rounded-xl border text-[11px] ${
                                userShift
                                  ? getShiftColorClass(userShift.type, user === user1)
                                  : 'bg-zinc-50/50 border-dashed border-zinc-200 text-zinc-400 dark:bg-zinc-800/10 dark:border-zinc-800'
                              }`}
                            >
                              <div className="font-semibold flex items-center gap-1 mb-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${getUserBg(user)}`} />
                                {user}
                              </div>
                              <span className="font-medium">
                                {userShift ? cap(userShift.type) : 'Libre / Libranza'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* SELECTED DAY DETAILS (DIARIA VIEW OR PERSISTENT FOOTER) */}
      {(viewMode === 'diaria' || viewMode === 'mensual') && (
        <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
            <div>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold block uppercase tracking-wider">
                Detalles del Día
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {formatReadableDate(selectedDateStr)}
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-xl transition-all"
              >
                <Briefcase className="w-3.5 h-3.5 text-pink-500" /> Turno
              </button>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventTitle('');
                  setEventTime('');
                  setEventNotes('');
                  setEventReminder(60);
                  setIsEventModalOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] font-bold bg-pink-500 hover:bg-pink-600 text-white px-2.5 py-1.5 rounded-xl transition-all shadow-sm shadow-pink-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Evento
              </button>
            </div>
          </div>

          {/* Section: Work shifts on selected day */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Turnos de Trabajo</h4>
            <div className="grid grid-cols-2 gap-3">
              {userNames.map(user => {
                const shift = activeShifts.find(s => s.user === user);

                return (
                  <div
                    key={user}
                    className={`p-3 rounded-2xl border transition-all ${
                      shift
                        ? getShiftColorClass(shift.type, user === user1)
                        : 'bg-white border-zinc-200 text-zinc-400 border-dashed dark:bg-zinc-900 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getUserBg(user)}`} />
                        {user}
                      </span>
                    </div>

                    {shift ? (
                      <div>
                        <span className="text-xs font-semibold block">{cap(shift.type)}</span>
                        {shift.note && (
                          <p className="text-[10px] mt-1 text-zinc-500 dark:text-zinc-400 italic">
                            "{shift.note}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs italic">Sin turno (Libranza)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Events on selected day */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Citas y Eventos</h4>
            {activeEvents.length > 0 ? (
              <div className="space-y-2.5">
                {activeEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 hover:border-pink-200 dark:hover:border-pink-900/20 transition-all group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {evt.time && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-300 font-semibold px-1.5 py-0.5 rounded-md">
                              <Clock className="w-3 h-3" /> {evt.time}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${
                            evt.user === 'compartido'
                              ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/20'
                              : getUserBg(evt.user) + ' bg-opacity-10 ' + getUserText(evt.user) + ' ' + getUserBorder(evt.user)
                          }`}>
                            {evt.user === 'compartido' ? (
                              <><Users className="w-2.5 h-2.5" /> Compartido</>
                            ) : (
                              <><User className="w-2.5 h-2.5" /> {evt.user}</>
                            )}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {evt.title}
                        </h5>
                        {evt.notes && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {evt.notes}
                          </p>
                        )}
                        {evt.reminderMinutes !== undefined && evt.reminderMinutes >= 0 && (
                          <span className="text-[10px] text-zinc-400 block italic">
                            🔔 Recordatorio {evt.reminderMinutes === 0 ? 'a la hora' : `${evt.reminderMinutes} min antes`}
                          </span>
                        )}
                      </div>

                      {/* Action buttons on event */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditEvent(evt)}
                          className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          title="Editar"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl">
                <span className="text-xl">🕊️</span>
                <p className="text-xs text-zinc-400 mt-1">No hay eventos ni notas para hoy.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: TURNOS DE TRABAJO */}
      <AnimatePresence>
        {isShiftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3.5">
                Definir Turno para el {selectedDateStr}
              </h3>

              <form onSubmit={submitShift} className="space-y-4">
                {/* User */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Persona</label>
                  <div className="grid grid-cols-2 gap-2">
                    {userNames.map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setShiftUser(u as CoupleUser)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          shiftUser === u
                            ? u === user1
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turn Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Tipo de Turno</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  >
                    <option value="mañana">Mañana (06:00 - 14:00)</option>
                    <option value="tarde">Tarde (14:00 - 22:00)</option>
                    <option value="noche">Noche (22:00 - 06:00)</option>
                    <option value="partido">Turno Partido (Comercial)</option>
                    <option value="vacaciones">Vacaciones ✈️</option>
                    <option value="festivos">Festivo 🎉</option>
                    <option value="libranzas">Libranza (Día Libre)</option>
                    <option value="personalizado">Otro (Personalizado...)</option>
                    <option value="none">Quitar Turno / Borrar</option>
                  </select>
                </div>

                {/* Custom Type If Selected */}
                {shiftType === 'personalizado' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-1"
                  >
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Nombre del Turno</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Turno Especial, Guardia..."
                      value={customShiftType}
                      onChange={(e) => setCustomShiftType(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </motion.div>
                )}

                {/* Note */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Notas / Horario</label>
                  <input
                    type="text"
                    placeholder="Ej: De 08:00 a 16:00 h"
                    value={shiftNote}
                    onChange={(e) => setShiftNote(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsShiftModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-md shadow-pink-500/10"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EVENTO / CITA */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3.5">
                {editingEvent ? 'Editar Evento' : 'Añadir Evento / Nota'} ({selectedDateStr})
              </h3>

              <form onSubmit={submitEvent} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Título del Evento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cena aniversario, Dentista Mateo..."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                {/* Who is involved */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Involucra a</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 'compartido', label: 'Ambos' },
                      { val: user1, label: user1 },
                      { val: user2, label: user2 }
                    ].map(u => (
                      <button
                        key={u.val}
                        type="button"
                        onClick={() => setEventUser(u.val as any)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all ${
                          eventUser === u.val
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time & Reminder */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Hora (Opcional)</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Recordatorio</label>
                    <select
                      value={eventReminder}
                      onChange={(e) => setEventReminder(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    >
                      <option value={-1}>Ninguno</option>
                      <option value={0}>Al empezar</option>
                      <option value={15}>15 minutos antes</option>
                      <option value={30}>30 minutos antes</option>
                      <option value={60}>1 hora antes</option>
                      <option value={120}>2 horas antes</option>
                      <option value={1440}>1 día antes</option>
                    </select>
                  </div>
                </div>

                {/* Description Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Detalles / Notas</label>
                  <textarea
                    rows={2}
                    placeholder="Escribe direcciones, cosas que llevar, etc."
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-md shadow-pink-500/10"
                  >
                    {editingEvent ? 'Guardar' : 'Crear Evento'}
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

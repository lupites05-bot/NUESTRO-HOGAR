import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Calendar as CalendarIcon,
  ShoppingBag,
  CreditCard,
  Bell,
  PieChart as ChartIcon,
  Wifi,
  Battery,
  Heart
} from 'lucide-react';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import CalendarShared from './components/CalendarShared.tsx';
import ShoppingList from './components/ShoppingList.tsx';
import ExpenseTracker from './components/ExpenseTracker.tsx';
import RemindersList from './components/RemindersList.tsx';
import StatsView from './components/StatsView.tsx';
import { AppData, CoupleUser, WorkShift, CalendarEvent, ShoppingItem, Expense, Reminder } from './types.ts';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('inicio');
  
  // User active context (Sofía or Mateo)
  const [currentUser, setCurrentUser] = useState<CoupleUser>('Sofía');
  
  // Dark mode status (Default to light elegant theme as per guidelines)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Backend central state
  const [data, setData] = useState<AppData>({
    shifts: [],
    events: [],
    shoppingList: [],
    shoppingSections: [],
    expenses: [],
    reminders: []
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Check if we are running on GitHub Pages (static build with no Express server)
  const isStaticPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  // Load state from backend Express API
  const fetchState = async (showSyncIndicator = false, isInitial = false) => {
    if (showSyncIndicator) setSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('API fetch error');
      const json = await res.json();
      setData(json);
      setConnectionError(false);

      const names = json.userNames || ['Sofía', 'Mateo'];
      if (isInitial) {
        // On initial load, try to preserve state or set to the first custom user
        setCurrentUser(names[0]);
      } else {
        // If names changed, ensure current user is one of the valid active names
        setCurrentUser(prev => names.includes(prev) ? prev : names[0]);
      }
    } catch (err) {
      console.error('Error fetching synchronization state:', err);
      setConnectionError(true);
      
      // Load fallback from localStorage on initial load if connection fails
      if (isInitial) {
        const local = localStorage.getItem('nuestro_hogar_local_data');
        if (local) {
          try {
            const json = JSON.parse(local);
            setData(json);
            const names = json.userNames || ['Sofía', 'Mateo'];
            setCurrentUser(names[0]);
          } catch (e) {
            console.error('Failed to parse local fallback data:', e);
          }
        }
      }
    } finally {
      setLoading(false);
      if (showSyncIndicator) {
        setTimeout(() => setSyncing(false), 500);
      }
    }
  };

  // Synchronize 'data' state changes to localStorage for offline resilience
  useEffect(() => {
    if (data && (data.shifts.length > 0 || data.events.length > 0 || data.shoppingList.length > 0 || data.expenses.length > 0 || data.reminders.length > 0)) {
      localStorage.setItem('nuestro_hogar_local_data', JSON.stringify(data));
    }
  }, [data]);

  // Run initial state load and continuous background polling to sync in real time
  useEffect(() => {
    fetchState(false, true);
    
    // Polling every 4 seconds to sync state between partners
    const interval = setInterval(() => {
      fetchState(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Update theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // MUTATION ACTIONS

  // 1. Calendar Work Shifts
  const handleAddShift = async (shift: Omit<WorkShift, 'id'>) => {
    // Optimistic Update
    const tempId = Math.random().toString();
    const updatedShifts = data.shifts.filter(s => !(s.user === shift.user && s.date === shift.date));
    if (shift.type !== 'none') {
      updatedShifts.push({ ...shift, id: tempId });
    }
    setData(prev => ({ ...prev, shifts: updatedShifts }));

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error('Failed to post shift:', err);
      fetchState(); // Rollback to actual backend state
    }
  };

  // 2. Calendar Shared Events
  const handleAddEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    const tempId = Math.random().toString();
    setData(prev => ({
      ...prev,
      events: [...prev.events, { ...event, id: tempId }]
    }));

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  // 3. Shopping List
  const handleAddShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'frequencyCount'>) => {
    const tempId = Math.random().toString();
    setData(prev => ({
      ...prev,
      shoppingList: [...prev.shoppingList, { ...item, id: tempId, frequencyCount: 1 }]
    }));

    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleUpdateShoppingItem = async (id: string, updates: Partial<ShoppingItem>) => {
    setData(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(item => item.id === id ? { ...item, ...updates } : item)
    }));

    try {
      const res = await fetch(`/api/shopping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleDeleteShoppingItem = async (id: string) => {
    setData(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.filter(item => item.id !== id)
    }));

    try {
      const res = await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleAddShoppingSection = async (section: string) => {
    setData(prev => ({
      ...prev,
      shoppingSections: [...prev.shoppingSections, section]
    }));

    try {
      const res = await fetch('/api/shopping/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section })
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  // 4. Expenses
  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    const tempId = Math.random().toString();
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: tempId }]
    }));

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
    }));

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  // 5. Reminders
  const handleAddReminder = async (reminder: Omit<Reminder, 'id'>) => {
    const tempId = Math.random().toString();
    setData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { ...reminder, id: tempId }]
    }));

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, ...updates } : r)
    }));

    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    setData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }));

    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchState(true);
    } catch (err) {
      console.error(err);
      fetchState();
    }
  };

  const handleUpdateUserNames = async (names: [string, string]) => {
    try {
      const res = await fetch('/api/settings/usernames', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names })
      });
      if (!res.ok) throw new Error('Failed to update usernames');
      
      const oldNames = data.userNames || ['Sofía', 'Mateo'];
      if (currentUser === oldNames[0]) {
        setCurrentUser(names[0]);
      } else if (currentUser === oldNames[1]) {
        setCurrentUser(names[1]);
      } else {
        setCurrentUser(names[0]);
      }
      fetchState(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Rendering matching subcomponent
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <Dashboard
            data={data}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onToggleShoppingItem={(id, purchased) => handleUpdateShoppingItem(id, { purchased })}
            onToggleReminder={(id, completed) => handleUpdateReminder(id, { completed, completedBy: completed ? currentUser : null })}
          />
        );
      case 'calendario':
        return (
          <CalendarShared
            data={data}
            currentUser={currentUser}
            onAddShift={handleAddShift}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      case 'compra':
        return (
          <ShoppingList
            data={data}
            currentUser={currentUser}
            onAddItem={handleAddShoppingItem}
            onUpdateItem={handleUpdateShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onAddSection={handleAddShoppingSection}
          />
        );
      case 'gastos':
        return (
          <ExpenseTracker
            data={data}
            currentUser={currentUser}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'recordatorios':
        return (
          <RemindersList
            data={data}
            currentUser={currentUser}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        );
      case 'estadisticas':
        return <StatsView data={data} currentUser={currentUser} />;
      default:
        return <div>Tab no encontrada</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-pink-100 dark:bg-pink-950 text-pink-500 animate-pulse mb-4">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-sans">
          Cargando Nuestro Hogar...
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Sincronizando estado compartido en tiempo real</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-0 md:p-6 transition-colors duration-300 font-sans selection:bg-pink-100 selection:text-pink-900">
      
      {/* 
        Sleek Android Native-Like Phone Shell Frame
        This fits beautifully on desktop, and collapses fully on mobile device screens (w-full h-full p-0)
      */}
      <div className="w-full h-screen md:max-w-[440px] md:h-[840px] md:rounded-[48px] md:border-[12px] md:border-zinc-800 md:shadow-2xl md:relative md:overflow-hidden bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300">
        
        {/* Android top bezel bar (visible on desktop) */}
        <div className="hidden md:flex absolute top-0 inset-x-0 h-7 bg-zinc-900 z-50 justify-between items-center px-6 text-[10px] text-zinc-400 font-mono">
          <span>13:08</span>
          <div className="w-20 h-4 bg-zinc-900 rounded-b-xl absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[9px]">4G</span>
            <Battery className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Scrollable Main Content (adjusted margin on top if android bar is shown) */}
        <div className="flex-1 overflow-y-auto pb-24 md:pt-7 scrollbar-none bg-white dark:bg-zinc-900">
          
          {/* Header */}
          <Header
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            userNames={data.userNames || ['Sofía', 'Mateo']}
            onUpdateUserNames={handleUpdateUserNames}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            syncing={syncing}
            onSync={() => fetchState(true)}
          />

          {/* Connection Error or Static Build (GitHub Pages) Indicator */}
          {isStaticPages ? (
            <div className="bg-amber-500 text-zinc-900 text-xs text-center py-2 px-4 flex flex-col items-center justify-center gap-1 leading-snug">
              <span className="font-bold flex items-center gap-1">⚠️ Modo Local (GitHub Pages)</span>
              <span>Para sincronizar en tiempo real con tu pareja, instala la app usando el enlace de la app compartida de AI Studio.</span>
            </div>
          ) : connectionError ? (
            <div className="bg-rose-500 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-1.5">
              <span className="animate-ping w-2 h-2 rounded-full bg-white block" />
              Reconectando con el servidor compartido de la pareja...
            </div>
          ) : null}

          {/* Tabs switch animations */}
          <main>
            {renderActiveTab()}
          </main>
        </div>

        {/* 
          Elegant Bottom Navigation Bar (Floating styled inside the phone frame)
        */}
        <nav className="absolute bottom-4 inset-x-4 h-16 rounded-2xl bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 shadow-lg flex items-center justify-around px-2 z-40 transition-colors">
          {[
            { id: 'inicio', label: 'Inicio', icon: Home },
            { id: 'calendario', label: 'Turnos', icon: CalendarIcon },
            { id: 'compra', label: 'Compra', icon: ShoppingBag },
            { id: 'gastos', label: 'Gastos', icon: CreditCard },
            { id: 'recordatorios', label: 'Avisos', icon: Bell },
            { id: 'estadisticas', label: 'Stats', icon: ChartIcon }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all relative cursor-pointer"
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute inset-x-2 -top-1 h-1 bg-pink-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-pink-500 scale-110' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`} />
                <span className={`text-[9px] font-bold mt-1 tracking-tight transition-colors ${isActive ? 'text-pink-600 dark:text-pink-400 font-extrabold' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

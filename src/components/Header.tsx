import React, { useState } from 'react';
import { Heart, Moon, Sun, User, RefreshCw, Settings, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CoupleUser } from '../types.js';

interface HeaderProps {
  currentUser: CoupleUser;
  setCurrentUser: (user: CoupleUser) => void;
  userNames: string[];
  onUpdateUserNames: (names: [string, string]) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  syncing: boolean;
  onSync: () => void;
}

export default function Header({
  currentUser,
  setCurrentUser,
  userNames,
  onUpdateUserNames,
  isDarkMode,
  setIsDarkMode,
  syncing,
  onSync
}: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name1, setName1] = useState(userNames[0] || 'Sofía');
  const [name2, setName2] = useState(userNames[1] || 'Mateo');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenModal = () => {
    setName1(userNames[0] || 'Sofía');
    setName2(userNames[1] || 'Mateo');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveNames = (e: React.FormEvent) => {
    e.preventDefault();
    const clean1 = name1.trim();
    const clean2 = name2.trim();

    if (!clean1 || !clean2) {
      setErrorMsg('Ambos nombres son obligatorios.');
      return;
    }
    if (clean1.toLowerCase() === clean2.toLowerCase()) {
      setErrorMsg('Los nombres deben ser distintos.');
      return;
    }

    onUpdateUserNames([clean1, clean2]);
    setIsModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 px-5 py-4 border-b transition-colors duration-300 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        {/* Brand Logo and Name */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans leading-none">
              Nuestro Hogar
            </h1>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider">
              PAREJA • COMPARTIDO
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Realtime sync indicator */}
          <button
            onClick={onSync}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
            title="Sincronizar ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-pink-500' : ''}`} />
          </button>

          {/* Theme Toggler */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors bg-zinc-50 dark:bg-zinc-800/50"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
          </button>

          {/* Edit Custom Users Gear icon */}
          <button
            onClick={handleOpenModal}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-pink-500 dark:text-zinc-400 dark:hover:text-pink-400 transition-colors bg-zinc-50 dark:bg-zinc-800/50"
            title="Configurar nuestros nombres de usuario"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* User selector */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700">
            <User className="w-3 h-3 text-zinc-400" />
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value as CoupleUser)}
              className="bg-transparent text-zinc-750 dark:text-zinc-200 outline-none cursor-pointer font-sans text-xs"
            >
              {userNames.map((name) => (
                <option key={name} value={name} className="dark:bg-zinc-900">
                  {name}
                </option>
              ))}
            </select>
            <span className="relative flex h-1.5 w-1.5 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Mini notification banner simulating presence */}
      <div className="mt-2 flex items-center justify-between text-[10px] px-2.5 py-1 rounded-lg bg-pink-50/50 dark:bg-pink-950/10 text-pink-700 dark:text-pink-300/80 font-medium">
        <span className="truncate">
          Sesión: <strong className="font-bold text-pink-600 dark:text-pink-400">{currentUser}</strong> • Cambia el usuario para simular el móvil de tu pareja.
        </span>
      </div>

      {/* MODAL: EDIT USER NAMES */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-pink-500" /> Personalizar Nuestra Pareja
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4 leading-normal">
                Aquí podéis cambiar vuestros nombres reales. Todos los turnos, gastos, recordatorios y estadísticas se actualizarán automáticamente a vuestros nombres.
              </p>

              {errorMsg && (
                <div className="p-2 mb-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveNames} className="space-y-4">
                {/* Persona 1 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Nombre de la Persona 1</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    placeholder="Ej: Sofía"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                {/* Persona 2 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Nombre de la Persona 2</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    placeholder="Ej: Mateo"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-md shadow-pink-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

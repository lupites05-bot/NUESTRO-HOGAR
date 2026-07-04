import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Search,
  Check,
  RotateCcw,
  Tag,
  Hash,
  FileText,
  Trash2,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppData, CoupleUser, ShoppingItem } from '../types.js';

interface ShoppingListProps {
  data: AppData;
  currentUser: CoupleUser;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'frequencyCount'>) => void;
  onUpdateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddSection: (section: string) => void;
}

export default function ShoppingList({
  data,
  currentUser,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddSection
}: ShoppingListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('Todas');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Form states
  const [itemName, setItemName] = useState('');
  const [itemSection, setItemSection] = useState('Fruta y verdura');
  const [itemQuantity, setItemQuantity] = useState('1 ud');
  const [itemNotes, setItemNotes] = useState('');
  
  // New section form state
  const [newSectionName, setNewSectionName] = useState('');

  // Expandable sections tracker
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (sec: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  // 1. Filter items based on search and section filter
  const activeItems = data.shoppingList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSectionFilter === 'Todas' || item.section === selectedSectionFilter;
    return matchesSearch && matchesSection;
  });

  const pendingItems = activeItems.filter(item => !item.purchased);
  const purchasedItems = activeItems.filter(item => item.purchased);

  // 2. Historial de compras frecuentes
  // Show items with frequencyCount >= 2 that are CURRENTLY marked as purchased (so they are not in the active shopping list)
  // Sorted by frequencyCount descending
  const frequentItems = data.shoppingList
    .filter(item => item.purchased && item.frequencyCount >= 1)
    .sort((a, b) => b.frequencyCount - a.frequencyCount)
    .slice(0, 6);

  // Form submit to add item
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    if (editingItem) {
      onUpdateItem(editingItem.id, {
        name: itemName.trim(),
        section: itemSection,
        quantity: itemQuantity,
        notes: itemNotes
      });
      setEditingItem(null);
    } else {
      onAddItem({
        name: itemName.trim(),
        section: itemSection,
        purchased: false,
        quantity: itemQuantity || '1 ud',
        notes: itemNotes,
        addedBy: currentUser
      });
    }

    setIsAddModalOpen(false);
    // Reset
    setItemName('');
    setItemQuantity('1 ud');
    setItemNotes('');
  };

  // Quick re-add frequent item
  const handleReaddFrequent = (item: ShoppingItem) => {
    onUpdateItem(item.id, {
      purchased: false,
      quantity: item.quantity || '1 ud',
      // We keep notes but let them know it's back in the active list
    });
  };

  // Form submit to add new custom section
  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    onAddSection(newSectionName.trim());
    setItemSection(newSectionName.trim()); // Set as selected section automatically
    setIsSectionModalOpen(false);
    setNewSectionName('');
  };

  const openEditModal = (item: ShoppingItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemSection(item.section);
    setItemQuantity(item.quantity);
    setItemNotes(item.notes);
    setIsAddModalOpen(true);
  };

  // Group pending items by section
  const pendingBySection: Record<string, ShoppingItem[]> = {};
  pendingItems.forEach(item => {
    if (!pendingBySection[item.section]) {
      pendingBySection[item.section] = [];
    }
    pendingBySection[item.section].push(item);
  });

  return (
    <div className="space-y-5 px-4 py-3 max-w-lg mx-auto">
      {/* Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-pink-500" /> Lista de la Compra
        </h2>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            title="Añadir Categoría"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setEditingItem(null);
              setItemName('');
              setItemQuantity('1 ud');
              setItemNotes('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md shadow-pink-500/15 transition-all"
          >
            <Plus className="w-4 h-4" /> Añadir Producto
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar en la lista (ej: Leche)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-100 outline-none placeholder-zinc-400 focus:border-pink-300 dark:focus:border-pink-800/40 transition-colors"
          />
        </div>

        {/* Category Horizontal Filter Scroller */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {['Todas', ...data.shoppingSections].map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-all ${
                selectedSectionFilter === sec
                  ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-white dark:text-zinc-900'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* HISTORIAL COMPRAS FRECUENTES */}
      {frequentItems.length > 0 && searchQuery === '' && selectedSectionFilter === 'Todas' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/5 to-sky-500/5 dark:from-pink-950/10 dark:to-zinc-900 border border-pink-500/10 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Compra Frecuente
          </div>
          <div className="grid grid-cols-2 gap-2">
            {frequentItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleReaddFrequent(item)}
                className="flex items-center justify-between text-left p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 hover:border-pink-300 dark:hover:border-pink-900/30 transition-colors group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 block truncate leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-zinc-400 block truncate">
                    {item.quantity} • {item.section}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center text-[10px] group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PENDING SHOPPING LIST (GROUPED BY CATEGORY) */}
      <div className="space-y-4">
        {Object.keys(pendingBySection).length > 0 ? (
          Object.keys(pendingBySection).map(section => {
            const isCollapsed = collapsedSections[section];
            const sectionItems = pendingBySection[section];

            return (
              <div
                key={section}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80 space-y-2"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSectionCollapse(section)}
                  className="w-full flex items-center justify-between py-1 text-left outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded bg-pink-500"></span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {section}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold font-mono">
                      {sectionItems.length}
                    </span>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {/* Section Items */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      {sectionItems.map(item => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 hover:border-pink-200 dark:hover:border-pink-900/20 transition-all group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            {/* Checkbox */}
                            <button
                              onClick={() => onUpdateItem(item.id, { purchased: true })}
                              className="w-4.5 h-4.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-pink-500 flex items-center justify-center mt-0.5 cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-colors"
                            >
                              <Check className="w-3 h-3 opacity-0 group-hover:opacity-30" />
                            </button>

                            <div className="min-w-0 flex-1" onClick={() => openEditModal(item)}>
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block truncate cursor-pointer hover:text-pink-500 transition-colors">
                                {item.name}
                              </span>
                              {(item.quantity || item.notes) && (
                                <p className="text-[10px] text-zinc-400 truncate">
                                  {item.quantity && <strong className="font-semibold text-zinc-500 dark:text-zinc-300 mr-1">{item.quantity}</strong>}
                                  {item.notes && <span>• {item.notes}</span>}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                              title="Editar"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1 rounded text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 rounded-3xl">
            <span className="text-3xl">🍏</span>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2">No hay productos pendientes</h3>
            <p className="text-xs text-zinc-400 mt-1">Busca productos arriba o presiona "Añadir Producto" para comenzar.</p>
          </div>
        )}
      </div>

      {/* COMPRADO RECIENTEMENTE (COLLAPSIBLE) */}
      {purchasedItems.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Comprado recientemente ({purchasedItems.length})
            </h3>
          </div>

          <ul className="space-y-1.5 opacity-60 hover:opacity-100 transition-opacity">
            {purchasedItems.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/20 border border-zinc-100/30 dark:border-zinc-800/40"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Checkbox (marked purchased) */}
                  <button
                    onClick={() => onUpdateItem(item.id, { purchased: false })}
                    className="w-4.5 h-4.5 rounded-lg bg-pink-500 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0 flex-1 line-through text-zinc-400 dark:text-zinc-500">
                    <span className="text-xs font-medium block truncate">
                      {item.name}
                    </span>
                    <span className="text-[9px] block">
                      {item.quantity} • {item.section}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 rounded text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400"
                  title="Eliminar del historial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
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
                {editingItem ? 'Editar Producto' : 'Añadir Producto a la Compra'}
              </h3>

              <form onSubmit={handleAddItemSubmit} className="space-y-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Plátanos, Papel de aluminio..."
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                {/* Section selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">Sección</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSectionModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-pink-600 dark:text-pink-400 hover:underline"
                    >
                      + Nueva Sección
                    </button>
                  </div>
                  <select
                    value={itemSection}
                    onChange={(e) => setItemSection(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  >
                    {data.shoppingSections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Cantidad</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: 1 ud, 2 packs, 1 kg..."
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  {/* Tap presets */}
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {['1 ud', '2 uds', '3 uds', '1 kg', '1 pack', '1 bolsa'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setItemQuantity(p)}
                        className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-300 font-semibold"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Notas adicionales</label>
                  <input
                    type="text"
                    placeholder="Ej: De la marca Hacendado, verdes..."
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
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
                    {editingItem ? 'Guardar' : 'Añadir'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD CUSTOM SECTION */}
      <AnimatePresence>
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3.5">
                Crear Nueva Sección o Pasillo
              </h3>

              <form onSubmit={handleAddSectionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Nombre de la Sección</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Perfumería, Bazar, Herboristería..."
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-md shadow-pink-500/10"
                  >
                    Crear Sección
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

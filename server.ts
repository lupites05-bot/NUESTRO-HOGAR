import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { AppData, WorkShift, CalendarEvent, ShoppingItem, Expense, Reminder, CoupleUser } from './src/types.js';

// Setup Express
const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a larger limit for ticket photos (base64)
app.use(express.json({ limit: '10mb' }));

// Initial State (Seed Data relative to Saturday, July 4, 2026)
const defaultSections = [
  'Fruta y verdura',
  'Carnicería',
  'Pescadería',
  'Congelados',
  'Lácteos',
  'Panadería',
  'Bebidas',
  'Limpieza',
  'Higiene',
  'Mascotas',
  'Bebé',
  'Otros'
];

let appData: AppData = {
  shifts: [
    // Sofía's shifts
    { id: 's1', user: 'Sofía', date: '2026-07-04', type: 'tarde', note: 'De 14:00 a 22:00' },
    { id: 's2', user: 'Sofía', date: '2026-07-05', type: 'libranzas', note: '¡Domingo libre!' },
    { id: 's3', user: 'Sofía', date: '2026-07-06', type: 'mañana', note: 'De 06:00 a 14:00' },
    { id: 's4', user: 'Sofía', date: '2026-07-07', type: 'mañana' },
    { id: 's5', user: 'Sofía', date: '2026-07-08', type: 'tarde' },
    { id: 's6', user: 'Sofía', date: '2026-07-09', type: 'tarde' },
    { id: 's7', user: 'Sofía', date: '2026-07-10', type: 'noche', note: 'Entra a las 22:00' },
    { id: 's8', user: 'Sofía', date: '2026-07-11', type: 'libranzas' },
    // Mateo's shifts
    { id: 'm1', user: 'Mateo', date: '2026-07-04', type: 'mañana', note: 'De 08:00 a 16:00' },
    { id: 'm2', user: 'Mateo', date: '2026-07-05', type: 'libranzas' },
    { id: 'm3', user: 'Mateo', date: '2026-07-06', type: 'partido', note: 'De 09:00 a 14:00 y 17:00 a 20:00' },
    { id: 'm4', user: 'Mateo', date: '2026-07-07', type: 'partido' },
    { id: 'm5', user: 'Mateo', date: '2026-07-08', type: 'mañana' },
    { id: 'm6', user: 'Mateo', date: '2026-07-09', type: 'mañana' },
    { id: 'm7', user: 'Mateo', date: '2026-07-10', type: 'libranzas' },
    { id: 'm8', user: 'Mateo', date: '2026-07-11', type: 'mañana' },
  ],
  events: [
    {
      id: 'e1',
      title: 'Cena de aniversario 👩‍❤️‍👨',
      user: 'compartido',
      date: '2026-07-05',
      time: '21:00',
      notes: 'Reservado en el restaurante italiano "La Bella Italia". Vestimenta formal-casual.',
      reminderMinutes: 120 // 2 hours before
    },
    {
      id: 'e2',
      title: 'Revisión dental Sofía 🦷',
      user: 'Sofía',
      date: '2026-07-07',
      time: '11:30',
      notes: 'Clínica Dental Dentalia. Llevar radiografía anterior.',
      reminderMinutes: 60
    },
    {
      id: 'e3',
      title: 'Reunión comunidad de vecinos 🏢',
      user: 'Mateo',
      date: '2026-07-09',
      time: '20:15',
      notes: 'En el portal. Temas: presupuesto fachada y limpieza.',
      reminderMinutes: 30
    },
    {
      id: 'e4',
      title: 'Veterinario para Luna (vacuna) 🐶',
      user: 'compartido',
      date: '2026-07-10',
      time: '17:00',
      notes: 'Llevar la cartilla de vacunación. Recordar el desparasitante.',
      reminderMinutes: 1440 // 1 day before
    }
  ],
  shoppingList: [
    { id: 'shop1', name: 'Leche de avena', section: 'Lácteos', purchased: false, quantity: '3 ladrillos', notes: 'Marca Oatly si hay', frequencyCount: 12, addedBy: 'Sofía', updatedAt: Date.now() },
    { id: 'shop2', name: 'Manzanas de Girona', section: 'Fruta y verdura', purchased: false, quantity: '1 kg', notes: 'De las rojas dulces', frequencyCount: 8, addedBy: 'Mateo', updatedAt: Date.now() - 5000 },
    { id: 'shop3', name: 'Filetes de pechuga de pollo', section: 'Carnicería', purchased: false, quantity: '500g', notes: 'Cortados finos', frequencyCount: 6, addedBy: 'Sofía', updatedAt: Date.now() - 10000 },
    { id: 'shop4', name: 'Salmón fresco', section: 'Pescadería', purchased: true, quantity: '2 lomos', notes: 'Pedir que quiten las escamas', frequencyCount: 4, addedBy: 'Mateo', updatedAt: Date.now() - 20000 },
    { id: 'shop5', name: 'Papel higiénico', section: 'Limpieza', purchased: false, quantity: '1 paquete', notes: 'Doble capa', frequencyCount: 9, addedBy: 'Mateo', updatedAt: Date.now() - 25000 },
    { id: 'shop6', name: 'Pan de centeno centeno', section: 'Panadería', purchased: true, quantity: '1 hogaza', notes: 'Rebanado', frequencyCount: 15, addedBy: 'Sofía', updatedAt: Date.now() - 30000 },
    { id: 'shop7', name: 'Comida húmeda Luna', section: 'Mascotas', purchased: false, quantity: '6 latas', notes: 'Sabor buey', frequencyCount: 10, addedBy: 'Mateo', updatedAt: Date.now() - 35000 },
  ],
  shoppingSections: [...defaultSections],
  expenses: [
    { id: 'exp1', type: 'gasto', amount: 48.50, description: 'Supermercado Mercadona', date: '2026-07-02', category: 'Alimentación', paidBy: 'Sofía' },
    { id: 'exp2', type: 'gasto', amount: 150.00, description: 'Suministro Electricidad Endesa', date: '2026-07-01', category: 'Facturas', paidBy: 'Mateo' },
    { id: 'exp3', type: 'gasto', amount: 12.99, description: 'Suscripción Netflix Duo', date: '2026-07-03', category: 'Suscripciones', paidBy: 'Mateo' },
    { id: 'exp4', type: 'gasto', amount: 35.00, description: 'Pienso Luna y juguetes', date: '2026-06-28', category: 'Mascotas', paidBy: 'Sofía' },
    { id: 'exp5', type: 'gasto', amount: 620.00, description: 'Alquiler Piso Julio', date: '2026-07-01', category: 'Vivienda', paidBy: 'Sofía' },
    { id: 'exp6', type: 'gasto', amount: 40.00, description: 'Cervezas y tapas con amigos', date: '2026-07-03', category: 'Ocio', paidBy: 'Mateo' },
    { id: 'exp7', type: 'ingreso', amount: 50.00, description: 'Bizum de la abuela para Luna', date: '2026-07-02', category: 'Otras', paidBy: 'Sofía' },
  ],
  reminders: [
    { id: 'r1', description: 'Regar las plantas de la terraza 🌿', user: 'compartido', dueDate: '2026-07-04', repetition: 'semanal', completed: false },
    { id: 'r2', description: 'Pagar alquiler de julio 🏠', user: 'compartido', dueDate: '2026-07-01', repetition: 'mensual', completed: true, completedBy: 'Sofía' },
    { id: 'r3', description: 'Llamar al fontanero por gotera baño', user: 'Mateo', dueDate: '2026-07-06', repetition: 'ninguna', completed: false },
    { id: 'r4', description: 'Preparar tuppers de la semana 🍱', user: 'compartido', dueDate: '2026-07-05', repetition: 'semanal', completed: false },
    { id: 'r5', description: 'Lavar las sábanas de la cama 🛏️', user: 'Sofía', dueDate: '2026-07-08', repetition: 'semanal', completed: false },
  ],
  userNames: ['Sofía', 'Mateo']
};

// HELPER: Generate unique string ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// REST API Endpoints

// 1. Get entire state (including categories and options)
app.get('/api/data', (req, res) => {
  res.json(appData);
});

// Update usernames and migrate historical data
app.put('/api/settings/usernames', (req, res) => {
  const { names } = req.body;
  if (!names || !Array.isArray(names) || names.length !== 2) {
    return res.status(400).json({ error: 'Se requieren exactamente dos nombres.' });
  }

  const newName1 = names[0]?.trim();
  const newName2 = names[1]?.trim();

  if (!newName1 || !newName2) {
    return res.status(400).json({ error: 'Los nombres de usuario no pueden estar vacíos.' });
  }

  const oldNames = appData.userNames || ['Sofía', 'Mateo'];
  const oldName1 = oldNames[0];
  const oldName2 = oldNames[1];

  const renameUser = (user: string) => {
    if (user === oldName1) return newName1;
    if (user === oldName2) return newName2;
    return user;
  };

  // Migrate database references
  appData.shifts = appData.shifts.map(s => ({ ...s, user: renameUser(s.user) }));
  appData.events = appData.events.map(e => ({ ...e, user: e.user === 'compartido' ? 'compartido' : renameUser(e.user) }));
  appData.shoppingList = appData.shoppingList.map(item => ({ ...item, addedBy: renameUser(item.addedBy) }));
  appData.expenses = appData.expenses.map(e => ({ ...e, paidBy: renameUser(e.paidBy) }));
  appData.reminders = appData.reminders.map(r => ({
    ...r,
    user: r.user === 'compartido' ? 'compartido' : renameUser(r.user),
    completedBy: r.completedBy ? renameUser(r.completedBy) : r.completedBy
  }));

  appData.userNames = [newName1, newName2];
  res.json({ success: true, userNames: appData.userNames });
});

// 2. Shifts operations
app.post('/api/shifts', (req, res) => {
  const { user, date, type, note } = req.body;
  if (!user || !date) {
    return res.status(400).json({ error: 'User and Date are required.' });
  }

  // Remove existing shift for this user and date
  appData.shifts = appData.shifts.filter(s => !(s.user === user && s.date === date));

  // If a valid type is supplied, insert it
  if (type && type !== 'none') {
    const newShift: WorkShift = {
      id: generateId(),
      user,
      date,
      type,
      note: note || undefined
    };
    appData.shifts.push(newShift);
    res.status(201).json(newShift);
  } else {
    res.json({ message: 'Shift cleared', deleted: true });
  }
});

// 3. Events operations
app.post('/api/events', (req, res) => {
  const { title, user, date, time, notes, reminderMinutes } = req.body;
  if (!title || !user || !date) {
    return res.status(400).json({ error: 'Title, user, and date are required.' });
  }

  const newEvent: CalendarEvent = {
    id: generateId(),
    title,
    user,
    date,
    time: time || undefined,
    notes: notes || undefined,
    reminderMinutes: reminderMinutes !== undefined ? Number(reminderMinutes) : -1
  };

  appData.events.push(newEvent);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const index = appData.events.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const { title, user, date, time, notes, reminderMinutes } = req.body;
  appData.events[index] = {
    ...appData.events[index],
    title: title !== undefined ? title : appData.events[index].title,
    user: user !== undefined ? user : appData.events[index].user,
    date: date !== undefined ? date : appData.events[index].date,
    time: time !== undefined ? time : appData.events[index].time,
    notes: notes !== undefined ? notes : appData.events[index].notes,
    reminderMinutes: reminderMinutes !== undefined ? Number(reminderMinutes) : appData.events[index].reminderMinutes
  };

  res.json(appData.events[index]);
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  appData.events = appData.events.filter(e => e.id !== id);
  res.json({ success: true });
});

// 4. Shopping list operations
app.post('/api/shopping', (req, res) => {
  const { name, section, quantity, notes, addedBy } = req.body;
  if (!name || !section || !addedBy) {
    return res.status(400).json({ error: 'Name, section, and addedBy are required.' });
  }

  // Check if item already exists
  const existingIndex = appData.shoppingList.findIndex(
    item => item.name.toLowerCase().trim() === name.toLowerCase().trim() && !item.purchased
  );

  if (existingIndex !== -1) {
    // Increment frequency and update notes/quantity
    appData.shoppingList[existingIndex].frequencyCount += 1;
    appData.shoppingList[existingIndex].quantity = quantity || appData.shoppingList[existingIndex].quantity;
    appData.shoppingList[existingIndex].notes = notes || appData.shoppingList[existingIndex].notes;
    appData.shoppingList[existingIndex].updatedAt = Date.now();
    return res.json(appData.shoppingList[existingIndex]);
  }

  const newItem: ShoppingItem = {
    id: generateId(),
    name,
    section,
    purchased: false,
    quantity: quantity || '1 ud',
    notes: notes || '',
    frequencyCount: 1,
    addedBy,
    updatedAt: Date.now()
  };

  appData.shoppingList.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/shopping/:id', (req, res) => {
  const { id } = req.params;
  const index = appData.shoppingList.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Shopping item not found.' });
  }

  const { purchased, quantity, notes, name, section } = req.body;

  if (purchased !== undefined) {
    appData.shoppingList[index].purchased = purchased;
    if (purchased) {
      appData.shoppingList[index].frequencyCount += 1;
    }
  }
  if (quantity !== undefined) appData.shoppingList[index].quantity = quantity;
  if (notes !== undefined) appData.shoppingList[index].notes = notes;
  if (name !== undefined) appData.shoppingList[index].name = name;
  if (section !== undefined) appData.shoppingList[index].section = section;
  appData.shoppingList[index].updatedAt = Date.now();

  res.json(appData.shoppingList[index]);
});

app.delete('/api/shopping/:id', (req, res) => {
  const { id } = req.params;
  appData.shoppingList = appData.shoppingList.filter(item => item.id !== id);
  res.json({ success: true });
});

app.post('/api/shopping/sections', (req, res) => {
  const { section } = req.body;
  if (!section) {
    return res.status(400).json({ error: 'Section name is required.' });
  }

  const cleanSection = section.trim();
  if (appData.shoppingSections.map(s => s.toLowerCase()).includes(cleanSection.toLowerCase())) {
    return res.status(400).json({ error: 'Section already exists.' });
  }

  appData.shoppingSections.push(cleanSection);
  res.status(201).json({ sections: appData.shoppingSections, added: cleanSection });
});

// 5. Expenses operations
app.post('/api/expenses', (req, res) => {
  const { type, amount, description, date, category, paidBy, ticketPhoto } = req.body;
  if (!type || !amount || !description || !date || !category || !paidBy) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newExpense: Expense = {
    id: generateId(),
    type,
    amount: Number(amount),
    description,
    date,
    category,
    paidBy,
    ticketPhoto: ticketPhoto || undefined
  };

  appData.expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const index = appData.expenses.findIndex(exp => exp.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const { type, amount, description, date, category, paidBy, ticketPhoto } = req.body;

  appData.expenses[index] = {
    ...appData.expenses[index],
    type: type !== undefined ? type : appData.expenses[index].type,
    amount: amount !== undefined ? Number(amount) : appData.expenses[index].amount,
    description: description !== undefined ? description : appData.expenses[index].description,
    date: date !== undefined ? date : appData.expenses[index].date,
    category: category !== undefined ? category : appData.expenses[index].category,
    paidBy: paidBy !== undefined ? paidBy : appData.expenses[index].paidBy,
    ticketPhoto: ticketPhoto !== undefined ? ticketPhoto : appData.expenses[index].ticketPhoto
  };

  res.json(appData.expenses[index]);
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  appData.expenses = appData.expenses.filter(exp => exp.id !== id);
  res.json({ success: true });
});

// 6. Reminders operations
app.post('/api/reminders', (req, res) => {
  const { description, user, dueDate, dueTime, repetition } = req.body;
  if (!description || !user || !dueDate) {
    return res.status(400).json({ error: 'Description, user and dueDate are required.' });
  }

  const newReminder: Reminder = {
    id: generateId(),
    description,
    user,
    dueDate,
    dueTime: dueTime || undefined,
    repetition: repetition || 'ninguna',
    completed: false
  };

  appData.reminders.push(newReminder);
  res.status(201).json(newReminder);
});

app.put('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  const index = appData.reminders.findIndex(rem => rem.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reminder not found.' });
  }

  const { description, user, dueDate, dueTime, repetition, completed, completedBy } = req.body;

  appData.reminders[index] = {
    ...appData.reminders[index],
    description: description !== undefined ? description : appData.reminders[index].description,
    user: user !== undefined ? user : appData.reminders[index].user,
    dueDate: dueDate !== undefined ? dueDate : appData.reminders[index].dueDate,
    dueTime: dueTime !== undefined ? dueTime : appData.reminders[index].dueTime,
    repetition: repetition !== undefined ? repetition : appData.reminders[index].repetition,
    completed: completed !== undefined ? completed : appData.reminders[index].completed,
    completedBy: completedBy !== undefined ? completedBy : appData.reminders[index].completedBy
  };

  res.json(appData.reminders[index]);
});

app.delete('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  appData.reminders = appData.reminders.filter(rem => rem.id !== id);
  res.json({ success: true });
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nuestro Hogar Server running on port ${PORT}`);
  });
}

startServer();

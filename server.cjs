var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var defaultSections = [
  "Fruta y verdura",
  "Carnicer\xEDa",
  "Pescader\xEDa",
  "Congelados",
  "L\xE1cteos",
  "Panader\xEDa",
  "Bebidas",
  "Limpieza",
  "Higiene",
  "Mascotas",
  "Beb\xE9",
  "Otros"
];
var appData = {
  shifts: [
    // Sofía's shifts
    { id: "s1", user: "Sof\xEDa", date: "2026-07-04", type: "tarde", note: "De 14:00 a 22:00" },
    { id: "s2", user: "Sof\xEDa", date: "2026-07-05", type: "libranzas", note: "\xA1Domingo libre!" },
    { id: "s3", user: "Sof\xEDa", date: "2026-07-06", type: "ma\xF1ana", note: "De 06:00 a 14:00" },
    { id: "s4", user: "Sof\xEDa", date: "2026-07-07", type: "ma\xF1ana" },
    { id: "s5", user: "Sof\xEDa", date: "2026-07-08", type: "tarde" },
    { id: "s6", user: "Sof\xEDa", date: "2026-07-09", type: "tarde" },
    { id: "s7", user: "Sof\xEDa", date: "2026-07-10", type: "noche", note: "Entra a las 22:00" },
    { id: "s8", user: "Sof\xEDa", date: "2026-07-11", type: "libranzas" },
    // Mateo's shifts
    { id: "m1", user: "Mateo", date: "2026-07-04", type: "ma\xF1ana", note: "De 08:00 a 16:00" },
    { id: "m2", user: "Mateo", date: "2026-07-05", type: "libranzas" },
    { id: "m3", user: "Mateo", date: "2026-07-06", type: "partido", note: "De 09:00 a 14:00 y 17:00 a 20:00" },
    { id: "m4", user: "Mateo", date: "2026-07-07", type: "partido" },
    { id: "m5", user: "Mateo", date: "2026-07-08", type: "ma\xF1ana" },
    { id: "m6", user: "Mateo", date: "2026-07-09", type: "ma\xF1ana" },
    { id: "m7", user: "Mateo", date: "2026-07-10", type: "libranzas" },
    { id: "m8", user: "Mateo", date: "2026-07-11", type: "ma\xF1ana" }
  ],
  events: [
    {
      id: "e1",
      title: "Cena de aniversario \u{1F469}\u200D\u2764\uFE0F\u200D\u{1F468}",
      user: "compartido",
      date: "2026-07-05",
      time: "21:00",
      notes: 'Reservado en el restaurante italiano "La Bella Italia". Vestimenta formal-casual.',
      reminderMinutes: 120
      // 2 hours before
    },
    {
      id: "e2",
      title: "Revisi\xF3n dental Sof\xEDa \u{1F9B7}",
      user: "Sof\xEDa",
      date: "2026-07-07",
      time: "11:30",
      notes: "Cl\xEDnica Dental Dentalia. Llevar radiograf\xEDa anterior.",
      reminderMinutes: 60
    },
    {
      id: "e3",
      title: "Reuni\xF3n comunidad de vecinos \u{1F3E2}",
      user: "Mateo",
      date: "2026-07-09",
      time: "20:15",
      notes: "En el portal. Temas: presupuesto fachada y limpieza.",
      reminderMinutes: 30
    },
    {
      id: "e4",
      title: "Veterinario para Luna (vacuna) \u{1F436}",
      user: "compartido",
      date: "2026-07-10",
      time: "17:00",
      notes: "Llevar la cartilla de vacunaci\xF3n. Recordar el desparasitante.",
      reminderMinutes: 1440
      // 1 day before
    }
  ],
  shoppingList: [
    { id: "shop1", name: "Leche de avena", section: "L\xE1cteos", purchased: false, quantity: "3 ladrillos", notes: "Marca Oatly si hay", frequencyCount: 12, addedBy: "Sof\xEDa", updatedAt: Date.now() },
    { id: "shop2", name: "Manzanas de Girona", section: "Fruta y verdura", purchased: false, quantity: "1 kg", notes: "De las rojas dulces", frequencyCount: 8, addedBy: "Mateo", updatedAt: Date.now() - 5e3 },
    { id: "shop3", name: "Filetes de pechuga de pollo", section: "Carnicer\xEDa", purchased: false, quantity: "500g", notes: "Cortados finos", frequencyCount: 6, addedBy: "Sof\xEDa", updatedAt: Date.now() - 1e4 },
    { id: "shop4", name: "Salm\xF3n fresco", section: "Pescader\xEDa", purchased: true, quantity: "2 lomos", notes: "Pedir que quiten las escamas", frequencyCount: 4, addedBy: "Mateo", updatedAt: Date.now() - 2e4 },
    { id: "shop5", name: "Papel higi\xE9nico", section: "Limpieza", purchased: false, quantity: "1 paquete", notes: "Doble capa", frequencyCount: 9, addedBy: "Mateo", updatedAt: Date.now() - 25e3 },
    { id: "shop6", name: "Pan de centeno centeno", section: "Panader\xEDa", purchased: true, quantity: "1 hogaza", notes: "Rebanado", frequencyCount: 15, addedBy: "Sof\xEDa", updatedAt: Date.now() - 3e4 },
    { id: "shop7", name: "Comida h\xFAmeda Luna", section: "Mascotas", purchased: false, quantity: "6 latas", notes: "Sabor buey", frequencyCount: 10, addedBy: "Mateo", updatedAt: Date.now() - 35e3 }
  ],
  shoppingSections: [...defaultSections],
  expenses: [
    { id: "exp1", type: "gasto", amount: 48.5, description: "Supermercado Mercadona", date: "2026-07-02", category: "Alimentaci\xF3n", paidBy: "Sof\xEDa" },
    { id: "exp2", type: "gasto", amount: 150, description: "Suministro Electricidad Endesa", date: "2026-07-01", category: "Facturas", paidBy: "Mateo" },
    { id: "exp3", type: "gasto", amount: 12.99, description: "Suscripci\xF3n Netflix Duo", date: "2026-07-03", category: "Suscripciones", paidBy: "Mateo" },
    { id: "exp4", type: "gasto", amount: 35, description: "Pienso Luna y juguetes", date: "2026-06-28", category: "Mascotas", paidBy: "Sof\xEDa" },
    { id: "exp5", type: "gasto", amount: 620, description: "Alquiler Piso Julio", date: "2026-07-01", category: "Vivienda", paidBy: "Sof\xEDa" },
    { id: "exp6", type: "gasto", amount: 40, description: "Cervezas y tapas con amigos", date: "2026-07-03", category: "Ocio", paidBy: "Mateo" },
    { id: "exp7", type: "ingreso", amount: 50, description: "Bizum de la abuela para Luna", date: "2026-07-02", category: "Otras", paidBy: "Sof\xEDa" }
  ],
  reminders: [
    { id: "r1", description: "Regar las plantas de la terraza \u{1F33F}", user: "compartido", dueDate: "2026-07-04", repetition: "semanal", completed: false },
    { id: "r2", description: "Pagar alquiler de julio \u{1F3E0}", user: "compartido", dueDate: "2026-07-01", repetition: "mensual", completed: true, completedBy: "Sof\xEDa" },
    { id: "r3", description: "Llamar al fontanero por gotera ba\xF1o", user: "Mateo", dueDate: "2026-07-06", repetition: "ninguna", completed: false },
    { id: "r4", description: "Preparar tuppers de la semana \u{1F371}", user: "compartido", dueDate: "2026-07-05", repetition: "semanal", completed: false },
    { id: "r5", description: "Lavar las s\xE1banas de la cama \u{1F6CF}\uFE0F", user: "Sof\xEDa", dueDate: "2026-07-08", repetition: "semanal", completed: false }
  ],
  userNames: ["Sof\xEDa", "Mateo"]
};
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
app.get("/api/data", (req, res) => {
  res.json(appData);
});
app.put("/api/settings/usernames", (req, res) => {
  const { names } = req.body;
  if (!names || !Array.isArray(names) || names.length !== 2) {
    return res.status(400).json({ error: "Se requieren exactamente dos nombres." });
  }
  const newName1 = names[0]?.trim();
  const newName2 = names[1]?.trim();
  if (!newName1 || !newName2) {
    return res.status(400).json({ error: "Los nombres de usuario no pueden estar vac\xEDos." });
  }
  const oldNames = appData.userNames || ["Sof\xEDa", "Mateo"];
  const oldName1 = oldNames[0];
  const oldName2 = oldNames[1];
  const renameUser = (user) => {
    if (user === oldName1) return newName1;
    if (user === oldName2) return newName2;
    return user;
  };
  appData.shifts = appData.shifts.map((s) => ({ ...s, user: renameUser(s.user) }));
  appData.events = appData.events.map((e) => ({ ...e, user: e.user === "compartido" ? "compartido" : renameUser(e.user) }));
  appData.shoppingList = appData.shoppingList.map((item) => ({ ...item, addedBy: renameUser(item.addedBy) }));
  appData.expenses = appData.expenses.map((e) => ({ ...e, paidBy: renameUser(e.paidBy) }));
  appData.reminders = appData.reminders.map((r) => ({
    ...r,
    user: r.user === "compartido" ? "compartido" : renameUser(r.user),
    completedBy: r.completedBy ? renameUser(r.completedBy) : r.completedBy
  }));
  appData.userNames = [newName1, newName2];
  res.json({ success: true, userNames: appData.userNames });
});
app.post("/api/shifts", (req, res) => {
  const { user, date, type, note } = req.body;
  if (!user || !date) {
    return res.status(400).json({ error: "User and Date are required." });
  }
  appData.shifts = appData.shifts.filter((s) => !(s.user === user && s.date === date));
  if (type && type !== "none") {
    const newShift = {
      id: generateId(),
      user,
      date,
      type,
      note: note || void 0
    };
    appData.shifts.push(newShift);
    res.status(201).json(newShift);
  } else {
    res.json({ message: "Shift cleared", deleted: true });
  }
});
app.post("/api/events", (req, res) => {
  const { title, user, date, time, notes, reminderMinutes } = req.body;
  if (!title || !user || !date) {
    return res.status(400).json({ error: "Title, user, and date are required." });
  }
  const newEvent = {
    id: generateId(),
    title,
    user,
    date,
    time: time || void 0,
    notes: notes || void 0,
    reminderMinutes: reminderMinutes !== void 0 ? Number(reminderMinutes) : -1
  };
  appData.events.push(newEvent);
  res.status(201).json(newEvent);
});
app.put("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const index = appData.events.findIndex((e) => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Event not found." });
  }
  const { title, user, date, time, notes, reminderMinutes } = req.body;
  appData.events[index] = {
    ...appData.events[index],
    title: title !== void 0 ? title : appData.events[index].title,
    user: user !== void 0 ? user : appData.events[index].user,
    date: date !== void 0 ? date : appData.events[index].date,
    time: time !== void 0 ? time : appData.events[index].time,
    notes: notes !== void 0 ? notes : appData.events[index].notes,
    reminderMinutes: reminderMinutes !== void 0 ? Number(reminderMinutes) : appData.events[index].reminderMinutes
  };
  res.json(appData.events[index]);
});
app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  appData.events = appData.events.filter((e) => e.id !== id);
  res.json({ success: true });
});
app.post("/api/shopping", (req, res) => {
  const { name, section, quantity, notes, addedBy } = req.body;
  if (!name || !section || !addedBy) {
    return res.status(400).json({ error: "Name, section, and addedBy are required." });
  }
  const existingIndex = appData.shoppingList.findIndex(
    (item) => item.name.toLowerCase().trim() === name.toLowerCase().trim() && !item.purchased
  );
  if (existingIndex !== -1) {
    appData.shoppingList[existingIndex].frequencyCount += 1;
    appData.shoppingList[existingIndex].quantity = quantity || appData.shoppingList[existingIndex].quantity;
    appData.shoppingList[existingIndex].notes = notes || appData.shoppingList[existingIndex].notes;
    appData.shoppingList[existingIndex].updatedAt = Date.now();
    return res.json(appData.shoppingList[existingIndex]);
  }
  const newItem = {
    id: generateId(),
    name,
    section,
    purchased: false,
    quantity: quantity || "1 ud",
    notes: notes || "",
    frequencyCount: 1,
    addedBy,
    updatedAt: Date.now()
  };
  appData.shoppingList.push(newItem);
  res.status(201).json(newItem);
});
app.put("/api/shopping/:id", (req, res) => {
  const { id } = req.params;
  const index = appData.shoppingList.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Shopping item not found." });
  }
  const { purchased, quantity, notes, name, section } = req.body;
  if (purchased !== void 0) {
    appData.shoppingList[index].purchased = purchased;
    if (purchased) {
      appData.shoppingList[index].frequencyCount += 1;
    }
  }
  if (quantity !== void 0) appData.shoppingList[index].quantity = quantity;
  if (notes !== void 0) appData.shoppingList[index].notes = notes;
  if (name !== void 0) appData.shoppingList[index].name = name;
  if (section !== void 0) appData.shoppingList[index].section = section;
  appData.shoppingList[index].updatedAt = Date.now();
  res.json(appData.shoppingList[index]);
});
app.delete("/api/shopping/:id", (req, res) => {
  const { id } = req.params;
  appData.shoppingList = appData.shoppingList.filter((item) => item.id !== id);
  res.json({ success: true });
});
app.post("/api/shopping/sections", (req, res) => {
  const { section } = req.body;
  if (!section) {
    return res.status(400).json({ error: "Section name is required." });
  }
  const cleanSection = section.trim();
  if (appData.shoppingSections.map((s) => s.toLowerCase()).includes(cleanSection.toLowerCase())) {
    return res.status(400).json({ error: "Section already exists." });
  }
  appData.shoppingSections.push(cleanSection);
  res.status(201).json({ sections: appData.shoppingSections, added: cleanSection });
});
app.post("/api/expenses", (req, res) => {
  const { type, amount, description, date, category, paidBy, ticketPhoto } = req.body;
  if (!type || !amount || !description || !date || !category || !paidBy) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const newExpense = {
    id: generateId(),
    type,
    amount: Number(amount),
    description,
    date,
    category,
    paidBy,
    ticketPhoto: ticketPhoto || void 0
  };
  appData.expenses.push(newExpense);
  res.status(201).json(newExpense);
});
app.put("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const index = appData.expenses.findIndex((exp) => exp.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Expense not found." });
  }
  const { type, amount, description, date, category, paidBy, ticketPhoto } = req.body;
  appData.expenses[index] = {
    ...appData.expenses[index],
    type: type !== void 0 ? type : appData.expenses[index].type,
    amount: amount !== void 0 ? Number(amount) : appData.expenses[index].amount,
    description: description !== void 0 ? description : appData.expenses[index].description,
    date: date !== void 0 ? date : appData.expenses[index].date,
    category: category !== void 0 ? category : appData.expenses[index].category,
    paidBy: paidBy !== void 0 ? paidBy : appData.expenses[index].paidBy,
    ticketPhoto: ticketPhoto !== void 0 ? ticketPhoto : appData.expenses[index].ticketPhoto
  };
  res.json(appData.expenses[index]);
});
app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  appData.expenses = appData.expenses.filter((exp) => exp.id !== id);
  res.json({ success: true });
});
app.post("/api/reminders", (req, res) => {
  const { description, user, dueDate, dueTime, repetition } = req.body;
  if (!description || !user || !dueDate) {
    return res.status(400).json({ error: "Description, user and dueDate are required." });
  }
  const newReminder = {
    id: generateId(),
    description,
    user,
    dueDate,
    dueTime: dueTime || void 0,
    repetition: repetition || "ninguna",
    completed: false
  };
  appData.reminders.push(newReminder);
  res.status(201).json(newReminder);
});
app.put("/api/reminders/:id", (req, res) => {
  const { id } = req.params;
  const index = appData.reminders.findIndex((rem) => rem.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Reminder not found." });
  }
  const { description, user, dueDate, dueTime, repetition, completed, completedBy } = req.body;
  appData.reminders[index] = {
    ...appData.reminders[index],
    description: description !== void 0 ? description : appData.reminders[index].description,
    user: user !== void 0 ? user : appData.reminders[index].user,
    dueDate: dueDate !== void 0 ? dueDate : appData.reminders[index].dueDate,
    dueTime: dueTime !== void 0 ? dueTime : appData.reminders[index].dueTime,
    repetition: repetition !== void 0 ? repetition : appData.reminders[index].repetition,
    completed: completed !== void 0 ? completed : appData.reminders[index].completed,
    completedBy: completedBy !== void 0 ? completedBy : appData.reminders[index].completedBy
  };
  res.json(appData.reminders[index]);
});
app.delete("/api/reminders/:id", (req, res) => {
  const { id } = req.params;
  appData.reminders = appData.reminders.filter((rem) => rem.id !== id);
  res.json({ success: true });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nuestro Hogar Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

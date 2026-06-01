// models/usersData.js
// In-memory "database" — an array of users + helper functions.
// In assignment 3 this whole file will be replaced by MySQL queries,
// but the function signatures (getAll, getById, ...) will stay the same.

let users = [
  {
    userId: 1,
    firstName: "Hadar",
    lastName: "Ofer",
    createDate: "2026-03-01T10:00:00Z",
    updateDate: "2026-03-01T10:00:00Z",
    userRole: "admin"
  },
  {
    userId: 2,
    firstName: "Shir",
    lastName: "Battat",
    createDate: "2026-03-02T11:30:00Z",
    updateDate: "2026-03-02T11:30:00Z",
    userRole: "admin"
  },
  {
    userId: 3,
    firstName: "Noa",
    lastName: "Kirel",
    createDate: "2026-03-05T09:15:00Z",
    updateDate: "2026-03-05T09:15:00Z",
    userRole: "manager"
  },
  {
    userId: 4,
    firstName: "Matan",
    lastName: "Perez",
    createDate: "2026-03-08T14:20:00Z",
    updateDate: "2026-03-08T14:20:00Z",
    userRole: "user"
  },
  {
    userId: 5,
    firstName: "Maya",
    lastName: "Vertheimer",
    createDate: "2026-03-10T08:45:00Z",
    updateDate: "2026-03-10T08:45:00Z",
    userRole: "user"
  }
];

// Auto-incremented id for new users. Resets on server restart (in-memory).
let nextId = 6;

function getAll() {
  return users;
}

function getById(id) {
  return users.find(u => u.userId === id);
}

function add(userData) {
  const now = new Date().toISOString();
  const newUser = {
    userId: nextId++,
    firstName: userData.firstName,
    lastName: userData.lastName,
    userRole: userData.userRole || 'user', // default role if not provided
    createDate: now,
    updateDate: now
  };
  users.push(newUser);
  return newUser;
}

function update(id, userData) {
  const user = users.find(u => u.userId === id);
  if (!user) return null; // null signals "not found" to the controller
  user.firstName = userData.firstName;
  user.lastName = userData.lastName;
  user.userRole = userData.userRole;
  user.updateDate = new Date().toISOString();
  return user;
}

function remove(id) {
  const index = users.findIndex(u => u.userId === id);
  if (index === -1) return null;
  const [removed] = users.splice(index, 1); // splice removes in place
  return removed;
}

module.exports = { getAll, getById, add, update, remove };

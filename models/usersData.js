
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
  // Create a new user object with a unique id and timestamps, add to array, and return it.
  const now = new Date().toISOString();
  const newUser = {
    userId: nextId++,
    firstName: userData.firstName,
    lastName: userData.lastName,
    userRole: userData.userRole || 'user', 
    createDate: now,
    updateDate: now
  };
  users.push(newUser);
  return newUser;
}

function update(id, userData) {
  // Find the user by id. If not found, return null.
  const user = users.find(u => u.userId === id);
  if (!user) return null; 
  user.firstName = userData.firstName;
  user.lastName = userData.lastName;
  user.userRole = userData.userRole;
  user.updateDate = new Date().toISOString();
  return user;
}

function remove(id) {
  // Find the index of the user by id. If not found, return null.
  const index = users.findIndex(u => u.userId === id);
  if (index === -1) return null;
  const [removed] = users.splice(index, 1); // splice returns an array of removed items, we want the first one
  return removed;
}

module.exports = { getAll, getById, add, update, remove };

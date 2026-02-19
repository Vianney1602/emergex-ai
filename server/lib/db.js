import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../db.json');

/**
 * Read the JSON database.
 */
export function readDb() {
    try {
        return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    } catch {
        return { users: [] };
    }
}

/**
 * Write to the JSON database.
 */
export function writeDb(data) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * Find a user by email.
 */
export function findUserByEmail(email) {
    const db = readDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find a user by ID.
 */
export function findUserById(id) {
    const db = readDb();
    return db.users.find((u) => u.id === id);
}

/**
 * Create a new user record.
 */
export function createUser(user) {
    const db = readDb();
    db.users.push(user);
    writeDb(db);
    return user;
}

/**
 * Update an existing user record.
 */
export function updateUser(id, updates) {
    const db = readDb();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
    writeDb(db);
    return db.users[idx];
}

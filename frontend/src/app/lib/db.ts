/**
 * Lightweight client-side "database" for Smart-RentHouse.
 *
 * This project ships as a static frontend with no backend server, so there is
 * nowhere to run a real SQL database or send real SMS messages. To make the
 * phone + OTP flow, the tenant roster, and the usage/payment history behave
 * like a real persistent system, all of it is modeled here and stored in the
 * browser's localStorage. Swapping this file for real API calls (e.g. to a
 * Postgres backend + an SMS provider like Twilio) is the only thing a backend
 * integration would need to touch — every page in the app only talks to the
 * functions exported below.
 */

export type Role = 'landlord' | 'renter';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'N/A';

export interface UserRecord {
  id: string;
  phone: string;        // normalized, globally unique -> "one account per person"
  name: string;
  role: Role;
  communityId: string;
  roomNumber?: string;   // renters only
  createdAt: string;
}

export interface Community {
  id: string;
  code: string;          // shareable invite code, e.g. "GRAND-4F2A"
  name: string;
  landlordPhone: string;
  lateFee: number;
  createdAt: string;
}

export interface Room {
  id: number;
  number: string;
  floor: string;
  renter: string;
  phone: string;
  rent: number;
  water: { previous: number; current: number; rate: number };
  electric: { previous: number; current: number; rate: number };
  paymentStatus: PaymentStatus;
  problem: string;
  status: 'Occupied' | 'Vacant';
  dueDay: number;
}

export interface UsageRecord {
  id: string;
  phone: string;
  communityId: string;
  type: 'water' | 'electric';
  previous: number;
  current: number;
  submittedAt: string;
}

export interface PaymentRecord {
  id: string;
  phone: string;
  communityId: string;
  description: string;
  amountUSD: number;
  amountRiel: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidAt: string;
}

interface OtpSession {
  phone: string;
  code: string;
  purpose: string;
  expiresAt: number;
}

const KEYS = {
  version: 'srkh_db_version',
  users: 'srkh_users',
  communities: 'srkh_communities',
  rooms: 'srkh_rooms', // { [communityId]: Room[] }
  usage: 'srkh_usage',
  payments: 'srkh_payments',
  otp: 'srkh_otp',
  session: 'srkh_session', // phone of logged-in user
} as const;

// Bumping this wipes any old demo/sample data left over from previous
// versions of the app, so every install starts from a clean slate.
const DB_VERSION = '2';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function resetDatabase() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.setItem(KEYS.version, DB_VERSION);
}

export function ensureFreshDatabase() {
  const version = localStorage.getItem(KEYS.version);
  if (version !== DB_VERSION) {
    resetDatabase();
  }
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Users ----------

export function getUsers(): UserRecord[] {
  return read<UserRecord[]>(KEYS.users, []);
}

export function findUserByPhone(phone: string): UserRecord | undefined {
  const p = normalizePhone(phone);
  return getUsers().find(u => u.phone === p);
}

function saveUser(user: UserRecord) {
  const users = getUsers();
  users.push(user);
  write(KEYS.users, users);
}

// ---------- Communities ----------

export function getCommunities(): Community[] {
  return read<Community[]>(KEYS.communities, []);
}

export function findCommunityById(id: string): Community | undefined {
  return getCommunities().find(c => c.id === id);
}

export function findCommunityByCode(code: string): Community | undefined {
  const normalized = code.trim().toUpperCase();
  return getCommunities().find(c => c.code === normalized);
}

function generateInviteCode(name: string): string {
  const prefix = (name || 'COMM').replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'COMM';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

// ---------- Rooms (landlord's tenant database) ----------

export function getRooms(communityId: string): Room[] {
  const all = read<Record<string, Room[]>>(KEYS.rooms, {});
  return all[communityId] ?? [];
}

export function saveRooms(communityId: string, rooms: Room[]) {
  const all = read<Record<string, Room[]>>(KEYS.rooms, {});
  all[communityId] = rooms;
  write(KEYS.rooms, all);
}

/** Adds (or updates) a room entry for a tenant who just joined the community. */
function upsertTenantRoom(communityId: string, tenant: { name: string; phone: string; roomNumber?: string }) {
  const rooms = getRooms(communityId);
  const roomNumber = (tenant.roomNumber || '').trim();

  if (roomNumber) {
    const existing = rooms.find(r => r.number.toLowerCase() === roomNumber.toLowerCase());
    if (existing) {
      existing.renter = tenant.name;
      existing.phone = tenant.phone;
      existing.status = 'Occupied';
      existing.paymentStatus = 'Pending';
      saveRooms(communityId, rooms);
      return;
    }
  }

  const nextId = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
  rooms.push({
    id: nextId,
    number: roomNumber || `T${nextId}`,
    floor: 'G',
    renter: tenant.name,
    phone: tenant.phone,
    rent: 0,
    water: { previous: 0, current: 0, rate: 2500 },
    electric: { previous: 0, current: 0, rate: 1000 },
    paymentStatus: 'Pending',
    problem: '',
    status: 'Occupied',
    dueDay: 1,
  });
  saveRooms(communityId, rooms);
}

// ---------- OTP ----------

const OTP_TTL_MS = 5 * 60 * 1000;

/**
 * Simulates sending an SMS OTP. There is no SMS provider wired up in this
 * static build, so the code is generated and stored locally, then returned
 * to the caller so the UI can show it as "demo mode". Wire this up to a real
 * SMS gateway (Twilio, etc.) from a backend to send it for real.
 */
export function requestOtp(phone: string, purpose: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const sessions = read<OtpSession[]>(KEYS.otp, []).filter(s => s.phone !== normalizePhone(phone) || s.purpose !== purpose);
  sessions.push({ phone: normalizePhone(phone), code, purpose, expiresAt: Date.now() + OTP_TTL_MS });
  write(KEYS.otp, sessions);
  return code;
}

export function verifyOtp(phone: string, purpose: string, code: string): boolean {
  const p = normalizePhone(phone);
  const sessions = read<OtpSession[]>(KEYS.otp, []);
  const match = sessions.find(s => s.phone === p && s.purpose === purpose);
  if (!match) return false;
  if (Date.now() > match.expiresAt) return false;
  if (match.code !== code.trim()) return false;
  write(KEYS.otp, sessions.filter(s => s !== match));
  return true;
}

// ---------- Registration ----------

export class DbError extends Error {}

export function createLandlord(data: { name: string; phone: string; communityName: string; lateFee?: number }): UserRecord {
  const phone = normalizePhone(data.phone);
  if (findUserByPhone(phone)) {
    throw new DbError('This phone number already has an account. Please log in instead.');
  }
  const community: Community = {
    id: uid('community'),
    code: generateInviteCode(data.communityName),
    name: data.communityName,
    landlordPhone: phone,
    lateFee: data.lateFee ?? 5,
    createdAt: new Date().toISOString(),
  };
  const communities = getCommunities();
  communities.push(community);
  write(KEYS.communities, communities);

  const user: UserRecord = {
    id: uid('user'),
    phone,
    name: data.name,
    role: 'landlord',
    communityId: community.id,
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  saveRooms(community.id, []);
  return user;
}

export function joinCommunityAsTenant(data: { name: string; phone: string; communityCode: string; roomNumber?: string }): UserRecord {
  const phone = normalizePhone(data.phone);
  if (findUserByPhone(phone)) {
    throw new DbError('This phone number already has an account. Please log in instead.');
  }
  const community = findCommunityByCode(data.communityCode);
  if (!community) {
    throw new DbError('We could not find a community with that invite code.');
  }
  const user: UserRecord = {
    id: uid('user'),
    phone,
    name: data.name,
    role: 'renter',
    communityId: community.id,
    roomNumber: data.roomNumber?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  upsertTenantRoom(community.id, { name: data.name, phone, roomNumber: data.roomNumber });
  return user;
}

// ---------- Session ----------

export function login(phone: string): UserRecord | undefined {
  const user = findUserByPhone(phone);
  if (user) write(KEYS.session, user.phone);
  return user;
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

export function getCurrentUser(): UserRecord | undefined {
  const phone = localStorage.getItem(KEYS.session);
  if (!phone) return undefined;
  return findUserByPhone(phone);
}

// ---------- Usage & payment history (tenant-facing) ----------

export function addUsageRecord(rec: Omit<UsageRecord, 'id' | 'submittedAt'>): UsageRecord {
  const full: UsageRecord = { ...rec, id: uid('usage'), submittedAt: new Date().toISOString() };
  const all = read<UsageRecord[]>(KEYS.usage, []);
  all.unshift(full);
  write(KEYS.usage, all);
  return full;
}

export function addPaymentRecord(rec: Omit<PaymentRecord, 'id' | 'paidAt'>): PaymentRecord {
  const full: PaymentRecord = { ...rec, id: uid('payment'), paidAt: new Date().toISOString() };
  const all = read<PaymentRecord[]>(KEYS.payments, []);
  all.unshift(full);
  write(KEYS.payments, all);
  return full;
}

export function getHistoryForPhone(phone: string): { usage: UsageRecord[]; payments: PaymentRecord[] } {
  const p = normalizePhone(phone);
  return {
    usage: read<UsageRecord[]>(KEYS.usage, []).filter(u => u.phone === p),
    payments: read<PaymentRecord[]>(KEYS.payments, []).filter(pay => pay.phone === p),
  };
}

export function getTenantsForCommunity(communityId: string): UserRecord[] {
  return getUsers().filter(u => u.role === 'renter' && u.communityId === communityId);
}

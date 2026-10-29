// DEMO MODE ONLY.
// This localStorage-backed client is for UI demos, not real authentication.

const USERS_KEY = "mie-demo-users";
const SESSION_KEY = "mie-demo-session";
const PRODUCTS_KEY = "mie-demo-products";
const PROFILES_KEY = "mie-demo-profiles";
const listeners = new Set();
let storageListenerAttached = false;

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function authError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function randomHex(bytes) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toUser(record) {
  return {
    id: record.id,
    email: record.email,
    user_metadata: { full_name: record.full_name, role: record.role },
  };
}

function currentSession() {
  const saved = read(SESSION_KEY, null);
  if (!saved) return null;
  const record = read(USERS_KEY, []).find((user) => user.id === saved.userId);
  return record ? { user: toUser(record) } : null;
}

function emit(event, session) {
  listeners.forEach((callback) => callback(event, session));
}

function startSession(record) {
  const session = { user: toUser(record) };
  write(SESSION_KEY, { userId: record.id });
  emit("SIGNED_IN", session);
  return session;
}

function profileRows() {
  const extras = read(PROFILES_KEY, {});
  return read(USERS_KEY, []).map((user) => ({
    id: user.id,
    display_name: user.full_name || null,
    contact_email: user.email,
    role: user.role,
    bio: null,
    location: null,
    image_url: null,
    ...(extras[user.id] || {}),
  }));
}

class Query {
  constructor(table) {
    this.table = table;
    this.op = "select";
    this.filters = [];
    this.sort = null;
    this.isSingle = false;
    this.returning = false;
  }

  select() {
    if (this.op === "insert") this.returning = true;
    return this;
  }

  insert(row) {
    this.op = "insert";
    this.row = row;
    return this;
  }

  update(values) {
    this.op = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(column, value) {
    this.filters.push([column, value]);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.sort = { column, ascending };
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  async exec() {
    if (this.table !== "profiles" && this.table !== "products") {
      return { data: null, error: { message: `Unknown table: ${this.table}` } };
    }

    const rows = this.table === "profiles" ? profileRows() : read(PRODUCTS_KEY, []);
    const matches = (row) => this.filters.every(([column, value]) => row[column] === value);
    if (this.op === "insert") {
      if (this.table !== "products") {
        return { data: null, error: { message: "Only products can be added in demo mode." } };
      }
      const now = new Date().toISOString();
      const row = {
        id: crypto.randomUUID(),
        image_url: null,
        status: "draft",
        quantity: 0,
        created_at: now,
        updated_at: now,
        ...this.row,
      };
      write(PRODUCTS_KEY, [row, ...rows]);
      return this.finish(this.returning ? [row] : null);
    }

    if (this.op === "update") {
      if (this.table === "profiles") {
        const safeValues = { ...(this.values || {}) };
        delete safeValues.id;
        delete safeValues.role;
        const extras = read(PROFILES_KEY, {});
        rows.filter(matches).forEach((row) => {
          extras[row.id] = { ...(extras[row.id] || {}), ...safeValues };
        });
        write(PROFILES_KEY, extras);
        return this.finish(this.returning ? profileRows().filter(matches) : null);
      }

      const updated = rows.map((row) => (
        matches(row)
          ? { ...row, ...this.values, updated_at: new Date().toISOString() }
          : row
      ));
      write(PRODUCTS_KEY, updated);
      return this.finish(this.returning ? updated.filter(matches) : null);
    }

    if (this.op === "delete") {
      if (this.table !== "products") {
        return { data: null, error: { message: "Only products can be deleted in demo mode." } };
      }
      write(PRODUCTS_KEY, rows.filter((row) => !matches(row)));
      return this.finish(null);
    }

    let result = rows.filter(matches);
    if (this.sort) {
      const { column, ascending } = this.sort;
      result = [...result].sort((left, right) =>
        left[column] === right[column] ? 0 : (left[column] > right[column] ? 1 : -1) * (ascending ? 1 : -1)
      );
    }
    return this.finish(result);
  }

  finish(result) {
    if (!this.isSingle) return { data: result, error: null };
    if (!result || result.length !== 1) {
      return { data: null, error: { message: "Expected exactly one row.", code: "PGRST116" } };
    }
    return { data: result[0], error: null };
  }
}

export function createDemoClient() {
  if (!storageListenerAttached) {
    storageListenerAttached = true;
    window.addEventListener("storage", (event) => {
      if (event.key === SESSION_KEY) emit("TOKEN_REFRESHED", currentSession());
    });
  }

  return {
    auth: {
      async signUp({ email, password, options }) {
        const normalized = String(email).trim().toLowerCase();
        const users = read(USERS_KEY, []);
        if (users.some((user) => user.email === normalized)) {
          return { data: { user: null, session: null }, error: authError("User already registered", 422) };
        }
        const meta = options?.data || {};
        const salt = randomHex(16);
        const record = {
          id: crypto.randomUUID(),
          email: normalized,
          full_name: String(meta.full_name || "").trim(),
          role: meta.role === "creator" ? "creator" : "customer",
          salt,
          passwordHash: await hashPassword(password, salt),
          created_at: new Date().toISOString(),
        };
        write(USERS_KEY, [...users, record]);
        const session = startSession(record);
        return { data: { user: session.user, session }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const normalized = String(email).trim().toLowerCase();
        const record = read(USERS_KEY, []).find((user) => user.email === normalized);
        const valid = record && (await hashPassword(password, record.salt)) === record.passwordHash;
        if (!valid) {
          return { data: { user: null, session: null }, error: authError("Invalid login credentials") };
        }
        const session = startSession(record);
        return { data: { user: session.user, session }, error: null };
      },
      async signOut() {
        window.localStorage.removeItem(SESSION_KEY);
        emit("SIGNED_OUT", null);
        return { error: null };
      },
      async getUser() {
        const session = currentSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      async getSession() {
        return { data: { session: currentSession() }, error: null };
      },
      onAuthStateChange(callback) {
        listeners.add(callback);
        return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
      },
      async resetPasswordForEmail() {
        return { error: authError("Email delivery is unavailable in demo mode.", 501) };
      },
    },
    from(table) {
      return new Query(table);
    },
  };
}

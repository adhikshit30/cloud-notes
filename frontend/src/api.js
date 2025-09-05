// frontend/src/api.js
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, opts = {}) {
  const r = await fetch(`${API}${path}`, opts);
  // try to parse JSON safely
  let data = null;
  try { data = await r.json(); } catch { /* ignore */ }
  if (!r.ok) {
    const msg = (data && (data.error || data.message)) || r.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  async register(data) {
    return request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async login(data) {
    return request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async listNotes(token) {
    return request("/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  async createNote(token, note) {
    return request("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(note),
    });
  },
  async updateNote(token, id, note) {
    return request(`/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(note),
    });
  },
  async shareLink(token, noteId, canEdit = false) {
    return request(`/api/shares/link/${noteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ canEdit }),
    });
  },
};

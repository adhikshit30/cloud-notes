import { useEffect, useState } from "react";
import { api } from "./api";
import { jsPDF } from "jspdf";

function TextInput({ label, type = "text", value, onChange, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-200 mb-1">
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...props}
      />
    </label>
  );
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition";
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow",
    subtle:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-100",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function App() {
  // app state
  const [view, setView] = useState("login");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  // auth forms
  const [reg, setReg] = useState({ name: "", email: "", password: "" });
  const [cred, setCred] = useState({ email: "", password: "" });

  // note create form
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  async function doRegister() {
    const res = await api.register(reg);
    if (res?.email) {
      alert("Registered! Please log in.");
      setView("login");
    } else alert(res.error || "Registration failed");
  }

  async function doLogin() {
    const res = await api.login(cred);
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      setView("app");
    } else alert(res.error || "Login failed");
  }

  useEffect(() => {
    if (!token) return;
    (async () => setNotes(await api.listNotes(token)))();
  }, [token]);

  async function createNote() {
    try {
      setCreating(true);
      const n = await api.createNote(token, newNote);
      setNotes([n, ...notes]);
      setNewNote({ title: "", content: "" });
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    } finally {
      setCreating(false);
    }
  }

  async function saveNote(n) {
    try {
      setSaving(true);
      const updated = await api.updateNote(token, n._id, {
        title: n.title,
        content: n.content,
      });
      setNotes(notes.map((x) => (x._id === n._id ? updated : x)));
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  function exportPdf(n) {
    const doc = new jsPDF();
    doc.text(n.title || "Untitled", 10, 10);
    doc.text((n.content || "").toString(), 10, 20);
    doc.save(`${n.title || "note"}.pdf`);
  }

  async function makeShareLink(n) {
    const r = await api.shareLink(token, n._id, false);
    if (r?.linkToken) {
      navigator.clipboard.writeText(r.linkToken);
      alert(`Share token copied: ${r.linkToken}`);
    } else alert(r.error || "Failed to create link");
  }

  // Auth screens
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
          <h1 className="text-2xl font-bold tracking-tight text-white text-center">
            Cloud Notes — Login
          </h1>
          <div className="mt-6 space-y-3">
            <TextInput
              label="Email"
              type="email"
              value={cred.email}
              onChange={(e) => setCred({ ...cred, email: e.target.value })}
              placeholder="you@example.com"
            />
            <TextInput
              label="Password"
              type="password"
              value={cred.password}
              onChange={(e) => setCred({ ...cred, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={doLogin} className="flex-1">
              Login
            </Button>
            <Button
              variant="subtle"
              className="flex-1"
              onClick={() => setView("register")}
            >
              Create account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
          <h1 className="text-2xl font-bold tracking-tight text-white text-center">
            Create Account
          </h1>
          <div className="mt-6 space-y-3">
            <TextInput
              label="Name"
              value={reg.name}
              onChange={(e) => setReg({ ...reg, name: e.target.value })}
              placeholder="Adhikshit"
            />
            <TextInput
              label="Email"
              type="email"
              value={reg.email}
              onChange={(e) => setReg({ ...reg, email: e.target.value })}
              placeholder="you@example.com"
            />
            <TextInput
              label="Password"
              type="password"
              value={reg.password}
              onChange={(e) => setReg({ ...reg, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={doRegister} className="flex-1">
              Register
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setView("login")}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // App screen (notes)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-600" />
            <h1 className="text-lg font-semibold">Cloud Notes</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              {user?.name || user?.email}
            </span>
            <Button
              variant="ghost"
              onClick={() => {
                setToken("");
                setUser(null);
                setView("login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Create note card */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold mb-4">Create a new note</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
              />
              <div className="md:col-span-2">
                <textarea
                  rows={4}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Write your content..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={createNote} disabled={creating}>
                {creating ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </section>

        {/* Notes grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Your notes</h2>
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
              No notes yet. Create your first note above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((n) => (
                <div
                  key={n._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col"
                >
                  <input
                    className="rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={n.title}
                    onChange={(e) =>
                      setNotes(
                        notes.map((x) =>
                          x._id === n._id ? { ...x, title: e.target.value } : x
                        )
                      )
                    }
                  />
                  <textarea
                    rows={6}
                    className="flex-1 rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={n.content}
                    onChange={(e) =>
                      setNotes(
                        notes.map((x) =>
                          x._id === n._id
                            ? { ...x, content: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <Button onClick={() => saveNote(n)} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="subtle" onClick={() => exportPdf(n)}>
                      Export PDF
                    </Button>
                    <Button variant="ghost" onClick={() => makeShareLink(n)}>
                      Share Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// src/shared.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function SharedNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/shares/public/${token}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Failed to load");
        setNote(data.note);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [token]);

  function exportPdf() {
    if (!note) return;
    const doc = new jsPDF();
    doc.text(note.title || "Untitled", 10, 10);
    doc.text((note.content || "").toString(), 10, 20);
    doc.save(`${note.title || "note"}.pdf`);
  }

  if (err) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h1 className="text-xl font-semibold mb-2">Link error</h1>
          <p className="text-slate-300">{err}</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="text-slate-300">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-bold mb-3">{note.title}</h1>
          <pre className="whitespace-pre-wrap text-slate-200">{note.content}</pre>
          <div className="mt-6">
            <button
              onClick={exportPdf}
              className="inline-flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-semibold"
            >
              Download PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

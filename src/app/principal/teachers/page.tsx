"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Pencil, Plus, ShieldOff, Trash2, UserPlus, X } from "lucide-react";
import { manageTeachersList, sections, subjects, type TeacherAssignment } from "@/lib/avai-mock-data";
import { initials } from "@/lib/auth";
import { usePageHeader } from "@/lib/pageHeader";

type Teacher = (typeof manageTeachersList)[number] & { revoked?: boolean };

/** One subject block in the Add/Edit form — a teacher can carry any number
 * of these (Mr. Ravi teaches both Physics and Chemistry, for instance). */
interface SubjectRow {
  subject: string;
  subjectSections: string[];
}

function emptySubjectRow(): SubjectRow {
  return { subject: subjects[0], subjectSections: [] };
}

const emptyDraft = { name: "", classSection: "", subjectRows: [] as SubjectRow[] };

/** §5.11 Manage Teachers. Local state only — nothing persists across reloads. */
export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => manageTeachersList.map((t) => ({ ...t })));
  const [editing, setEditing] = useState<Teacher | "new" | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function openEdit(t: Teacher | "new") {
    setEditing(t);
    setMenuFor(null);
    if (t === "new") setDraft(emptyDraft);
    else {
      const cls = t.assignments.find((a) => a.type === "class");
      const subs = t.assignments.filter((a) => a.type === "subject") as Extract<TeacherAssignment, { type: "subject" }>[];
      setDraft({
        name: t.name,
        classSection: cls && cls.type === "class" ? cls.section : "",
        subjectRows: subs.map((s) => ({ subject: s.subject, subjectSections: s.sections })),
      });
    }
  }

  function addSubjectRow() {
    setDraft((d) => ({ ...d, subjectRows: [...d.subjectRows, emptySubjectRow()] }));
  }

  function removeSubjectRow(index: number) {
    setDraft((d) => ({ ...d, subjectRows: d.subjectRows.filter((_, i) => i !== index) }));
  }

  function updateSubjectRow(index: number, patch: Partial<SubjectRow>) {
    setDraft((d) => ({ ...d, subjectRows: d.subjectRows.map((r, i) => (i === index ? { ...r, ...patch } : r)) }));
  }

  function save() {
    const assignments: TeacherAssignment[] = [];
    if (draft.classSection) assignments.push({ type: "class", section: draft.classSection });
    for (const row of draft.subjectRows) {
      if (row.subject && row.subjectSections.length) assignments.push({ type: "subject", subject: row.subject, sections: row.subjectSections });
    }
    if (editing === "new") {
      setTeachers((ts) => [...ts, { id: `staff_teacher_${Date.now()}`, name: draft.name.trim(), role: "teacher", assignments }]);
      setToast(`Added ${draft.name.trim()}. Access key would be issued here.`);
    } else if (editing) {
      setTeachers((ts) => ts.map((t) => (t.id === editing.id ? { ...t, name: draft.name.trim(), assignments } : t)));
      setToast(`Updated ${draft.name.trim()}.`);
    }
    setEditing(null);
  }

  function revoke(t: Teacher) {
    setTeachers((ts) => ts.map((x) => (x.id === t.id ? { ...x, revoked: !x.revoked } : x)));
    setMenuFor(null);
    setToast(t.revoked ? `Restored access for ${t.name}.` : `Revoked access for ${t.name}.`);
  }

  const hasCompleteSubjectRow = draft.subjectRows.some((r) => r.subject && r.subjectSections.length > 0);
  const canSave = draft.name.trim().length > 1 && (draft.classSection || hasCompleteSubjectRow);

  usePageHeader({ title: "Manage Teachers" });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <p className="page-sub" style={{ marginTop: 0 }}>
          Who can see which classes and subjects. Class teachers see all subjects for their section; subject teachers see their subject across assigned
          sections.
        </p>
        <button className="btn btn--primary" onClick={() => openEdit("new")}>
          <Plus size={15} /> Add teacher
        </button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Class teacher of</th>
                <th>Subject teacher</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => {
                const cls = t.assignments.filter((a) => a.type === "class") as Extract<TeacherAssignment, { type: "class" }>[];
                const subs = t.assignments.filter((a) => a.type === "subject") as Extract<TeacherAssignment, { type: "subject" }>[];
                return (
                  <tr key={t.id} style={{ opacity: t.revoked ? 0.55 : 1 }}>
                    <td>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span className="avatar" style={{ background: "var(--brand-teal-soft)", color: "var(--brand-teal)" }}>
                          {initials(t.name)}
                        </span>
                        <div>
                          <div className="strong">{t.name}</div>
                          <div className="small muted">{t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{cls.length ? cls.map((c) => <span className="tag tag--teal" key={c.section}>{c.section}</span>) : <span className="muted">—</span>}</td>
                    <td>
                      {subs.length ? (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {subs.map((s) => (
                            <span className="tag" key={s.subject}>
                              {s.subject} · {s.sections.join(", ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>{t.revoked ? <span className="tag tag--risk">Revoked</span> : <span className="tag tag--green">Active</span>}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn--sm" onClick={() => openEdit(t)}>
                        <Pencil size={13} /> Edit
                      </button>{" "}
                      <span className="menu-wrap">
                        <button className="iconbtn" aria-label="More actions" onClick={() => setMenuFor(menuFor === t.id ? null : t.id)}>
                          <MoreVertical size={16} />
                        </button>
                        {menuFor === t.id && (
                          <div className="menu" role="menu">
                            <button className={t.revoked ? "" : "danger"} onClick={() => revoke(t)}>
                              <ShieldOff size={14} /> {t.revoked ? "Restore access" : "Revoke access"}
                            </button>
                          </div>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card__foot small muted">Changes are held in local state for this demo and reset on reload.</div>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)}>
            <motion.div
              className="modal"
              role="dialog"
              aria-modal="true"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__head">
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserPlus size={16} /> {editing === "new" ? "Add teacher" : `Edit ${editing.name}`}
                </h3>
                <button className="iconbtn" onClick={() => setEditing(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="modal__body">
                <div className="field">
                  <label htmlFor="t-name">Full name</label>
                  <input id="t-name" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Mrs. Priya" />
                </div>
                <div className="field">
                  <label htmlFor="t-class">Class teacher of (optional)</label>
                  <select id="t-class" className="select" style={{ minWidth: 0 }} value={draft.classSection} onChange={(e) => setDraft({ ...draft, classSection: e.target.value })}>
                    <option value="">Not a class teacher</option>
                    {sections.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Subjects taught (optional — add as many as this teacher takes)</label>
                  <div style={{ display: "grid", gap: 12 }}>
                    {draft.subjectRows.map((row, i) => (
                      <div key={i} className="card card--flat" style={{ background: "var(--surface-2)" }}>
                        <div className="card__body" style={{ display: "grid", gap: 10, padding: 14 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                            <div className="field" style={{ flex: 1, margin: 0 }}>
                              <label htmlFor={`t-subject-${i}`}>Subject</label>
                              <select id={`t-subject-${i}`} className="select" style={{ minWidth: 0 }} value={row.subject} onChange={(e) => updateSubjectRow(i, { subject: e.target.value })}>
                                {subjects.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <button type="button" className="iconbtn" aria-label="Remove this subject" onClick={() => removeSubjectRow(i)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div>
                            <label className="small muted" style={{ display: "block", marginBottom: 6 }}>
                              Sections for {row.subject}
                            </label>
                            <div className="checkrow">
                              {sections.map((s) => {
                                const on = row.subjectSections.includes(s);
                                return (
                                  <label key={s} className={`check ${on ? "check--on" : ""}`}>
                                    <input
                                      type="checkbox"
                                      checked={on}
                                      onChange={() =>
                                        updateSubjectRow(i, {
                                          subjectSections: on ? row.subjectSections.filter((x) => x !== s) : [...row.subjectSections, s],
                                        })
                                      }
                                    />
                                    {s}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn btn--sm" style={{ marginTop: draft.subjectRows.length ? 10 : 0 }} onClick={addSubjectRow}>
                    <Plus size={13} /> Add subject
                  </button>
                </div>
              </div>
              <div className="modal__foot">
                <button className="btn" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button className="btn btn--primary" disabled={!canSave} onClick={save}>
                  {editing === "new" ? "Add teacher" : "Save changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

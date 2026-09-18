"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Save, X } from "lucide-react";
import { academicYears, pageHeaders, school, schoolSettings, sections as defaultSections, subjects as defaultSubjects } from "@/lib/avai-mock-data";

/** §5.12 School Settings. Everything below the school-profile card is local
 * state only — "Save" confirms with a toast and nothing persists. */
export default function SettingsPage() {
  const [academicYear, setAcademicYear] = useState(schoolSettings.academicYear);
  const [blueprintMapping, setBlueprintMapping] = useState(schoolSettings.boardBlueprintMappingEnabled);
  const [sections, setSections] = useState<string[]>([...defaultSections]);
  const [subjectList, setSubjectList] = useState<string[]>([...defaultSubjects]);
  const [newSection, setNewSection] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function addSection() {
    const v = newSection.trim();
    if (!v || sections.includes(v)) return;
    setSections((s) => [...s, v]);
    setNewSection("");
  }

  function addSubject() {
    const v = newSubject.trim();
    if (!v || subjectList.includes(v)) return;
    setSubjectList((s) => [...s, v]);
    setNewSubject("");
  }

  function save() {
    setToast("Settings saved for this session (local only). They reset on reload.");
  }

  return (
    <>
      <h1 className="page-title">{pageHeaders.settings.title}</h1>
      <p className="page-sub">{pageHeaders.settings.blurb}</p>

      <div className="section">
        <div className="section__head">
          <div>
            <h3>School profile</h3>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <dl className="kv">
              <dt>School</dt>
              <dd>{school.name}</dd>
              <dt>Board</dt>
              <dd>{school.board}</dd>
              <dt>State</dt>
              <dd>{school.state}</dd>
              <dt>School ID</dt>
              <dd className="mono">{school.id}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__head">
          <div>
            <h3>Academic year &amp; blueprint mapping</h3>
          </div>
        </div>
        <div className="card">
          <div className="card__body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field" style={{ maxWidth: 260 }}>
              <label htmlFor="s-year">Academic year</label>
              <select id="s-year" className="select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                {academicYears.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <label className="check" style={{ width: "fit-content" }}>
              <input type="checkbox" checked={blueprintMapping} onChange={(e) => setBlueprintMapping(e.target.checked)} />
              Board blueprint mapping enabled
            </label>
            <p className="small muted" style={{ margin: 0 }}>
              When enabled, uploaded papers are automatically mapped against the {school.board} blueprint on the Question Papers screen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid--2" style={{ marginTop: 36 }}>
        <div className="section" style={{ marginTop: 0 }}>
          <div className="section__head">
            <h3>Sections</h3>
          </div>
          <div className="card">
            <div className="card__body">
              <div className="checkrow">
                {sections.map((s) => (
                  <span className="tag tag--teal" key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {s}
                    <button
                      className="iconbtn"
                      style={{ padding: 0 }}
                      aria-label={`Remove ${s}`}
                      onClick={() => setSections((arr) => arr.filter((x) => x !== s))}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <input
                  className="input"
                  placeholder="e.g. X-F"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSection()}
                />
                <button className="btn btn--sm" onClick={addSection}>
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="section" style={{ marginTop: 0 }}>
          <div className="section__head">
            <h3>Subjects</h3>
          </div>
          <div className="card">
            <div className="card__body">
              <div className="checkrow">
                {subjectList.map((s) => (
                  <span className="tag tag--teal" key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {s}
                    <button
                      className="iconbtn"
                      style={{ padding: 0 }}
                      aria-label={`Remove ${s}`}
                      onClick={() => setSubjectList((arr) => arr.filter((x) => x !== s))}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <input
                  className="input"
                  placeholder="e.g. Computer Science"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                />
                <button className="btn btn--sm" onClick={addSubject}>
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn--primary" onClick={save}>
          <Save size={15} /> Save settings
        </button>
      </div>

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

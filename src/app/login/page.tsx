"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, School, ShieldAlert, User } from "lucide-react";
import { motion } from "framer-motion";
import { Logomark, Mascot } from "@/components/Mascot";
import { homeFor, useAuth } from "@/lib/auth";
import { devLoginOptions, school } from "@/lib/avai-mock-data";

type Tab = "staff" | "student";

/**
 * §4 Login. Two tabs (School Staff / Student). The form is the real design;
 * the DEV LOGIN block beneath it is the only thing that actually signs in.
 */
export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("staff");
  const [notice, setNotice] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("Real sign-in is not wired in this build. Use a DEV LOGIN shortcut below.");
  }

  const options = devLoginOptions.filter((o) => (tab === "student" ? o.role === "student" : o.role !== "student"));

  return (
    <div className="login">
      <section className="login__brand">
        <div className="login__logo">
          <Logomark size={36} />
          <span className="login__wordmark">AVAI</span>
        </div>
        <motion.div className="login__hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Mascot pose="hello" size={150} />
          <h1>Hello. Let&apos;s turn one test into Board-ready intelligence.</h1>
          <p>AVAI reads your assessments against the Board blueprint and tells you where marks are being lost, how urgent it is, and how sure we are.</p>
        </motion.div>
        <div className="login__foot">
          {school.name} · {school.board}
        </div>
      </section>

      <section className="login__panel">
        <div className="login__card">
          <h2>Sign in</h2>
          <p className="muted small">Choose how you are signing in to {school.name}.</p>

          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "staff"} className={`tab ${tab === "staff" ? "tab--active" : ""}`} onClick={() => setTab("staff")}>
              School Staff
            </button>
            <button role="tab" aria-selected={tab === "student"} className={`tab ${tab === "student" ? "tab--active" : ""}`} onClick={() => setTab("student")}>
              Student
            </button>
          </div>

          <form className="login__form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="schoolCode">School code</label>
              <div style={{ position: "relative" }}>
                <School size={15} style={{ position: "absolute", left: 11, top: 12, color: "var(--muted)" }} />
                <input id="schoolCode" className="input" style={{ paddingLeft: 34 }} placeholder="e.g. BIS-TN-001" autoComplete="off" />
              </div>
            </div>
            {tab === "staff" ? (
              <div className="field">
                <label htmlFor="staffKey">Staff access key</label>
                <div style={{ position: "relative" }}>
                  <KeyRound size={15} style={{ position: "absolute", left: 11, top: 12, color: "var(--muted)" }} />
                  <input id="staffKey" className="input" style={{ paddingLeft: 34 }} type="password" placeholder="Access key issued by AVAI" />
                </div>
              </div>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="rollNo">Roll number</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 11, top: 12, color: "var(--muted)" }} />
                    <input id="rollNo" className="input" style={{ paddingLeft: 34 }} placeholder="e.g. 01" inputMode="numeric" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="pin">PIN</label>
                  <div style={{ position: "relative" }}>
                    <KeyRound size={15} style={{ position: "absolute", left: 11, top: 12, color: "var(--muted)" }} />
                    <input id="pin" className="input" style={{ paddingLeft: 34 }} type="password" placeholder="4-digit PIN from your teacher" inputMode="numeric" />
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="btn btn--primary" style={{ justifyContent: "center", padding: "11px" }}>
              Continue <ArrowRight size={15} />
            </button>
            {notice && (
              <div className="evidence evidence--gold" role="status">
                <ShieldAlert size={16} />
                <div>{notice}</div>
              </div>
            )}
          </form>
          <div className="login__help">{tab === "staff" ? "Lost your access key? Contact your AVAI school administrator." : "Ask your class teacher for your PIN."}</div>

          <div className="devlogin" aria-label="Development login shortcuts">
            <div className="devlogin__head">
              <span className="tag tag--dev">DEV LOGIN</span>
              <span>Mock role switcher — not real authentication.</span>
            </div>
            <div className="devlogin__grid">
              {options.map((o) => (
                <button
                  key={o.key}
                  className="devlogin__btn"
                  onClick={() => {
                    const u = signIn(o.role, o.userId);
                    if (u) router.push(homeFor(u.role));
                  }}
                >
                  <span>
                    {o.label}
                    <br />
                    <small>{o.sub}</small>
                  </span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

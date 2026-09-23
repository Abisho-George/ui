"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { DEMO_STAFF_PASSWORD, demoStaffLogins, signInStaff } from "@/lib/adminState";
import { adminSchools, portfolioKpis } from "@/lib/avai-admin-data";

/** AVAI staff sign-in. Mock: any listed staff email plus any password. */
export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEMO_STAFF_PASSWORD);
  const [error, setError] = useState<{ field: "email" | "password"; message: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = signInStaff(email, password);
    if (!result.ok) {
      setError({ field: result.field, message: result.message });
      return;
    }
    router.push("/admin/schools");
  }

  return (
    <div className="auth">
      <aside className="auth__aside">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: ".12em" }}>AVAI</span>
          <span
            className="tag"
            style={{ background: "rgba(240,147,43,.16)", borderColor: "rgba(240,147,43,.45)", color: "var(--brand-orange)" }}
          >
            Ops console
          </span>
        </div>

        <Reveal delay={0.05}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
            <Mascot pose="hello" size={104} float />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 500, lineHeight: 1.15, maxWidth: 460 }}>
              The console behind every AVAI school.
            </h1>
            <p style={{ color: "#b9c8e2", fontSize: 15, maxWidth: 430, lineHeight: 1.55 }}>
              Onboarding, teacher keys, usage and renewals for all {adminSchools.length} accounts. This is the tool the
              AVAI team runs the business on — schools never see it.
            </p>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {[
                { label: "Live schools", value: portfolioKpis.schoolsLive },
                { label: "Students analysed", value: portfolioKpis.studentsUnderAnalysis },
                { label: "In onboarding", value: portfolioKpis.onboardingCount },
              ].map((s) => (
                <div key={s.label}>
                  <div className="mono" style={{ fontSize: 24, fontWeight: 700 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#8fa2c2" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div style={{ color: "#8fa2c2", fontSize: 12.5 }}>
          Internal use only · Access is logged · AVAI Learning Systems Pvt. Ltd.
        </div>
      </aside>

      <div className="auth__panel">
        <div>
          <Reveal>
            <div className="surface" style={{ padding: "26px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <ShieldCheck size={18} style={{ color: "var(--brand-blue)" }} />
                <h2 style={{ fontSize: 21 }}>Staff sign-in</h2>
              </div>
              <p className="small muted" style={{ marginBottom: 20 }}>
                Use your AVAI address. Principals and teachers sign in at the school app, not here.
              </p>

              <form className="login__form" onSubmit={submit} noValidate>
                <div className="field">
                  <label htmlFor="staff-email">Work email</label>
                  <input
                    id="staff-email"
                    className="input"
                    type="email"
                    autoComplete="username"
                    placeholder="name@avai.school"
                    value={email}
                    aria-invalid={error?.field === "email"}
                    aria-describedby={error ? "staff-error" : undefined}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                  />
                </div>

                <div className="field">
                  <label htmlFor="staff-password">Password</label>
                  <input
                    id="staff-password"
                    className="input"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    aria-invalid={error?.field === "password"}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                  />
                  <span className="small muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Lock size={11} /> Demo build — any password works.
                  </span>
                </div>

                {error && (
                  <div id="staff-error" className="evidence" style={{ background: "var(--risk-soft)", borderColor: "#eec3bb", color: "#8f3226" }}>
                    <AlertCircle size={15} />
                    <span>{error.message}</span>
                  </div>
                )}

                <button type="submit" className="btn btn--blue" style={{ justifyContent: "center", padding: "10px 14px" }}>
                  Enter console <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="devlogin" style={{ borderColor: "var(--brand-blue)", background: "rgba(29,95,208,.05)" }}>
              <div className="devlogin__head">
                <strong>Demo accounts</strong> · any password
              </div>
              <Stagger className="devlogin__grid" gap={0.05}>
                {demoStaffLogins.map((s) => (
                  <StaggerItem key={s.email}>
                    <button
                      type="button"
                      className="devlogin__btn"
                      style={{ width: "100%" }}
                      onClick={() => {
                        setEmail(s.email);
                        setError(null);
                      }}
                    >
                      <span>
                        <strong style={{ fontWeight: 650 }}>{s.email}</strong>
                        <small style={{ display: "block" }}>
                          {s.name} · {s.role}
                        </small>
                      </span>
                      <ArrowRight size={13} />
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Reveal>

          <p className="login__help">
            Looking for the school app? <Link href="/login" className="btn--link">Principal and teacher sign-in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

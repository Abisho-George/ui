import { Construction } from "lucide-react";

export function PlaceholderPage({ title, blurb, status, children }: { title: string; blurb: string; status: string; children?: React.ReactNode }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{blurb}</p>
      <div className="placeholder" style={{ marginTop: 24 }}>
        <Construction size={28} style={{ color: "var(--brand-gold)" }} />
        <h3 style={{ marginTop: 10, color: "var(--brand-ink)" }}>{status}</h3>
        <p style={{ marginTop: 6 }}>This screen is outlined but not the focus of this pass.</p>
      </div>
      {children}
    </>
  );
}

import { PlaceholderPage } from "@/components/Placeholder";
import { operationsSummary, placeholderPages, school } from "@/lib/avai-mock-data";

/**
 * §5.12 School Settings. Per §5.1 this is also where the old flat /admin
 * counts dashboard now lives: it is an operations summary, not a landing page.
 */
export default function SettingsPage() {
  return (
    <PlaceholderPage {...placeholderPages.settings}>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card__head">
          <h3 style={{ fontSize: 16 }}>School profile</h3>
        </div>
        <div className="card__body">
          <dl className="kv">
            <dt>School</dt>
            <dd>{school.name}</dd>
            <dt>Board</dt>
            <dd>{school.board}</dd>
            <dt>State</dt>
            <dd>{school.state}</dd>
            <dt>School ID</dt>
            <dd>{school.id}</dd>
          </dl>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card__head">
          <div>
            <h3 style={{ fontSize: 16 }}>Operations</h3>
            <p className="small muted" style={{ marginTop: 4 }}>
              Storage and issuance counts. Kept here rather than on the landing page — a principal&apos;s first
              screen answers Board-readiness questions, not storage questions.
            </p>
          </div>
        </div>
        <div className="card__body">
          <div className="grid grid--3">
            {operationsSummary.map((o) => (
              <div className="stat" key={o.label}>
                <div className="stat__label">{o.label}</div>
                <div className="stat__value stat__value--sm">{o.value.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PlaceholderPage>
  );
}

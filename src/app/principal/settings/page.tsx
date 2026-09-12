import { PlaceholderPage } from "@/components/Placeholder";
import { placeholderPages, school } from "@/lib/avai-mock-data";

export default function SettingsPage() {
  return (
    <PlaceholderPage {...placeholderPages.settings}>
      <div className="card" style={{ marginTop: 20 }}>
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
    </PlaceholderPage>
  );
}

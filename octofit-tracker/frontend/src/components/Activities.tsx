import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export default function Activities() {
  const [items, setItems] = useState<Array<{ type?: string; minutes?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const payload = await getJson<{ activities?: Array<{ type?: string; minutes?: number }> }>('/api/activities');
        if (!active) return;
        setItems(payload.activities ?? []);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setItems([]);
        setError(caught instanceof Error ? `Unable to load activities: ${caught.message}` : 'Unable to load activities.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p><p role="status">Loading...</p></div></section>;
  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p><p role="alert">{error}</p></div></section>;
  if (items.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p><p>No activities</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        <ul className="list-group list-group-flush">
          {items.map((item, index) => (
            <li key={`activity-${index}`} className="list-group-item">
              <strong>{item.type ?? 'Activity'}</strong> <span>{item.minutes ?? 0} minutes</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

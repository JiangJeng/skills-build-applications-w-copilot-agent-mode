import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export default function Teams() {
  const [items, setItems] = useState<Array<{ name?: string; members?: unknown[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const payload = await getJson<{ teams?: Array<{ name?: string; members?: unknown[] }> }>('/api/teams');
        if (!active) return;
        setItems(payload.teams ?? []);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setItems([]);
        setError(caught instanceof Error ? `Unable to load teams: ${caught.message}` : 'Unable to load teams.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p><p role="status">Loading...</p></div></section>;
  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p><p role="alert">{error}</p></div></section>;
  if (items.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p><p>No teams</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        <ul className="list-group list-group-flush">
          {items.map((item, index) => (
            <li key={`team-${index}`} className="list-group-item">
              <strong>{item.name ?? 'Team'}</strong> <span>({(item.members ?? []).length} members)</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

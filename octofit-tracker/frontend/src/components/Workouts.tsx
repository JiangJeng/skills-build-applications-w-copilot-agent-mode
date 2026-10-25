import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export default function Workouts() {
  const [items, setItems] = useState<Array<{ title?: string; focus?: string; reason?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const payload = await getJson<{ suggestions?: Array<{ title?: string; focus?: string; reason?: string }> }>('/api/workouts/suggestions/mona@example.com');
        if (!active) return;
        setItems(payload.suggestions ?? []);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setItems([]);
        setError(caught instanceof Error ? `Unable to load workout suggestions: ${caught.message}` : 'Unable to load workout suggestions.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p><p role="status">Loading...</p></div></section>;
  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p><p role="alert">{error}</p></div></section>;
  if (items.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p><p>No workout suggestions</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        <ul className="list-group list-group-flush">
          {items.map((item, index) => (
            <li key={`workout-${index}`} className="list-group-item">
              <strong>{item.title ?? 'Workout'}</strong> <span>{item.focus ?? 'general'}</span> <em>{item.reason ?? ''}</em>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

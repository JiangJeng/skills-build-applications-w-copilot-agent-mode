import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

export default function Leaderboard() {
  const [items, setItems] = useState<Array<{ teamName?: string; totalPoints?: number; rank?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const payload = await getJson<{ leaderboard?: Array<{ teamName?: string; totalPoints?: number; rank?: number }> }>('/api/leaderboard');
        if (!active) return;
        setItems(payload.leaderboard ?? []);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setItems([]);
        setError(caught instanceof Error ? `Unable to load leaderboard: ${caught.message}` : 'Unable to load leaderboard.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p><p role="status">Loading...</p></div></section>;
  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p><p role="alert">{error}</p></div></section>;
  if (items.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p><p>No leaderboard rankings</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        <ul className="list-group list-group-flush">
          {items.map((item, index) => (
            <li key={`leaderboard-${index}`} className="list-group-item">
              <strong>{item.teamName ?? 'Team'}</strong> <span>{item.totalPoints ?? 0} pts</span> <span>#{item.rank ?? index + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

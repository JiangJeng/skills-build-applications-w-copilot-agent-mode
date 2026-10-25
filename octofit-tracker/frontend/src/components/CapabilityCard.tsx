import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type CapabilityCardProps = {
  title: string;
  description: string;
  path: string;
  getItems: (payload: Record<string, unknown>) => unknown[];
  renderItem: (item: Record<string, unknown>, index: number) => ReactNode;
  emptyMessage?: string;
};

export function CapabilityCard({ title, description, path, getItems, renderItem, emptyMessage }: CapabilityCardProps) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const payload = await getJson<Record<string, unknown>>(path);
        if (!isMounted) return;
        setItems(getItems(payload));
        setError(null);
      } catch (caught) {
        if (!isMounted) return;
        setItems([]);
        setError(caught instanceof Error ? `Unable to load ${title.toLowerCase()}: ${caught.message}` : `Unable to load ${title.toLowerCase()}.`);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [path, title, getItems]);

  const message = useMemo(() => emptyMessage ?? `No ${title.toLowerCase()}`, [emptyMessage, title]);

  if (loading) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="status">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="alert">{error}</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p>{message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        <ul className="list-group list-group-flush">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="list-group-item">
              {renderItem(item as Record<string, unknown>, index)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

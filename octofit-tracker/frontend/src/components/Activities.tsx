import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      getItems={(payload) => (Array.isArray((payload as { activities?: unknown[] }).activities) ? (payload as { activities: unknown[] }).activities : [])}
      renderItem={(item) => <><strong>{String((item as { type?: string }).type ?? 'Activity')}</strong> <span>{(item as { minutes?: number }).minutes ?? 0} minutes</span></>}
      emptyMessage="No activities"
    />
  );
}

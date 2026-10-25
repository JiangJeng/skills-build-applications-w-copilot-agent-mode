import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
      getItems={(payload) => (Array.isArray((payload as { suggestions?: unknown[] }).suggestions) ? (payload as { suggestions: unknown[] }).suggestions : [])}
      renderItem={(item) => <><strong>{String((item as { title?: string }).title ?? 'Workout')}</strong> <span>{String((item as { focus?: string }).focus ?? 'general')}</span> <em>{String((item as { reason?: string }).reason ?? '')}</em></>}
      emptyMessage="No workout suggestions"
    />
  );
}

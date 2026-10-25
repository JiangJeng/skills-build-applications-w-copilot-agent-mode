import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      getItems={(payload) => (Array.isArray((payload as { teams?: unknown[] }).teams) ? (payload as { teams: unknown[] }).teams : [])}
      renderItem={(item) => <><strong>{String((item as { name?: string }).name ?? 'Team')}</strong> <span>({((item as { members?: unknown[] }).members ?? []).length} members)</span></>}
      emptyMessage="No teams"
    />
  );
}

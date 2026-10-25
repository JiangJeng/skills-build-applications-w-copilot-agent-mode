import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      getItems={(payload) => (Array.isArray((payload as { leaderboard?: unknown[] }).leaderboard) ? (payload as { leaderboard: unknown[] }).leaderboard : [])}
      renderItem={(item) => <><strong>{String((item as { teamName?: string }).teamName ?? 'Team')}</strong> <span>{(item as { totalPoints?: number }).totalPoints ?? 0} pts</span> <span>#{(item as { rank?: number }).rank ?? 1}</span></>}
      emptyMessage="No leaderboard rankings"
    />
  );
}

import { loyaltyStats } from '../data/mockData';

export function LoyaltyPanel() {
  return (
    <div className="card loyalty-card">
      <div>
        <p className="eyebrow">Loyalty pulse</p>
        <h3>Passenger rewards</h3>
        <p className="muted">Points issued and redeemed today. Wire this to the loyalty service API.</p>
      </div>
      <div className="loyalty-grid">
        <div>
          <div className="label-strong">{loyaltyStats.earnedToday.toLocaleString()}</div>
          <div className="muted">Points earned</div>
        </div>
        <div>
          <div className="label-strong">{loyaltyStats.redeemedToday.toLocaleString()}</div>
          <div className="muted">Points redeemed</div>
        </div>
        <div>
          <div className="label-strong">{loyaltyStats.members.toLocaleString()}</div>
          <div className="muted">Members</div>
        </div>
      </div>
    </div>
  );
}

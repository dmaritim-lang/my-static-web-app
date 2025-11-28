import { fareTrends } from '../data/mockData';

export function TrendBar() {
  const maxValue = Math.max(...fareTrends.map((t) => t.value));
  return (
    <div className="trend-card">
      <div className="trend-header">
        <div>
          <p className="eyebrow">Weekly fare inflows</p>
          <h3>Collections trend</h3>
          <p className="muted">Simulated volume per day (KSh x 10k). Swap with real API data later.</p>
        </div>
        <div className="pill">Live</div>
      </div>
      <div className="bars">
        {fareTrends.map((item) => (
          <div key={item.label} className="bar-wrap">
            <div className="bar" style={{ height: `${(item.value / maxValue) * 100}%` }} />
            <span className="bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

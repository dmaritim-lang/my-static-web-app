import { vehicleLeaders } from '../data/mockData';

export function Leaderboard() {
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>Top earning vehicles</h3>
        <span className="pill neutral">Today</span>
      </div>
      <div className="leaderboard">
        {vehicleLeaders.map((vehicle, idx) => (
          <div key={vehicle.plate} className="leader-row">
            <div className="rank">#{idx + 1}</div>
            <div>
              <div className="label-strong">{vehicle.plate}</div>
              <div className="muted">{vehicle.amount}</div>
            </div>
            <div className="badge positive">{vehicle.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

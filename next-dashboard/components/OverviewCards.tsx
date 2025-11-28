import { summaryCards } from '../data/mockData';

export function OverviewCards() {
  return (
    <div className="card-grid">
      {summaryCards.map((card) => (
        <div className="card" key={card.label}>
          <h3>{card.label}</h3>
          <div className="value">{card.value}</div>
          <div className="muted">{card.hint}</div>
        </div>
      ))}
    </div>
  );
}

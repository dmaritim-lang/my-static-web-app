import { summaryCards } from '../data/mockData';

export function OverviewCards() {
  return (
    <div className="card-grid">
      {summaryCards.map((card, idx) => (
        <div className="card kpi" key={card.label}>
          <div className="pill neutral">KPI {idx + 1}</div>
          <h3>{card.label}</h3>
          <div className="value">{card.value}</div>
          <div className="muted">{card.hint}</div>
        </div>
      ))}
    </div>
  );
}

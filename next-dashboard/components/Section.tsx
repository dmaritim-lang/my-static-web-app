import { ReactNode } from 'react';

export function Section({ title, cta }: { title: string; cta?: ReactNode }) {
  return (
    <div className="section-title">
      <h2 style={{ margin: 0 }}>{title}</h2>
      {cta}
    </div>
  );
}

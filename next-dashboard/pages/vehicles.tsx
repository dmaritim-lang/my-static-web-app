import Head from 'next/head';
import { Section } from '../components/Section';
import { vehicles } from '../data/mockData';

export default function VehiclesPage() {
  return (
    <>
      <Head>
        <title>Lipa Fare | Vehicles & routes</title>
      </Head>
      <h1 style={{ marginTop: 0 }}>Vehicles & routes</h1>
      <Section
        title="Registered vehicles"
        cta={<button className="button secondary" type="button">Add vehicle</button>}
      />
      <table className="table">
        <thead>
          <tr>
            <th>Plate</th>
            <th>Route</th>
            <th>Default fare (KSh)</th>
            <th>Driver</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.plate}>
              <td>{vehicle.plate}</td>
              <td>{vehicle.route}</td>
              <td>{vehicle.fare}</td>
              <td>{vehicle.driver}</td>
              <td>
                <span className="tag">{vehicle.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

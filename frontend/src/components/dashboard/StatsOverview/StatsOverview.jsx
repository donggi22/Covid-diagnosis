import React from 'react';
import DoctorsCard from './DoctorsCard';
import StaffsCard from './StaffsCard';
import PatientsCard from './PatientsCard';
import PharmacyCard from './PharmacyCard';

const StatsOverview = () => {
  return (
    <section className="stats-row">
      <DoctorsCard />
      <StaffsCard />
      <PatientsCard />
      <PharmacyCard />
    </section>
  );
};

export default StatsOverview;



import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ImpactMetrics from '../components/home/ImpactMetrics';
import UserRolesSection from '../components/home/UserRolesSection';
import HowItWorks from '../components/home/HowItWorks';
import CtaSection from '../components/home/CtaSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ImpactMetrics />
      <UserRolesSection />
      <HowItWorks />
      <CtaSection />
    </main>
  );
}


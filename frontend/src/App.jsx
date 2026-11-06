import React from 'react';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/common/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="flex-grow">
        <HomePage />
      </div>
      <Footer />
    </div>
  );
}


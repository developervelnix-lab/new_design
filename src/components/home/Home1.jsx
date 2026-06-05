import React, { useState, useEffect } from 'react';
import FrontScrollableCard from './FrontScrollableCard';
import RanaHeader from './ranamatch/RanaHeader';
import TrendingSlot from './TrendingSlot';
import GamesDisplay from './GameDisplay';
import GameProvider from './GameProvider';
import Faq from './Faq';
import MobileFooterNav from '../navbar/MobileFooterNav';
import Live from './Live';
import Turbogames from './Turbogames';
import FeaturesSection from './FeaturesSection';
import PromotionSection from './PromotionSection';
import Footer from './Footer';

function Home1() {
  const [showToast, setShowToast] = useState(false);
  const authSecretKey = localStorage.getItem('auth_secret_key');

  useEffect(() => {
    if (!authSecretKey) {
      setShowToast(true);
    }
  }, [authSecretKey]);

  return (
    <div className="flex flex-col min-h-screen relative">
      {showToast && <ToastMessage onClose={() => setShowToast(false)} />}

      <RanaHeader />

      <main className="flex-grow pt-[115px] px-4 md:px-8">
        <div className="mb-3">
          <FrontScrollableCard />
        </div>

        <div className="mb-3">
          <TrendingSlot />
        </div>

        <div className="mb-3">
          <Live />
        </div>
        <div className="mb-2 ">
          <Turbogames />
        </div>
        <div className="mb-3">
          <GamesDisplay />
        </div>

        <div className="mb-3">
          <PromotionSection />
        </div>

        <div className="mb-6">
          <GameProvider />
        </div>
      </main>

      <div className="px-4 md:px-8 mb-5">
        <FeaturesSection />
      </div>

      <div className="px-4 md:px-8 mb-6">
        <Faq />
      </div>

      <Footer />

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileFooterNav />
      </footer>
    </div>
  );
}

function ToastMessage({ onClose }) {
  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 p-4 bg-red-600 text-black dark:text-white flex justify-between items-center animate-slide-in rounded-lg shadow-lg w-[90%] md:w-[400px] z-[1000]">
      <span className="flex-1 text-center">You are not logged in. Please log in to continue.</span>
      <button onClick={onClose} className="ml-4 text-black dark:text-white font-bold">&times;</button>
    </div>
  );
}

export default Home1;

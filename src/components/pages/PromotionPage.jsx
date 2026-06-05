import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import Promotion from '../sidebar-components/Miscellaneous/Promotion'
import '../../assets/css/ranamatch.css';

function PromotionPage() {
  return (
    <div className="finance-route-shell min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <Promotion />
      </main>
    </div>
  )
}

export default PromotionPage

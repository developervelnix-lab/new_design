import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import Bonus from '../sidebar-components/Miscellaneous/Bonus'
import '../../assets/css/ranamatch.css';

function BonusPage() {
  return (
    <div className="rana-layout bonus-route min-h-screen">
      <RanaHeader />
      <main className="bonus-route-main">
        <Bonus />
      </main>
    </div>
  )
}

export default BonusPage

import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import Deposit from '../navbar/Deposit'
import '../../assets/css/ranamatch.css'

function DepositPage() {
  return (
    <div className="finance-route-shell min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <Deposit />
      </main>
    </div>
  )
}

export default DepositPage

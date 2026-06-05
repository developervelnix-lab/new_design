import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import Withdraw from '../navbar/Withdraw'
import '../../assets/css/ranamatch.css'

function WithdrawPage() {
  return (
    <div className="finance-route-shell min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <Withdraw />
      </main>
    </div>
  )
}

export default WithdrawPage

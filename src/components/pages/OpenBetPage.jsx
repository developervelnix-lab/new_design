import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import OpenBets from '../sidebar-components/statements/OpenBets'
import '../../assets/css/ranamatch.css'

function OpenBetPage() {
  return (
    <div className="rana-layout min-h-screen">
      <RanaHeader />
      <div className=''>
        <OpenBets />
      </div>
    </div>
  )
}

export default OpenBetPage

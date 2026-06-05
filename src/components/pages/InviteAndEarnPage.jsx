import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import InviteAndEarn from '../sidebar-components/Miscellaneous/InviteAndEarn'
import { useColors } from '../../hooks/useColors';
import '../../assets/css/ranamatch.css';

function InviteAndEarnPage() {
  const COLORS = useColors();
  return (
    <div className="rana-layout min-h-screen">
      <RanaHeader />
      <div className='pb-10 px-2'>
        <InviteAndEarn />
      </div>
    </div>
  )
}

export default InviteAndEarnPage

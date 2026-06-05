import React from 'react'
import RanaHeader from '../home/ranamatch/RanaHeader'
import PasswordChangeForm from '../sidebar-components/account-actions/ChangePassword'
import { useColors } from '../../hooks/useColors';
import '../../assets/css/ranamatch.css';

function ChangePasswordPage() {
  const COLORS = useColors();
  return (
    <div className="rana-layout min-h-screen">
      <RanaHeader />
      <div className='pb-10 px-2'>
        <PasswordChangeForm />
      </div>
    </div>
  )
}

export default ChangePasswordPage

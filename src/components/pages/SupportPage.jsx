import React from 'react'
import { useSearchParams } from 'react-router-dom'
import ContactUs from '../sidebar-components/contact/ContactUs'
import SupportHistory from '../sidebar-components/contact/SupportHistory'
import RanaHeader from '../home/ranamatch/RanaHeader'
import AuthModalHost from '../common/AuthModalHost'
import '../../assets/css/ranamatch.css'

function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'contact';

  const setShowHistory = () => {
    setSearchParams({ view: 'history' });
  };

  const setShowContact = () => {
    setSearchParams({}); // Back to default
  };

  return (
    <div className="rana-layout">
      <AuthModalHost />
      <RanaHeader />
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 40px',
        minHeight: 0,
      }}>
        <div style={{ width: '100%', maxWidth: '960px' }}>
          {view === 'history' ? (
            <SupportHistory onBack={setShowContact} />
          ) : (
            <ContactUs onShowHistory={setShowHistory} />
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportPage

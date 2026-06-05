import ExclusionPolicy from '../sidebar-components/legal-complience/Exclusion'
import RanaHeader from '../home/ranamatch/RanaHeader'
import '../../assets/css/ranamatch.css';

function ExclusionPolicyPage() {
  return (
    <div className="finance-route-shell legal-route-shell min-h-screen">
      <RanaHeader />
      <main className="finance-route-main legal-route-main">
        <ExclusionPolicy />
      </main>
    </div>
  )
}

export default ExclusionPolicyPage

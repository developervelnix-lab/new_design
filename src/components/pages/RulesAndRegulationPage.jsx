import RulesAndRegulation from '../sidebar-components/legal-complience/RulesAndRegulation'
import RanaHeader from '../home/ranamatch/RanaHeader'
import '../../assets/css/ranamatch.css';

function RulesAndRegulationPage() {
  return (
    <div className="finance-route-shell legal-route-shell min-h-screen">
      <RanaHeader />
      <main className="finance-route-main legal-route-main">
        <RulesAndRegulation />
      </main>
    </div>
  )
}

export default RulesAndRegulationPage

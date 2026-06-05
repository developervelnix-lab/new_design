import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBolt, FaCheckCircle, FaClock, FaExclamationCircle, FaGift, FaInfoCircle, FaShieldAlt, FaTimesCircle, FaTrophy, FaWallet } from 'react-icons/fa';
import { API_URL } from '../../utils/constants';
import { useSite } from '../../context/SiteContext';
import RanaHeader from '../home/ranamatch/RanaHeader';
import '../../assets/css/ranamatch.css';

const money = (value) => `\u20b9${Number(value || 0).toLocaleString('en-IN')}`;

const ActiveBonusPage = () => {
  const navigate = useNavigate();
  const { refreshSiteData, accountInfo } = useSite();
  const hasWagering = accountInfo ? Number(accountInfo.tbl_requiredplay_balance) > 0 : false;
  const activeBonusId = accountInfo ? Number(accountInfo.tbl_active_bonus_id) : 0;

  const [bonusData, setBonusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchActiveBonusDetails = async () => {
    const userId = localStorage.getItem('account_id');
    const authSecretKey = localStorage.getItem('auth_secret_key');

    if (!userId || !authSecretKey) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${API_URL}?USER_ID=${userId}`, {
        headers: {
          Route: 'route-active-bonus-details',
          AuthToken: authSecretKey,
        },
      });
      const result = await response.json();

      if (result.status === 'success') {
        setBonusData(result.data);
      } else if (result.status_code === 'no_active_bonus' && !(activeBonusId > 0)) {
        navigate('/bonus');
      }
    } catch (err) {
      console.error('Error fetching active bonus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBonusDetails();
  }, []);

  const handleCancelBonus = async () => {
    if (!window.confirm('Are you sure you want to cancel this bonus? Your bonus balance and wagering progress will be lost forever.')) return;

    const authSecretKey = localStorage.getItem('auth_secret_key');
    const userId = localStorage.getItem('account_id');

    setCancelling(true);
    try {
      const response = await fetch(`${API_URL}?USER_ID=${userId}`, {
        headers: {
          Route: 'request-cancel-bonus',
          AuthToken: authSecretKey,
        },
      });
      const result = await response.json();

      if (result.status === 'success') {
        alert(result.message);
        refreshSiteData();
        navigate('/bonus');
      } else {
        alert(result.message || 'Cancellation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const progress = useMemo(() => {
    if (!bonusData) return { required: 0, remaining: 0, done: 0, percent: 0 };
    const required = Number(bonusData.wagering_required || 0);
    const remaining = Number(bonusData.current_remaining_wagering || 0);
    const done = Math.max(0, required - remaining);
    const percent = required > 0 ? Math.min(100, (done / required) * 100) : 100;
    return { required, remaining, done, percent };
  }, [bonusData]);

  const trackerRows = bonusData ? [
    { label: 'Promotion Name', value: bonusData.title || bonusData.name, icon: <FaGift /> },
    { label: 'Promotion Type', value: bonusData.type || bonusData.bonus_category, icon: <FaShieldAlt /> },
    { label: 'Initial Bonus', value: money(bonusData.bonus_amount), icon: <FaWallet /> },
    { label: 'Claimed On', value: bonusData.claim_date ? new Date(bonusData.claim_date).toLocaleString() : '-', icon: <FaClock /> },
    { label: 'Expires At', value: bonusData.end_at ? new Date(bonusData.end_at).toLocaleString() : '-', icon: <FaBolt /> },
  ] : [];

  const renderEmptyState = ({ lock = false } = {}) => (
    <div className="rana-layout active-bonus-route">
      <RanaHeader />
      <main className="active-bonus-main">
        <section className="active-bonus-empty">
          {lock ? <FaExclamationCircle /> : <FaGift />}
          <h1>{lock ? 'Wagering lock active' : 'No active bonus'}</h1>
          <p>
            {lock
              ? <>A remaining wagering requirement of <strong>{money(accountInfo?.tbl_requiredplay_balance)}</strong> is still attached to your account.</>
              : 'You do not have any active wagering requirement right now.'}
          </p>
          <div>
            {lock && (
              <button type="button" className="is-danger" onClick={handleCancelBonus} disabled={cancelling}>
                {cancelling ? 'Clearing...' : 'Clear wagering lock'}
              </button>
            )}
            <button type="button" onClick={() => navigate('/bonus')}>View bonuses</button>
          </div>
        </section>
      </main>
    </div>
  );

  if (loading) {
    return (
      <div className="rana-layout active-bonus-route">
        <RanaHeader />
        <main className="active-bonus-main">
          <section className="active-bonus-loader">
            <i />
            <strong>Loading active tracker</strong>
          </section>
        </main>
      </div>
    );
  }

  if (!bonusData) {
    if (hasWagering && activeBonusId > 0) return renderEmptyState({ lock: true });
    return renderEmptyState();
  }

  return (
    <div className="rana-layout active-bonus-route">
      <RanaHeader />

      <main className="active-bonus-main">
        <button type="button" className="active-bonus-back" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </button>

        <section className="active-bonus-hero">
          <div className="active-bonus-title">
            <span><FaBolt /> Live Bonus Tracker</span>
            <h1>{bonusData.title || bonusData.name}</h1>
            <p>Track wagering progress, remaining requirement, bonus balance, and expiry from one focused desk.</p>
          </div>

          <div className="active-bonus-ring" style={{ '--progress': `${progress.percent}%` }}>
            <div>
              <strong>{progress.percent.toFixed(0)}%</strong>
              <span>Complete</span>
            </div>
          </div>

          <div className="active-bonus-actions">
            <span>{bonusData.bonus_category || 'Bonus'} exclusive</span>
            <button type="button" onClick={handleCancelBonus} disabled={cancelling}>
              <FaTimesCircle />
              {cancelling ? 'Cancelling...' : 'Cancel bonus'}
            </button>
          </div>
        </section>

        <section className="active-bonus-metrics">
          <div>
            <FaGift />
            <span>Bonus balance</span>
            <strong>{money(bonusData.current_bonus_balance)}</strong>
          </div>
          <div>
            <FaCheckCircle />
            <span>Completed</span>
            <strong>{money(progress.done)}</strong>
          </div>
          <div>
            <FaClock />
            <span>Remaining</span>
            <strong>{money(progress.remaining)}</strong>
          </div>
          <div>
            <FaTrophy />
            <span>Required</span>
            <strong>{money(progress.required)}</strong>
          </div>
        </section>

        <section className="active-bonus-grid">
          <div className="active-bonus-card active-bonus-progress-card">
            <div className="active-bonus-card-head">
              <h2>Wagering roadmap</h2>
              <span>{progress.percent.toFixed(1)}%</span>
            </div>
            <div className="active-bonus-progress-line">
              <i style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="active-bonus-road">
              <div className="is-done"><span />Claimed</div>
              <div className={progress.percent >= 50 ? 'is-done' : ''}><span />Halfway</div>
              <div className={progress.percent >= 100 ? 'is-done' : ''}><span />Release</div>
            </div>
            <p>When the remaining requirement reaches {money(0)}, eligible bonus funds can move to your real balance.</p>
          </div>

          <div className="active-bonus-card">
            <div className="active-bonus-card-head">
              <h2>Tracker details</h2>
            </div>
            <div className="active-bonus-detail-list">
              {trackerRows.map((row) => (
                <div key={row.label}>
                  {row.icon}
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="active-bonus-note">
            <FaInfoCircle />
            <p>Do not cancel unless you want to remove this bonus and its wagering progress. Cancelled bonus balance cannot be restored.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ActiveBonusPage;

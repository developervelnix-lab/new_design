import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBolt, FaCheckCircle, FaClock, FaCoins, FaFileAlt, FaGamepad, FaGift, FaInfoCircle, FaShieldAlt, FaTimesCircle } from 'react-icons/fa';
import { useSite } from '../../context/SiteContext';
import { API_URL, URL as BASE_URL } from '../../utils/constants';
import RanaHeader from '../home/ranamatch/RanaHeader';
import '../../assets/css/ranamatch.css';

const money = (value) => `\u20b9${Number(value || 0).toLocaleString('en-IN')}`;

const getImageUrl = (image) => {
  if (!image) return '/placeholder.svg';
  return image.startsWith('http') ? image : `${BASE_URL}${image}`;
};

const BonusDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get('type') || 'standard';
  const { setShowLogin, refreshSiteData, accountInfo } = useSite();

  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  const remainingWager = parseFloat(accountInfo?.tbl_requiredplay_balance || 0);
  const isActiveBonus = accountInfo && (
    Number(accountInfo.tbl_active_bonus_id) === Number(id) &&
    (remainingWager > 0 || type === 'cashback')
  );

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}?bonus_id=${id}&type=${type}`, {
          headers: { Route: 'request-bonus-details', AuthToken: 'guest' },
        });
        const result = await response.json();

        if (result.status === 'success') {
          setBonus(result.bonus);
        } else {
          setError(result.message || 'Failed to load bonus details');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load bonus details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  const detailStats = useMemo(() => {
    if (!bonus) return [];
    const wagerMultiplier = bonus.providers?.length ? `${bonus.providers[0].wagering_multiplier}x` : 'None';
    const rewardValue = bonus.redemption_type === 'percent' ? `${bonus.amount}%` : money(bonus.amount);

    return [
      { label: 'Minimum deposit', value: money(bonus.min_deposit), icon: <FaCoins /> },
      { label: 'Reward value', value: rewardValue, icon: <FaGift /> },
      { label: 'Wagering', value: wagerMultiplier, icon: <FaShieldAlt /> },
      { label: 'Ends on', value: bonus.end_date ? new Date(bonus.end_date).toLocaleDateString() : '-', icon: <FaClock /> },
    ];
  }, [bonus]);

  const handleCancelBonus = async () => {
    if (!window.confirm('Are you sure you want to cancel this bonus? Your bonus balance and wagering progress will be lost forever.')) return;

    const authSecretKey = localStorage.getItem('auth_secret_key');
    const userId = localStorage.getItem('account_id');

    setClaiming(true);
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
      } else {
        alert(result.message || 'Cancellation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const handleClaim = async () => {
    const authSecretKey = localStorage.getItem('auth_secret_key');
    const userId = localStorage.getItem('account_id');

    if (!authSecretKey || !userId) {
      setShowLogin(true);
      return;
    }

    setClaiming(true);
    try {
      const response = await fetch(`${API_URL}?bonus_id=${id}&USER_ID=${userId}&type=${type}`, {
        headers: {
          Route: 'request-claim-bonus',
          AuthToken: authSecretKey,
        },
      });
      const result = await response.json();

      if (result.status === 'success') {
        alert(type === 'cashback'
          ? 'Successfully enrolled! Your cashback will be calculated at the end of the period.'
          : `Bonus claimed! ${money(result.new_balance)} has been added to your bonus wallet.`);
        refreshSiteData();
      } else {
        alert(result.message?.replace(/_/g, ' ') || 'Claim failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const claimAction = remainingWager > 0.1 ? () => navigate('/active-bonus') : handleClaim;

  if (!id) {
    return (
      <div className="rana-layout bonus-detail-route">
        <RanaHeader />
        <main className="bonus-detail-main">
          <div className="bonus-detail-empty-state">
            <FaGift />
            <strong>Select a bonus first</strong>
            <span>Open the bonus exchange and choose any reward to view its full details.</span>
            <button type="button" onClick={() => navigate('/bonus')}>Go to bonus page</button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rana-layout bonus-detail-route">
        <RanaHeader />
        <main className="bonus-detail-main">
          <div className="bonus-detail-loader">
            <i />
            <strong>Loading reward dossier</strong>
          </div>
        </main>
      </div>
    );
  }

  if (!bonus) {
    return (
      <div className="rana-layout bonus-detail-route">
        <RanaHeader />
        <main className="bonus-detail-main">
          <div className="bonus-detail-empty-state">
            <FaTimesCircle />
            <strong>Bonus not found</strong>
            <span>{error || 'This reward is unavailable or expired.'}</span>
            <button type="button" onClick={() => navigate('/bonus')}>Back to bonus page</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="rana-layout bonus-detail-route">
      <RanaHeader />

      <main className="bonus-detail-main">
        <button type="button" className="bonus-detail-back" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </button>

        <section className="bonus-detail-hero">
          <div className="bonus-detail-image">
            <img src={getImageUrl(bonus.image_path)} alt={bonus.title} />
            <span><FaBolt /> {bonus.category || 'Reward'}</span>
          </div>

          <div className="bonus-detail-brief">
            <span className="bonus-detail-kicker">Reward Dossier</span>
            <h1>{bonus.title}</h1>
            <p>{bonus.description}</p>

            <div className="bonus-detail-stats">
              {detailStats.map((item) => (
                <div key={item.label}>
                  {item.icon}
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className="bonus-detail-claim">
            <span className={isActiveBonus ? 'is-live' : ''}>{isActiveBonus ? 'Active bonus' : 'Available now'}</span>
            <strong>{bonus.redemption_type === 'percent' ? `${bonus.amount}% boost` : `${money(bonus.amount)} bonus`}</strong>
            <p>Ends {bonus.end_date ? new Date(bonus.end_date).toLocaleDateString() : '-'}</p>

            {isActiveBonus ? (
              <>
                <button type="button" className="is-success" onClick={() => navigate('/active-bonus')}>
                  View progress
                </button>
                <button type="button" className="is-danger" onClick={handleCancelBonus} disabled={claiming}>
                  {claiming ? 'Cancelling...' : 'Cancel bonus'}
                </button>
              </>
            ) : (
              <button type="button" onClick={claimAction} disabled={claiming}>
                {claiming ? 'Processing...' : remainingWager > 0.1 ? 'View active bonus' : 'Claim reward'}
              </button>
            )}

            <small>One active reward can run at a time.</small>
          </aside>
        </section>

        <section className="bonus-detail-grid">
          <div className="bonus-detail-card">
            <h2><FaInfoCircle /> How this reward works</h2>
            <p>
              {bonus.type === 'cashback'
                ? 'This cashback promotion tracks your eligible net loss and calculates a return at the end of the campaign window.'
                : `Deposit at least ${money(bonus.min_deposit)} to qualify. The bonus stays in your bonus wallet until wagering is complete.`}
            </p>

            <div className="bonus-detail-steps">
              {[
                { title: 'Deposit', text: `Minimum ${money(bonus.min_deposit)}`, icon: <FaCoins /> },
                { title: 'Claim', text: 'Activate this reward', icon: <FaCheckCircle /> },
                { title: 'Play', text: 'Complete wagering', icon: <FaGamepad /> },
              ].map((step) => (
                <div key={step.title}>
                  {step.icon}
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bonus-detail-card">
            <h2><FaGamepad /> Eligible providers</h2>
            {bonus.providers?.length ? (
              <div className="bonus-detail-providers">
                {bonus.providers.map((provider, index) => (
                  <span key={`${provider.provider_name}-${index}`}>
                    {provider.provider_name}
                    <strong>{provider.wagering_multiplier}x</strong>
                  </span>
                ))}
              </div>
            ) : (
              <p>No provider restriction is listed for this reward.</p>
            )}
          </div>

          <div className="bonus-detail-card bonus-detail-terms">
            <h2><FaFileAlt /> Terms and conditions</h2>
            <div>
              {bonus.terms_conditions
                ? bonus.terms_conditions.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
                : <p>Standard platform terms and conditions apply. Please review wagering requirements before claiming this reward.</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BonusDetailsPage;

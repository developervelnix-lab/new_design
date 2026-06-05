import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaBolt, FaCheckCircle, FaClock, FaCrown, FaGift, FaInfoCircle, FaShieldAlt, FaTag } from 'react-icons/fa';
import { API_URL, URL as BASE_URL } from '../../../utils/constants';
import { useSite } from '../../../context/SiteContext';

const getImageUrl = (image) => {
  if (!image) return '/placeholder.svg';
  return image.startsWith('http') ? image : `${BASE_URL}${image}`;
};

const getTimeLeft = (endDate) => {
  const difference = new Date(endDate) - new Date();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0 };

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
  };
};

const BonusTicket = ({
  title,
  description,
  endDate,
  image,
  promoType,
  pendingAmount,
  isActive,
  onOpen,
  onClaim,
  onActiveClick,
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 60000);
    return () => clearInterval(timer);
  }, [endDate]);

  const isCashback = promoType === 'cashback';

  return (
    <article className={`bonus-v3-ticket ${isActive ? 'is-active' : ''}`} onClick={onOpen}>
      <div className="bonus-v3-ticket-media">
        <img src={getImageUrl(image)} alt={title} />
        <div className="bonus-v3-ticket-badge">
          {isCashback ? <FaCrown /> : <FaTag />}
          <span>{isCashback ? 'Cashback' : 'Bonus'}</span>
        </div>
        {isActive && (
          <div className="bonus-v3-active-pin">
            <FaCheckCircle />
            Active
          </div>
        )}
      </div>

      <div className="bonus-v3-ticket-body">
        <div className="bonus-v3-ticket-copy">
          <span>{description || 'Exclusive reward'}</span>
          <h3>{title}</h3>
        </div>

        <div className="bonus-v3-ticket-meta">
          <div>
            <FaClock />
            <strong>{timeLeft.days}d {timeLeft.hours}h</strong>
            <span>Left</span>
          </div>
          <div>
            <FaShieldAlt />
            <strong>1x</strong>
            <span>Active limit</span>
          </div>
        </div>

        {pendingAmount > 0 ? (
          <button
            type="button"
            className="bonus-v3-ticket-action is-cash"
            onClick={(event) => {
              event.stopPropagation();
              onClaim();
            }}
          >
            Claim {'\u20b9'}{Number(pendingAmount).toLocaleString('en-IN')}
            <FaArrowRight />
          </button>
        ) : isActive ? (
          <button
            type="button"
            className="bonus-v3-ticket-action is-active-action"
            onClick={(event) => {
              event.stopPropagation();
              onActiveClick();
            }}
          >
            View active bonus
            <FaArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="bonus-v3-ticket-action"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            Explore reward
            <FaArrowRight />
          </button>
        )}
      </div>
    </article>
  );
};

const Bonus = () => {
  const navigate = useNavigate();
  const { accountInfo, refreshSiteData } = useSite();
  const activeBonusId = parseInt(accountInfo?.tbl_active_bonus_id || 0, 10);
  const hasWagering = parseFloat(accountInfo?.tbl_requiredplay_balance || 0) > 0.01;

  const [activeTab, setActiveTab] = useState('all');
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const activeBonusData = promotions.find((promo) => Number(promo.id) === activeBonusId);

  const stats = useMemo(() => {
    const now = new Date();
    const livePromos = promotions.filter((promo) => new Date(promo.end_date) > now);
    return [
      { label: 'Live rewards', value: livePromos.length || 0 },
      { label: 'Cashback', value: livePromos.filter((promo) => promo.promo_type === 'cashback').length || 0 },
      { label: 'Active lock', value: activeBonusId > 0 || hasWagering ? 'On' : 'Off' },
    ];
  }, [promotions, activeBonusId, hasWagering]);

  const fetchPromotions = () => {
    const userId = localStorage.getItem('account_id');
    const url = new URL(API_URL);
    url.searchParams.append('_t', Date.now().toString());
    if (userId) url.searchParams.append('USER_ID', userId);

    fetch(url.toString(), {
      method: 'GET',
      headers: { Route: 'route-active-promotions', AuthToken: 'guest', 'Content-Type': 'application/json' },
    })
      .then((res) => res.text())
      .then((text) => {
        const jsonStart = text.indexOf('{');
        if (jsonStart === -1) throw new Error('Invalid JSON response');
        return JSON.parse(text.slice(jsonStart));
      })
      .then((data) => {
        if (data.status === 'success') setPromotions(data.promotions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Bonus fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshSiteData();
    fetchPromotions();
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
        fetchPromotions();
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

  const handleClaim = (logId) => {
    const userId = localStorage.getItem('user_id') || localStorage.getItem('account_id');
    if (!userId) return alert('Please login to claim');

    setLoading(true);
    const formData = new FormData();
    formData.append('USER_ID', userId);
    formData.append('LOG_ID', logId);

    fetch(API_URL, {
      method: 'POST',
      headers: { Route: 'route-claim-cashback', AuthToken: 'guest' },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        fetchPromotions();
      })
      .catch(() => {
        alert('Something went wrong!');
        setLoading(false);
      });
  };

  const now = new Date();
  const visiblePromotions = promotions.filter((promo) => {
    const category = (promo.category || '').toLowerCase();
    const isCorrectTab = activeTab === 'all' || category === 'all' || category === activeTab;
    return isCorrectTab && new Date(promo.end_date) > now;
  });

  return (
    <section className="bonus-v3-shell">
      <div className="bonus-v3-hero">
        <div className="bonus-v3-hero-copy">
          <span className="bonus-v3-kicker"><FaBolt /> Rewards Desk</span>
          <h1>Bonus Exchange</h1>
          <p>Pick a reward, review the terms, and activate the offer that fits your next play session.</p>
        </div>
        <div className="bonus-v3-stats">
          {stats.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bonus-v3-workspace">
        <aside className="bonus-v3-filter">
          <span>Filter rewards</span>
          {['all', 'sports', 'casino'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? 'is-selected' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </aside>

        <div className="bonus-v3-board">
          {localStorage.getItem('auth_secret_key') && (activeBonusId > 0 || hasWagering) && (
            <div className="bonus-v3-lock">
              <div>
                <span>Current bonus lock</span>
                <strong>{activeBonusData?.title || (activeBonusId > 0 ? 'Active Bonus Found' : 'Wagering Lock Active')}</strong>
              </div>
              <div>
                <span>Wagering remaining</span>
                <strong>{'\u20b9'}{Number(accountInfo?.tbl_requiredplay_balance || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div className="bonus-v3-lock-actions">
                <button type="button" onClick={() => navigate('/active-bonus')}>View</button>
                <button type="button" onClick={handleCancelBonus} disabled={cancelling}>
                  {cancelling ? 'Clearing...' : 'Clear'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bonus-v3-loading">
              <i />
              <strong>Loading rewards</strong>
            </div>
          ) : visiblePromotions.length === 0 ? (
            <div className="bonus-v3-empty">
              <FaGift />
              <strong>No rewards available</strong>
              <span>New bonus campaigns will appear here automatically.</span>
            </div>
          ) : (
            <div className="bonus-v3-grid">
              {visiblePromotions.map((promo) => (
                <BonusTicket
                  key={promo.id}
                  title={promo.title}
                  description={promo.description}
                  endDate={promo.end_date}
                  image={promo.image_path}
                  promoType={promo.promo_type}
                  pendingAmount={promo.pending_amount}
                  isActive={activeBonusId === Number(promo.id) && (hasWagering || promo.promo_type === 'cashback')}
                  onOpen={() => navigate(promo.action)}
                  onClaim={() => handleClaim(promo.log_id)}
                  onActiveClick={() => navigate('/active-bonus')}
                />
              ))}
            </div>
          )}

          <div className="bonus-v3-note">
            <FaInfoCircle />
            <p>
              Only one bonus can stay active at a time. Complete, cancel, or expire the current bonus before activating another reward.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bonus;

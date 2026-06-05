import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaAward, FaChevronRight, FaClock, FaGift, FaInfoCircle, FaSearch, FaTag } from "react-icons/fa"
import { FONTS } from "../../../constants/theme"
import { API_URL, URL as BASE_URL } from "../../../utils/constants"

const getImageUrl = (image) => {
  if (!image) return ""
  if (image.startsWith("http") || image.startsWith("data:")) return image
  return `${BASE_URL}${image.startsWith("/") ? image : `/${image}`}`
}

const getTimeLeft = (endDate) => {
  const difference = new Date(endDate) - new Date()
  if (!endDate || Number.isNaN(difference) || difference <= 0) return null
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  if (days > 0) return `${days}d left`
  return `${hours}h left`
}

const PromotionCard = ({ promo, onClick }) => {
  const timeLeft = getTimeLeft(promo.end_date)
  const cleanDesc = promo.description ? promo.description.replace(/_/g, " ") : "Exclusive reward campaign"
  const type = promo.promo_type === "cashback" ? "Cashback" : "Deposit"

  return (
    <button type="button" className="promo-v2-card" onClick={onClick}>
      <div className="promo-v2-media">
        {promo.image_path ? (
          <img src={getImageUrl(promo.image_path)} alt={promo.title || "Promotion"} />
        ) : (
          <div className="promo-v2-placeholder"><FaGift /></div>
        )}
        <div className="promo-v2-badges">
          <span><FaAward /> {type}</span>
          {timeLeft && <em><FaClock /> {timeLeft}</em>}
        </div>
      </div>

      <div className="promo-v2-body">
        <span className="promo-v2-kicker">{cleanDesc}</span>
        <h3>{promo.title || "Promotion Offer"}</h3>
        <div className="promo-v2-action">
          <span>View Details</span>
          <FaChevronRight />
        </div>
      </div>
    </button>
  )
}

const Promotion = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPromotions = () => {
    const url = new URL(API_URL)
    url.searchParams.append("_t", Date.now().toString())

    fetch(url.toString(), {
      method: "GET",
      headers: { Route: "route-offer-promotions", AuthToken: "guest", "Content-Type": "application/json" },
    })
      .then((res) => res.text())
      .then((text) => {
        const jsonStart = text.indexOf("{")
        if (jsonStart === -1) throw new Error("Invalid JSON response")
        return JSON.parse(text.slice(jsonStart))
      })
      .then((data) => {
        if (data.status === "success") setPromotions(data.promotions || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("DEBUG: Fetch Error:", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  const visiblePromotions = useMemo(() => {
    return promotions.filter((promo) => {
      const category = (promo.category || "").toLowerCase()
      const searchable = `${promo.title || ""} ${promo.description || ""} ${promo.promo_type || ""}`.toLowerCase()
      const matchesTab = activeTab === "all" || category === "all" || category === activeTab
      const matchesSearch = searchable.includes(searchTerm.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [promotions, activeTab, searchTerm])

  return (
    <div className="promo-v2">
      <section className="promo-v2-toolbar">
        <div className="promo-v2-title">
          <span><FaTag /></span>
          <div>
            <h1 style={{ fontFamily: FONTS.head }}>Promotions</h1>
            <p>Browse active rewards, cashback offers, and tournament campaigns.</p>
          </div>
        </div>

        <label className="promo-v2-search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search promotions"
          />
        </label>
      </section>

      <section className="promo-v2-controls">
        <div className="promo-v2-tabs">
          {["all", "sports", "casino"].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
              {tab}
            </button>
          ))}
        </div>
        <div className="promo-v2-count">
          <strong>{visiblePromotions.length}</strong>
          <span>Visible Offers</span>
        </div>
      </section>

      <section className="promo-v2-grid-wrap">
        {loading ? (
          <div className="promo-v2-empty">
            <span className="promo-v2-loader" />
            <strong>Loading campaigns</strong>
            <p>Fetching latest rewards.</p>
          </div>
        ) : visiblePromotions.length > 0 ? (
          <div className="promo-v2-grid">
            {visiblePromotions.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                onClick={() => navigate(`/bonus-details/${promo.id}?type=${promo.promo_type || "standard"}`)}
              />
            ))}
          </div>
        ) : (
          <div className="promo-v2-empty">
            <FaGift />
            <strong>No active promotions</strong>
            <p>Try another filter or search term.</p>
          </div>
        )}
      </section>

      <section className="promo-v2-note">
        <FaInfoCircle />
        <div>
          <h2>Promotion Terms & Requirements</h2>
          <p>
            Read wagering multipliers and minimum deposit criteria inside each promotion before claiming. Only one active bonus tracker may run at a time.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Promotion

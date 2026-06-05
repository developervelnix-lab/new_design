"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWallet,
  faIndianRupeeSign,
  faCopy,
  faCheck,
  faInfoCircle,
  faQrcode,
  faCreditCard,
  faDownload,
  faHistory,
  faSearch,
  faClock,
} from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"
import { FONTS } from "../../constants/theme"
import { apiGet } from "@/utils/apiFetch"
import { useSite } from "../../context/SiteContext"

function Deposit() {
  const [amount, setAmount] = useState("")
  const [activeTab, setActiveTab] = useState("upi")
  const [selectedOption, setSelectedOption] = useState("upi1")
  const [upi, setUpi] = useState("")
  const [upi2, setUpi2] = useState("")
  const [bank, setBank] = useState({})
  const [utr, setUtr] = useState("")
  const [mode, setMode] = useState("")
  const [quickAmounts, setQuickAmounts] = useState(["100", "200", "500", "1000", "5000", "10000"])
  const [notification, setNotification] = useState({ isOpen: false, message: "", type: "" })
  const [depositRecords, setDepositRecords] = useState([])
  const [historyFilter, setHistoryFilter] = useState("All")
  const [loadingHistory, setLoadingHistory] = useState(false)
  const navigate = useNavigate()
  const userId = localStorage.getItem("account_id")
  const { accountInfo, logout } = useSite()

  const paymentOptions = [
    { id: "upi1", name: "UPI 1", type: "upi", logo: faQrcode },
    { id: "upi2", name: "UPI 2", type: "upi", logo: faQrcode },
    { id: "3", name: "Bank", type: "bank", logo: faCreditCard },
    { id: "casypay", name: "Casypay", type: "gateway2", logo: faCreditCard },
  ]

  const addToast = (message, type = "info") => {
    setNotification({ isOpen: true, message, type })
  }

  const handleQuickAmount = (value) => setAmount(value.toString())

  const generateQRCodeUrl = (upiId) => {
    if (!upiId) return null
    return `https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=Merchant&cu=INR&size=150x150`
  }

  const qrCodeUrl = generateQRCodeUrl(selectedOption === "upi1" ? upi : upi2)

  useEffect(() => {
    setActiveTab("upi")
    setSelectedOption("upi1")
  }, [])

  useEffect(() => {
    const fetchDepositAddress = async () => {
      try {
        const response = await apiGet("route-deposit-info")
        const result = await response.json()
        setUpi(result.UPI.UPI_ID_1)
        setUpi2(result.UPI.UPI_ID_2)
        if (result.deposit_options) {
          setQuickAmounts(result.deposit_options.split(","))
        }
        setBank({
          ACCOUNT_HOLDER: result.BANK_DETAILS?.ACCOUNT_HOLDER || "RANAMATCH TRADING",
          ACCOUNT_NUMBER: result.BANK_DETAILS?.ACCOUNT_NUMBER || "912020001234567",
          IFSC_CODE: result.BANK_DETAILS?.IFSC_CODE || "UTIB0001234",
          BANK_NAME: result.BANK_DETAILS?.BANK_NAME || "AXIS BANK",
        })
      } catch (error) {
        console.error("Error fetching Deposit Address", error)
        setBank({
          ACCOUNT_HOLDER: "RANAMATCH TRADING",
          ACCOUNT_NUMBER: "912020001234567",
          IFSC_CODE: "UTIB0001234",
          BANK_NAME: "AXIS BANK",
        })
      }
    }
    if (userId) fetchDepositAddress()
  }, [userId])

  const fetchDepositRecords = async () => {
    if (!userId) return
    setLoadingHistory(true)
    try {
      const response = await apiGet("route-recharge-records", { PAGE_NUM: 1 })
      const result = await response.json()
      setDepositRecords(result.data || [])
    } catch (error) {
      console.error("Fetch error", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchDepositRecords()
  }, [userId])

  useEffect(() => {
    if (activeTab === "upi") setMode("UPIPay")
    else if (activeTab === "bank") setMode("BankPay")
    else if (activeTab === "gateway2") setMode("CasyPay")
  }, [activeTab])

  const copyToClipboard = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    addToast(`${label} copied`, "success")
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `qr-${selectedOption}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      addToast("QR code download started", "success")
    } catch (error) {
      addToast("Failed to download QR code", "error")
    }
  }

  const copyBankDetails = () => {
    const details = `Holder: ${bank.ACCOUNT_HOLDER || "--"}\nNumber: ${bank.ACCOUNT_NUMBER || "--"}\nIFSC: ${bank.IFSC_CODE || "--"}\nBank: ${bank.BANK_NAME || "--"}`
    copyToClipboard(details, "Bank details")
  }

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 100) {
      addToast("Minimum amount is Rs 100", "error")
      return
    }
    if (mode === "CasyPay") {
      const paymentURL = "https://pay.ranamatch.com/gateapi/payments/gateways1/initialisation/casypay.php"
      window.location.href = `${paymentURL}?amount=${amount}&user_id=${userId}`
      return
    }
    if (!utr || utr.trim() === "") {
      addToast("Transaction UTR is required", "error")
      return
    }

    const utrRegex = /^[a-zA-Z0-9]{12,22}$/
    if (!utrRegex.test(utr)) {
      addToast(utr.length < 12 || utr.length > 22 ? "UTR must be 12 to 22 characters" : "UTR must contain only letters and numbers", "error")
      return
    }

    try {
      const response = await apiGet("route-recharge-request", {
        RECHARGE_AMOUNT: amount,
        RECHARGE_MODE: mode,
        RECHARGE_DETAILS: `${utr},${mode}`,
      })
      const result = await response.json()
      if (result.status_code === "pending") {
        addToast(`Deposit of Rs ${amount} submitted`, "success")
        setAmount("")
        setUtr("")
        fetchDepositRecords()
      } else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      } else {
        addToast(`Error: ${result.status_code}`, "error")
      }
    } catch (error) {
      addToast("Error submitting request", "error")
    }
  }

  const isLoggedIn = !!accountInfo?.account_id

  useEffect(() => {
    if (!isLoggedIn) navigate("/")
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  return (
    <div className="finance-v2 finance-deposit-v2">
      {notification.isOpen && (
        <div className="finance-v2-modal">
          <div className="finance-v2-notice">
            <div className={`finance-v2-notice-icon ${notification.type || "info"}`}>
              <FontAwesomeIcon icon={notification.type === "success" ? faCheck : faInfoCircle} />
            </div>
            <h3>{notification.type === "success" ? "Request Updated" : "Wallet Notice"}</h3>
            <p>{notification.message}</p>
            <button type="button" onClick={() => setNotification({ ...notification, isOpen: false })}>Close</button>
          </div>
        </div>
      )}

      <section className="finance-v2-top">
        <div>
          <span className="finance-v2-tag">Instant Deposit Desk</span>
          <h1 style={{ fontFamily: FONTS.head }}>Add Balance</h1>
          <p>Pick a payment channel, enter the amount, then submit your UTR in one compact flow.</p>
        </div>
        <div className="finance-v2-stats">
          <div><strong>{"\u20b9"}100</strong><span>Minimum</span></div>
          <div><strong>UPI</strong><span>Fast Pay</span></div>
          <div><strong>24/7</strong><span>Support</span></div>
        </div>
      </section>

      <section className="finance-v2-workspace">
        <div className="finance-v2-panel finance-v2-methods">
          <div className="finance-v2-panel-head">
            <span>01</span>
            <div>
              <h2>Payment Channel</h2>
              <p>Choose where you made the transfer.</p>
            </div>
          </div>

          <div className="finance-v2-method-list">
            {paymentOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setSelectedOption(opt.id); setActiveTab(opt.type) }}
                className={selectedOption === opt.id ? "active" : ""}
              >
                <FontAwesomeIcon icon={opt.logo} />
                <span>{opt.name}</span>
                {selectedOption === opt.id && <FontAwesomeIcon icon={faCheck} className="check" />}
              </button>
            ))}
          </div>

          <div className="finance-v2-payment-card">
            {activeTab === "upi" ? (
              <>
                <div className="finance-v2-payline">
                  <span>Active UPI ID</span>
                  <button type="button" onClick={() => copyToClipboard(selectedOption === "upi1" ? upi : upi2, "UPI ID")}>
                    <FontAwesomeIcon icon={faCopy} /> Copy
                  </button>
                </div>
                <div className="finance-v2-upi-id">{selectedOption === "upi1" ? upi || "Fetching UPI..." : upi2 || "Fetching UPI..."}</div>
                <div className="finance-v2-qr-row">
                  <div className="finance-v2-qr">
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="UPI QR code" />
                  </div>
                  <button type="button" className="finance-v2-soft-btn" onClick={downloadQRCode}>
                    <FontAwesomeIcon icon={faDownload} /> Download QR
                  </button>
                </div>
              </>
            ) : activeTab === "bank" ? (
              <>
                <div className="finance-v2-payline">
                  <span>Bank Transfer</span>
                  <button type="button" onClick={copyBankDetails}>
                    <FontAwesomeIcon icon={faCopy} /> Copy All
                  </button>
                </div>
                <div className="finance-v2-bank-grid">
                  {[
                    ["Holder", bank.ACCOUNT_HOLDER],
                    ["Account", bank.ACCOUNT_NUMBER],
                    ["IFSC", bank.IFSC_CODE],
                    ["Bank", bank.BANK_NAME],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value || "--"}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="finance-v2-gateway">
                <FontAwesomeIcon icon={faCreditCard} />
                <h3>Instant Gateway</h3>
                <p>Continue to the secure payment gateway. UTR is not required for this channel.</p>
              </div>
            )}
          </div>
        </div>

        <div className="finance-v2-ticket">
          <div className="finance-v2-panel-head">
            <span>02</span>
            <div>
              <h2>Deposit Request</h2>
              <p>Enter amount and reference details.</p>
            </div>
          </div>

          <label className="finance-v2-label">Amount</label>
          <div className="finance-v2-money-input">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>

          <div className="finance-v2-chip-grid">
            {quickAmounts.map((v) => (
              <button key={v} type="button" onClick={() => handleQuickAmount(v)} className={amount === v.toString() ? "active" : ""}>
                {"\u20b9"}{parseInt(v).toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          {activeTab !== "gateway" && activeTab !== "gateway2" && (
            <>
              <label className="finance-v2-label">UTR / Reference No.</label>
              <input
                className="finance-v2-text-input"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                placeholder="12 to 22 digit UTR number"
                maxLength={22}
                minLength={12}
              />
            </>
          )}

          <button
            type="button"
            onClick={handleDeposit}
            disabled={!(amount && parseFloat(amount) > 0 && (activeTab.includes("gateway") || utr))}
            className="finance-v2-primary"
          >
            <FontAwesomeIcon icon={faWallet} />
            Submit Deposit
          </button>

          <div className="finance-v2-note">
            <FontAwesomeIcon icon={faInfoCircle} />
            Correct UTR details help the wallet team verify deposits faster.
          </div>
        </div>
      </section>

      <section className="finance-v2-history">
        <div className="finance-v2-history-head">
          <div>
            <h2>Deposit History</h2>
            <p>Recent wallet top-up requests</p>
          </div>
          <div className="finance-v2-filters">
            {["All", "Success", "Processing", "Rejected"].map((f) => (
              <button key={f} type="button" onClick={() => setHistoryFilter(f)} className={historyFilter === f ? "active" : ""}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="finance-v2-records">
          {depositRecords
            .filter((r) => historyFilter === "All" || (r.r_status || "").toLowerCase() === historyFilter.toLowerCase())
            .slice(0, 6)
            .map((r, i) => (
              <div className="finance-v2-record" key={i}>
                <div>
                  <strong>{"\u20b9"}{parseFloat(r.r_amount || 0).toLocaleString("en-IN")}</strong>
                  <span>{r.r_date} | {r.r_mode}</span>
                </div>
                <div>
                  <em>{r.r_status}</em>
                  <small>#{String(r.r_uniq_id || "--------").substring(0, 8).toUpperCase()}</small>
                </div>
              </div>
            ))}

          {depositRecords.length === 0 && !loadingHistory && (
            <div className="finance-v2-empty"><FontAwesomeIcon icon={faSearch} /> No deposits recorded</div>
          )}
          {loadingHistory && (
            <div className="finance-v2-empty"><FontAwesomeIcon icon={faClock} /> Loading deposit history...</div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Deposit

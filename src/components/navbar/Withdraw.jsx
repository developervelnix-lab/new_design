"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWallet,
  faIndianRupeeSign,
  faCheck,
  faInfoCircle,
  faCreditCard,
  faPlus,
  faChevronDown,
  faSearch,
  faTimes,
  faUniversity,
  faHistory,
  faClock,
  faShieldAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons"
import { FaTrash } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSite } from "../../context/SiteContext"
import { FONTS } from "../../constants/theme"
import { apiGet, apiPost } from "@/utils/apiFetch"

const Withdraw = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState("")
  const [showAddBankPopup, setShowAddBankPopup] = useState(false)
  const [addedBankAccounts, setAddedBankAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const { accountInfo, logout } = useSite()
  const userId = localStorage.getItem("account_id")
  const [notification, setNotification] = useState({ isOpen: false, message: "", type: "" })
  const [availableBanks, setAvailableBanks] = useState([])
  const [bankSearch, setBankSearch] = useState("")
  const [withdrawRecords, setWithdrawRecords] = useState([])
  const [historyFilter, setHistoryFilter] = useState("All")
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [confirmSelection, setConfirmSelection] = useState({ isOpen: false, account: null })
  const [showFullAcct, setShowFullAcct] = useState(false)

  const [formData, setFormData] = useState({
    realName: "",
    accountNumber: "",
    selectedBank: "",
    ifscCode: "",
  })

  const addToast = (message, type = "info") => {
    setNotification({ isOpen: true, message, type })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchBankCards = async () => {
    try {
      const response = await apiGet("route-get-bankcards", { PAGE_NUM: 1 })
      const result = await response.json()
      if (result.status_code === "success") setAddedBankAccounts(result.data)
    } catch (error) {
      console.error("Error fetching bank cards", error)
    }
  }

  const fetchBankList = async () => {
    try {
      const response = await apiGet("route-get-banklist")
      const result = await response.json()
      setAvailableBanks(result.data.banklist)
    } catch (error) {
      console.error("Error fetching bank list", error)
    }
  }

  const fetchWithdrawRecords = async () => {
    if (!userId) return
    setLoadingHistory(true)
    try {
      const response = await apiGet("route-withdraw-records", { PAGE_NUM: 1 })
      const result = await response.json()
      setWithdrawRecords(result.data || [])
    } catch (error) {
      console.error("Fetch error", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchBankCards()
    fetchBankList()
    fetchWithdrawRecords()
  }, [])

  const addBankDetails = async () => {
    if (addedBankAccounts.length >= 3) {
      addToast("Maximum 3 bank accounts allowed", "error")
      return
    }

    const { realName, accountNumber, selectedBank, ifscCode } = formData
    if (!realName || !accountNumber || !selectedBank || !ifscCode) {
      addToast("Please fill all fields", "error")
      return
    }

    const cleanIFSC = ifscCode.trim().toUpperCase()
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (cleanIFSC.length !== 11) {
      addToast("IFSC must be exactly 11 characters", "error")
      return
    }
    if (!ifscRegex.test(cleanIFSC)) {
      addToast("Invalid IFSC format", "error")
      return
    }

    const cleanAcc = accountNumber.trim()
    if (!/^\d+$/.test(cleanAcc)) {
      addToast("Account number must contain only digits", "error")
      return
    }
    if (cleanAcc.length < 9 || cleanAcc.length > 18) {
      addToast("Account number must be 9 to 18 digits", "error")
      return
    }

    try {
      const response = await apiGet("route-add-bankcard", {
        BENEFICIARY_NAME: realName,
        USER_BANK_NAME: selectedBank,
        USER_BANK_ACCOUNT: cleanAcc,
        USER_BANK_IFSC_CODE: cleanIFSC,
        IS_PRIMARY: "true",
        CARD_METHOD: "bank",
      })
      const result = await response.json()
      if (result.status_code === "success") {
        addToast("Bank added successfully", "success")
        fetchBankCards()
        setShowAddBankPopup(false)
        setFormData({ realName: "", accountNumber: "", selectedBank: "", ifscCode: "" })
      } else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      } else if (result.status_code === "limit_reached") {
        addToast("Maximum 3 bank accounts allowed", "error")
      } else {
        addToast(`Error: ${result.status_code}`, "error")
      }
    } catch (error) {
      addToast("Failed to add bank account", "error")
    }
  }

  const deleteBankCard = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) return
    try {
      const response = await apiGet("route-delete-bankcard", { CARD_ID: cardId })
      const rawResponse = await response.text()
      let result
      try {
        result = JSON.parse(rawResponse)
      } catch (error) {
        throw new Error(`Invalid server response: ${rawResponse.substring(0, 50)}...`)
      }

      if (result.status_code === "success") {
        addToast("Account deleted successfully", "success")
        fetchBankCards()
        if (selectedAccount === cardId) setSelectedAccount("")
      } else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      } else {
        addToast(result.message || `Error: ${result.status_code}`, "error")
      }
    } catch (error) {
      addToast(error.message || "Failed to connect to server", "error")
    }
  }

  const handleWithdrawal = async () => {
    if (!selectedAccount) {
      addToast("Select a bank account", "error")
      return
    }
    if (!amount || parseFloat(amount) < 100 || parseFloat(amount) > 50000) {
      addToast("Amount must be Rs 100 to Rs 50,000", "error")
      return
    }
    if (parseFloat(amount) > parseFloat(accountInfo?.account_balance || 0)) {
      addToast("Insufficient withdrawable balance", "error")
      return
    }

    try {
      const response = await apiPost("route-withdraw-request", { WITHDRAW_AMOUNT: amount })
      const result = await response.json()
      if (result.status_code === "success") {
        addToast(`Withdrawal of Rs ${amount} initiated`, "success")
        setAmount("")
        fetchWithdrawRecords()
      } else if (result.status_code === "gameplay_required") {
        addToast(`Gameplay of Rs ${result.required_play_balance || "required amount"} required before withdrawal`, "error")
      } else {
        const msg = result.message || result.status_code
        addToast(`Failed: ${msg.replace(/_/g, " ").toUpperCase()}`, "error")
      }
    } catch (error) {
      addToast("Error processing request", "error")
    }
  }

  const isLoggedIn = !!accountInfo?.account_id

  useEffect(() => {
    if (!isLoggedIn) navigate("/")
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  const selectedBankAccount = addedBankAccounts.find((account) => account.c_bank_id === selectedAccount)

  return (
    <div className="finance-v2 finance-withdraw-v2">
      {notification.isOpen && (
        <div className="finance-v2-modal">
          <div className="finance-v2-notice">
            <div className={`finance-v2-notice-icon ${notification.type || "info"}`}>
              <FontAwesomeIcon icon={notification.type === "success" ? faCheck : faInfoCircle} />
            </div>
            <h3>{notification.type === "success" ? "Request Updated" : "Payout Notice"}</h3>
            <p>{notification.message}</p>
            <button type="button" onClick={() => setNotification({ ...notification, isOpen: false })}>Close</button>
          </div>
        </div>
      )}

      <section className="finance-v2-top withdraw">
        <div>
          <span className="finance-v2-tag">Verified Payout Desk</span>
          <h1 style={{ fontFamily: FONTS.head }}>Withdraw Balance</h1>
          <p>Choose a saved bank, set a payout amount, and send the request from a clean settlement screen.</p>
        </div>
        <div className="finance-v2-stats">
          <div><strong>{"\u20b9"}100</strong><span>Minimum</span></div>
          <div><strong>{"\u20b9"}50K</strong><span>Limit</span></div>
          <div><strong>3</strong><span>Banks</span></div>
        </div>
      </section>

      <section className="finance-v2-workspace withdraw">
        <div className="finance-v2-panel">
          <div className="finance-v2-balance-strip">
            <div>
              <span>Withdrawable Balance</span>
              <strong>{"\u20b9"}{parseFloat(accountInfo?.account_balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
            </div>
            <FontAwesomeIcon icon={faIndianRupeeSign} />
          </div>

          <div className="finance-v2-mini-balances">
            <div><span>Casino Bonus</span><strong>{"\u20b9"}{parseFloat(accountInfo?.account_casino_bonus || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
            <div><span>Sports Bonus</span><strong>{"\u20b9"}{parseFloat(accountInfo?.account_sports_bonus || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
            <div><span>Total Balance</span><strong>{"\u20b9"}{parseFloat(accountInfo?.account_balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
          </div>

          <div className="finance-v2-panel-head account-head">
            <span>01</span>
            <div>
              <h2>Settlement Bank</h2>
              <p>Select or link a verified bank account.</p>
            </div>
            <button
              type="button"
              className="finance-v2-link-btn"
              disabled={addedBankAccounts.length >= 3}
              onClick={() => {
                if (addedBankAccounts.length >= 3) addToast("Maximum 3 bank accounts allowed", "error")
                else setShowAddBankPopup(true)
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Link
            </button>
          </div>

          <div className="finance-v2-account-list">
            {addedBankAccounts.length > 0 ? (
              <AnimatePresence>
                {addedBankAccounts.map((account) => (
                  <motion.div
                    key={account.c_bank_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className={`finance-v2-account-card ${selectedAccount === account.c_bank_id ? "active" : ""}`}
                    onClick={() => {
                      if (selectedAccount !== account.c_bank_id) setConfirmSelection({ isOpen: true, account })
                    }}
                  >
                    <FontAwesomeIcon icon={faUniversity} />
                    <div>
                      <strong>{account.c_bank_name}</strong>
                      <span>**** {account.c_bank_account.slice(-4)}</span>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); deleteBankCard(account.c_bank_id) }}>
                      <FaTrash />
                    </button>
                    {selectedAccount === account.c_bank_id && <em><FontAwesomeIcon icon={faCheck} /></em>}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <button type="button" className="finance-v2-empty-account" onClick={() => setShowAddBankPopup(true)}>
                <FontAwesomeIcon icon={faPlus} />
                <strong>Add Bank Account</strong>
                <span>Required before withdrawal</span>
              </button>
            )}
          </div>
        </div>

        <div className="finance-v2-ticket payout">
          <div className="finance-v2-panel-head">
            <span>02</span>
            <div>
              <h2>Payout Request</h2>
              <p>{selectedBankAccount ? `Sending to ${selectedBankAccount.c_bank_name}` : "Choose a bank account first."}</p>
            </div>
          </div>

          <label className="finance-v2-label">Withdraw Amount</label>
          <div className="finance-v2-money-input">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>

          <div className="finance-v2-chip-grid four">
            {["500", "1000", "5000", "10000"].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(v)} className={amount === v ? "active" : ""}>
                {"\u20b9"}{parseInt(v).toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <button type="button" onClick={handleWithdrawal} disabled={!amount || !selectedAccount} className="finance-v2-primary">
            <FontAwesomeIcon icon={faWallet} />
            Confirm Payout
          </button>

          <div className="finance-v2-note">
            <FontAwesomeIcon icon={faInfoCircle} />
            Real cash deposits and game winnings can be withdrawn instantly. Bonus funds may need wagering.
          </div>
        </div>
      </section>

      <section className="finance-v2-history">
        <div className="finance-v2-history-head">
          <div>
            <h2>Withdrawal History</h2>
            <p>Recent payout request logs</p>
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
          {withdrawRecords
            .filter((r) => historyFilter === "All" || (r.w_status || "").toLowerCase() === historyFilter.toLowerCase())
            .slice(0, 6)
            .map((r, i) => (
              <div className="finance-v2-record" key={i}>
                <div>
                  <strong>{"\u20b9"}{parseFloat(r.w_amount || 0).toLocaleString("en-IN")}</strong>
                  <span>{r.w_date} {r.w_time}</span>
                </div>
                <div>
                  <em>{r.w_status}</em>
                  <small>#{String(r.w_uniq_id || "--------").substring(0, 8).toUpperCase()}</small>
                </div>
              </div>
            ))}

          {withdrawRecords.length === 0 && !loadingHistory && (
            <div className="finance-v2-empty"><FontAwesomeIcon icon={faSearch} /> No withdrawals recorded</div>
          )}
          {loadingHistory && (
            <div className="finance-v2-empty"><FontAwesomeIcon icon={faClock} /> Loading withdrawal history...</div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showAddBankPopup && (
          <div className="finance-v2-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              className="finance-v2-popup"
            >
              <button type="button" className="finance-v2-popup-close" onClick={() => setShowAddBankPopup(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <div className="finance-v2-popup-head">
                <FontAwesomeIcon icon={faUniversity} />
                <div>
                  <h3>Link Bank Account</h3>
                  <p>Use details exactly as shown in your bank records.</p>
                </div>
              </div>

              <div className="finance-v2-form-grid">
                <label>
                  <span>Account Holder Name</span>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <input name="realName" value={formData.realName} onChange={handleInputChange} placeholder="Name as per bank" />
                </label>
                <label>
                  <span>Account Number</span>
                  <FontAwesomeIcon icon={faCreditCard} />
                  <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="Full account number" />
                </label>
                <div className="finance-v2-bank-select">
                  <span>Select Bank</span>
                  <button type="button" onClick={() => setShowBankDropdown(!showBankDropdown)}>
                    {formData.selectedBank || "Choose bank"} <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                  {showBankDropdown && (
                    <div className="finance-v2-bank-menu">
                      <div>
                        <FontAwesomeIcon icon={faSearch} />
                        <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Search bank" autoFocus />
                      </div>
                      <section>
                        {availableBanks
                          .filter((bankItem) => bankItem.bankName.toLowerCase().includes(bankSearch.toLowerCase()))
                          .map((bankItem) => (
                            <button
                              key={bankItem.bankName}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, selectedBank: bankItem.bankName }))
                                setShowBankDropdown(false)
                              }}
                            >
                              {bankItem.bankName}
                            </button>
                          ))}
                      </section>
                    </div>
                  )}
                </div>
                <label>
                  <span>IFSC Code</span>
                  <FontAwesomeIcon icon={faUniversity} />
                  <input name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} placeholder="SBIN0001234" />
                </label>
              </div>

              <button type="button" className="finance-v2-primary" onClick={addBankDetails}>Confirm & Link</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmSelection.isOpen && confirmSelection.account && (
          <div className="finance-v2-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="finance-v2-popup compact"
            >
              <div className="finance-v2-popup-head centered">
                <FontAwesomeIcon icon={faUniversity} />
                <div>
                  <h3>Set Active Account?</h3>
                  <p>{confirmSelection.account.c_bank_name}</p>
                </div>
              </div>

              <div className="finance-v2-confirm-lines">
                <div><span>Holder</span><strong>{confirmSelection.account.c_beneficiary}</strong></div>
                <div><span>IFSC</span><strong>{confirmSelection.account.c_bank_ifsc_code}</strong></div>
                <div>
                  <span>Account</span>
                  <strong>
                    {showFullAcct
                      ? confirmSelection.account.c_bank_account
                      : `${confirmSelection.account.c_bank_account.slice(0, 4)} **** ${confirmSelection.account.c_bank_account.slice(-4)}`}
                    <button type="button" onClick={() => setShowFullAcct(!showFullAcct)}>
                      <FontAwesomeIcon icon={showFullAcct ? faEyeSlash : faEye} />
                    </button>
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="finance-v2-primary"
                onClick={() => {
                  setSelectedAccount(confirmSelection.account.c_bank_id)
                  addToast(`${confirmSelection.account.c_bank_name} selected`, "success")
                  setConfirmSelection({ isOpen: false, account: null })
                }}
              >
                Set Active Account
              </button>
              <button type="button" className="finance-v2-secondary" onClick={() => setConfirmSelection({ isOpen: false, account: null })}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Withdraw

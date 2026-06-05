"use client"

import React, { useEffect, useState } from "react"
import { FaCheckCircle, FaClipboard, FaClock, FaExchangeAlt, FaExclamationTriangle, FaInfoCircle, FaSearch, FaWallet } from "react-icons/fa"
import { FONTS } from "../../../constants/theme"
import { API_URL } from "../../../utils/constants"

const TransactionPage = () => {
  const [activeTab, setActiveTab] = useState("Deposit")
  const [filter, setFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [depositRecords, setDepositRecords] = useState([])
  const [withdrawRecords, setWithdrawRecords] = useState([])
  const [toast, setToast] = useState(null)
  const authSecretKey = localStorage.getItem("auth_secret_key")
  const userId = localStorage.getItem("account_id")

  const safeFloat = (value) => {
    const number = parseFloat(value)
    return Number.isNaN(number) ? 0 : number
  }

  const parseDateTime = (date, time) => {
    const value = `${date || ""} ${time || ""}`.trim()
    if (!value) return new Date(0)
    try {
      const parts = value.split(" ")
      if (parts.length < 2) return new Date(value)
      const [datePart, timePart, ampm] = parts
      const [day, month, year] = datePart.split("-")
      let [hours, minutes] = timePart.split(":")
      hours = parseInt(hours, 10)
      if (ampm && ampm.toLowerCase() === "pm" && hours < 12) hours += 12
      if (ampm && ampm.toLowerCase() === "am" && hours === 12) hours = 0
      return new Date(year, month - 1, day, hours, minutes)
    } catch (error) {
      return new Date(value)
    }
  }

  useEffect(() => {
    fetchDepositRecords()
    fetchWithdrawRecords()
  }, [])

  const fetchWithdrawRecords = async () => {
    if (!authSecretKey) return
    try {
      const response = await fetch(`${API_URL}?USER_ID=${userId}&PAGE_NUM=1`, {
        method: "GET",
        headers: { Route: "route-withdraw-records", AuthToken: authSecretKey },
      })
      const result = await response.json()
      setWithdrawRecords(result.data || [])
    } catch (error) {
      console.error("Fetch error", error)
    }
  }

  const fetchDepositRecords = async () => {
    if (!authSecretKey) return
    try {
      const response = await fetch(`${API_URL}?USER_ID=${userId}&PAGE_NUM=1`, {
        method: "GET",
        headers: { Route: "route-recharge-records", AuthToken: authSecretKey },
      })
      const result = await response.json()
      setDepositRecords(result.data || [])
    } catch (error) {
      console.error("Fetch error", error)
    }
  }

  const mergeTransactions = (deposits, withdrawals) => [
    ...deposits.map((record) => ({
      id: record.r_uniq_id,
      amount: record.r_amount,
      category: "Deposit",
      date: record.r_date,
      time: record.r_time,
      method: record.r_mode || "Deposit",
      details: record.r_details || "Wallet recharge",
      orderNumber: record.r_uniq_id,
      remark: record.r_remark,
      status: record.r_status || "Processing",
    })),
    ...withdrawals.map((record) => ({
      id: record.w_uniq_id,
      amount: record.w_amount,
      category: "Withdrawal",
      date: record.w_date,
      time: record.w_time,
      method: "Withdraw",
      details: record.w_remark || "Bank payout",
      orderNumber: record.w_uniq_id,
      remark: record.w_remark,
      status: record.w_status || "Processing",
    })),
  ]

  const transactionsData = mergeTransactions(depositRecords, withdrawRecords)
  const filteredTransactions = transactionsData
    .filter((transaction) => {
      const matchesTab = transaction.category === activeTab
      const matchesFilter = filter === "All" || (transaction.status || "").toLowerCase() === filter.toLowerCase()
      const searchText = `${transaction.orderNumber || ""} ${transaction.method || ""} ${transaction.details || ""} ${transaction.remark || ""}`.toLowerCase()
      return matchesTab && matchesFilter && searchText.includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time))

  const totals = transactionsData.reduce(
    (acc, transaction) => {
      const amount = safeFloat(transaction.amount)
      const status = (transaction.status || "").toLowerCase()
      if (transaction.category === "Deposit") acc.deposits += amount
      if (transaction.category === "Withdrawal") acc.withdrawals += amount
      if (status === "success") acc.success += 1
      else if (status === "processing" || status === "pending") acc.processing += 1
      else acc.rejected += 1
      return acc
    },
    { deposits: 0, withdrawals: 0, success: 0, processing: 0, rejected: 0 }
  )

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setToast({ message: "Transaction ID copied", type: "success" })
    setTimeout(() => setToast(null), 2500)
  }

  const getStatusClass = (status = "") => {
    const normalized = status.toLowerCase()
    if (normalized === "success") return "success"
    if (normalized === "processing" || normalized === "pending") return "processing"
    return "rejected"
  }

  const formatMoney = (value) =>
    safeFloat(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="wallet-statement-v2">
      {toast && (
        <div className="wallet-toast">
          <FaCheckCircle />
          <span>{toast.message}</span>
        </div>
      )}

      <section className="wallet-statement-hero">
        <div>
          <span className="wallet-statement-tag">Wallet Ledger</span>
          <h1 style={{ fontFamily: FONTS.head }}>Transaction History</h1>
          <p>Review every deposit and withdrawal request with status, amount, reference ID, and timing.</p>
        </div>
        <div className="wallet-statement-metrics">
          <div>
            <span>Total Deposits</span>
            <strong>{"\u20b9"}{formatMoney(totals.deposits)}</strong>
          </div>
          <div>
            <span>Total Withdrawals</span>
            <strong>{"\u20b9"}{formatMoney(totals.withdrawals)}</strong>
          </div>
          <div>
            <span>Successful</span>
            <strong>{totals.success}</strong>
          </div>
        </div>
      </section>

      <section className="wallet-statement-toolbar">
        <div className="wallet-statement-title">
          <span><FaWallet /></span>
          <div>
            <h2>Account Statement</h2>
            <p>{filteredTransactions.length} record{filteredTransactions.length === 1 ? "" : "s"} visible</p>
          </div>
        </div>

        <label className="wallet-statement-search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search ID, method or remark"
          />
        </label>
      </section>

      <section className="wallet-statement-controls">
        <div className="wallet-statement-tabs">
          {["Deposit", "Withdrawal"].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
              {tab}
            </button>
          ))}
        </div>
        <div className="wallet-statement-filters">
          {["All", "Success", "Processing", "Rejected"].map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={filter === item ? "active" : ""}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="wallet-status-strip">
        <div><strong>{totals.success}</strong><span>Success</span></div>
        <div><strong>{totals.processing}</strong><span>Processing</span></div>
        <div><strong>{totals.rejected}</strong><span>Rejected</span></div>
      </section>

      <section className="wallet-statement-card">
        {filteredTransactions.length > 0 ? (
          <>
            <div className="wallet-table-wrap">
              <table className="wallet-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const statusClass = getStatusClass(transaction.status)
                    return (
                      <tr key={transaction.id}>
                        <td>
                          <div className="wallet-reference">
                            <span>{String(transaction.orderNumber || "--").substring(0, 14)}...</span>
                            <button type="button" onClick={() => copyToClipboard(transaction.orderNumber)}>
                              <FaClipboard />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className={`wallet-type ${transaction.category.toLowerCase()}`}>
                            <span><FaExchangeAlt /></span>
                            <strong>{transaction.method}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="wallet-details">
                            <strong>{transaction.details || transaction.category}</strong>
                            {transaction.remark && <span>{transaction.remark}</span>}
                          </div>
                        </td>
                        <td className={transaction.category === "Deposit" ? "amount deposit" : "amount withdraw"}>
                          {transaction.category === "Deposit" ? "+" : "-"}{"\u20b9"}{formatMoney(transaction.amount)}
                        </td>
                        <td>
                          <em className={statusClass}>
                            {statusClass === "success" && <FaCheckCircle />}
                            {statusClass === "processing" && <FaClock />}
                            {statusClass === "rejected" && <FaExclamationTriangle />}
                            {transaction.status}
                          </em>
                        </td>
                        <td>
                          <div className="wallet-date">
                            <strong>{transaction.date || "--"}</strong>
                            <span>{transaction.time || ""}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="wallet-mobile-list">
              {filteredTransactions.map((transaction) => {
                const statusClass = getStatusClass(transaction.status)
                return (
                  <div className="wallet-mobile-card" key={transaction.id}>
                    <div className="wallet-mobile-top">
                      <div>
                        <span>#{String(transaction.orderNumber || "--").substring(0, 12)}</span>
                        <strong>{transaction.method}</strong>
                      </div>
                      <em className={statusClass}>{transaction.status}</em>
                    </div>
                    <p>{transaction.details || transaction.category}</p>
                    <div className="wallet-mobile-grid">
                      <div>
                        <span>Amount</span>
                        <strong className={transaction.category === "Deposit" ? "deposit" : "withdraw"}>
                          {transaction.category === "Deposit" ? "+" : "-"}{"\u20b9"}{formatMoney(transaction.amount)}
                        </strong>
                      </div>
                      <div>
                        <span>Date</span>
                        <strong>{transaction.date || "--"}</strong>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(transaction.orderNumber)}>
                        <FaClipboard /> Copy ID
                      </button>
                    </div>
                    {transaction.remark && (
                      <div className="wallet-mobile-note">
                        <FaInfoCircle /> {transaction.remark}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="wallet-empty-state">
            <FaSearch />
            <strong>No transaction records</strong>
            <span>Try another tab, filter, or search term.</span>
          </div>
        )}
      </section>

      <section className="wallet-statement-footnote">
        <FaInfoCircle />
        <span>Wallet records are updated in real time after gateway and admin verification.</span>
      </section>
    </div>
  )
}

export default TransactionPage

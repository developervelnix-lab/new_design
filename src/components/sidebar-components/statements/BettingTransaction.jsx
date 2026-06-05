"use client"

import { useState, useEffect } from "react"
import { FaChartLine, FaClock, FaFilter, FaHistory, FaSearch, FaTrophy } from "react-icons/fa"
import { API_URL } from "@/utils/constants"
import { FONTS } from "../../../constants/theme"
import RoundDetailsModal from "./RoundDetailsModal"

const BettingTransactionPage = () => {
  const [activeFilter, setActiveFilter] = useState("All")
  const [timeFilter, setTimeFilter] = useState("All")
  const [transactions, setTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTx, setSelectedTx] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const authSecretKey = localStorage.getItem("auth_secret_key")
  const userId = localStorage.getItem("account_id")

  const safeFloat = (val) => {
    const n = parseFloat(val)
    return Number.isNaN(n) ? 0 : n
  }

  const parseDateTime = (str) => {
    if (!str) return new Date(0)
    try {
      const parts = str.split(" ")
      if (parts.length < 2) return new Date(str)
      const [datePart, timePart, ampm] = parts
      const [day, month, year] = datePart.split("-")
      let [hours, minutes] = timePart.split(":")
      hours = parseInt(hours, 10)
      if (ampm && ampm.toLowerCase() === "pm" && hours < 12) hours += 12
      if (ampm && ampm.toLowerCase() === "am" && hours === 12) hours = 0
      return new Date(year, month - 1, day, hours, minutes)
    } catch (error) {
      return new Date(str)
    }
  }

  const fetchGameData = async (accountId, page = 1, limit = 25) => {
    setIsLoading(true)
    try {
      const url = `${API_URL}?USER_ID=${accountId}&PAGE_NUM=${page}&LIMIT=${limit}`
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Route: "route-mygame-records",
          AuthToken: authSecretKey,
        },
      })
      const result = await response.json()
      if (result.status_code === "success") {
        setTransactions(result.data || [])
        setHasMore((result.data || []).length === limit)
      } else {
        setTransactions([])
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching game data", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) fetchGameData(userId, currentPage, itemsPerPage)
  }, [userId, currentPage, itemsPerPage])

  const filteredTransactions = transactions.filter((transaction) => {
    const gameName = transaction.r_match_name || ""
    const selection = transaction.r_selection || ""
    const matchesSearch =
      gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      selection.toLowerCase().includes(searchTerm.toLowerCase())

    const status = (transaction.r_match_status || "").toLowerCase()
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Wins" && (status === "profit" || status === "win" || status === "cashout")) ||
      (activeFilter === "Losses" && status === "loss") ||
      (activeFilter === "Pending" && (status === "wait" || status === "pending"))

    let matchesTime = true
    if (timeFilter !== "All") {
      const txDate = parseDateTime(`${transaction.r_date} ${transaction.r_time || "00:00 AM"}`)
      const diffDays = (new Date() - txDate) / (1000 * 60 * 60 * 24)
      if (timeFilter === "Today") matchesTime = diffDays <= 1
      else if (timeFilter === "7Days") matchesTime = diffDays <= 7
      else if (timeFilter === "Month") matchesTime = diffDays <= 30
      else if (timeFilter === "Year") matchesTime = diffDays <= 365
    }

    return matchesSearch && matchesFilter && matchesTime
  })

  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      const status = (transaction.r_match_status || "").toLowerCase()
      const bet = safeFloat(transaction.r_match_bet ?? transaction.r_match_amount)
      const win = safeFloat(transaction.r_match_profit ?? transaction.r_match_amount)
      const net = safeFloat(transaction.r_match_net)
      acc.stake += bet
      acc.net += net
      if (status === "loss") acc.losses += 1
      else if (status === "profit" || status === "win" || status === "cashout") {
        acc.wins += 1
        acc.returns += win
      } else {
        acc.pending += 1
      }
      return acc
    },
    { stake: 0, returns: 0, net: 0, wins: 0, losses: 0, pending: 0 }
  )

  const openDetails = (transaction) => {
    setSelectedTx(transaction)
    setIsModalOpen(true)
  }

  const getStatusType = (statusValue = "") => {
    const status = statusValue.toLowerCase()
    if (status === "loss") return "loss"
    if (status === "profit" || status === "win" || status === "cashout") return "win"
    if (status === "wait" || status === "pending") return "pending"
    return "neutral"
  }

  const formatMoney = (value, minimumFractionDigits = 2) =>
    safeFloat(value).toLocaleString("en-IN", { minimumFractionDigits, maximumFractionDigits: 2 })

  return (
    <div className="statement-v2">
      <section className="statement-v2-top">
        <div>
          <span className="statement-v2-tag">Betting Statement</span>
          <h1 style={{ fontFamily: FONTS.head }}>Profit & Loss</h1>
          <p>Track every played round, bet value, payout status, and settlement result from one clean report.</p>
        </div>
        <div className="statement-v2-summary">
          <div>
            <span>Total Stake</span>
            <strong>{"\u20b9"}{formatMoney(totals.stake)}</strong>
          </div>
          <div>
            <span>Returns</span>
            <strong>{"\u20b9"}{formatMoney(totals.returns)}</strong>
          </div>
          <div className={totals.net < 0 ? "loss" : "win"}>
            <span>Net Result</span>
            <strong>{totals.net < 0 ? "-" : "+"}{"\u20b9"}{formatMoney(Math.abs(totals.net))}</strong>
          </div>
        </div>
      </section>

      <section className="statement-v2-toolbar">
        <div className="statement-v2-title">
          <span><FaChartLine /></span>
          <div>
            <h2>Recent Played Records</h2>
            <p>{filteredTransactions.length} record{filteredTransactions.length === 1 ? "" : "s"} found</p>
          </div>
        </div>

        <div className="statement-v2-controls">
          <label className="statement-v2-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search game or selection"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="statement-v2-select">
            <FaFilter />
            <select
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value)
                setCurrentPage(1)
              }}
            >
              {["All", "Wins", "Losses", "Pending"].map((filter) => (
                <option key={filter} value={filter}>{filter} Status</option>
              ))}
            </select>
          </label>

          <label className="statement-v2-select">
            <FaClock />
            <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
              <option value="All">Full History</option>
              <option value="Today">Today</option>
              <option value="7Days">7 Days</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
          </label>
        </div>
      </section>

      <section className="statement-v2-counts">
        <div><strong>{totals.wins}</strong><span>Wins</span></div>
        <div><strong>{totals.losses}</strong><span>Losses</span></div>
        <div><strong>{totals.pending}</strong><span>Pending</span></div>
      </section>

      <section className="statement-v2-table-card">
        {filteredTransactions.length > 0 ? (
          <>
            <div className="statement-v2-table-wrap">
              <table className="statement-v2-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Round ID</th>
                    <th>Game Details</th>
                    <th>Bet</th>
                    <th>Result</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => {
                    const statusType = getStatusType(transaction.r_match_status)
                    const isLoss = statusType === "loss"
                    const resultValue = isLoss
                      ? safeFloat(transaction.r_match_bet ?? transaction.r_match_amount)
                      : safeFloat(transaction.r_match_profit ?? transaction.r_match_amount)

                    return (
                      <tr key={`${transaction.r_round_id || "round"}-${index}`} onClick={() => openDetails(transaction)}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td><span className="mono">{transaction.r_round_id || "--"}</span></td>
                        <td>
                          <button type="button">
                            <strong>{transaction.r_match_name || "Game Round"}</strong>
                            <span>{transaction.r_selection || transaction.r_match_details || "Bet details"}</span>
                          </button>
                        </td>
                        <td>{"\u20b9"}{formatMoney(transaction.r_match_bet ?? transaction.r_match_amount)}</td>
                        <td>
                          <strong className={`amount ${statusType}`}>
                            {isLoss ? "-" : "+"}{"\u20b9"}{formatMoney(resultValue)}
                          </strong>
                          <span className="net">
                            Net {safeFloat(transaction.r_match_net) < 0 ? "-" : "+"}{"\u20b9"}{formatMoney(Math.abs(safeFloat(transaction.r_match_net)))}
                          </span>
                        </td>
                        <td><em className={statusType}>{transaction.r_match_status || "Pending"}</em></td>
                        <td>
                          <span>{transaction.r_date || "--"}</span>
                          <small>{transaction.r_time || ""}</small>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="statement-v2-mobile-list">
              {filteredTransactions.map((transaction, index) => {
                const statusType = getStatusType(transaction.r_match_status)
                const isLoss = statusType === "loss"
                const resultValue = isLoss
                  ? safeFloat(transaction.r_match_bet ?? transaction.r_match_amount)
                  : safeFloat(transaction.r_match_profit ?? transaction.r_match_amount)

                return (
                  <button
                    type="button"
                    className="statement-v2-mobile-card"
                    key={`${transaction.r_round_id || "mobile"}-${index}`}
                    onClick={() => openDetails(transaction)}
                  >
                    <div>
                      <strong>{transaction.r_match_name || "Game Round"}</strong>
                      <em className={statusType}>{transaction.r_match_status || "Pending"}</em>
                    </div>
                    <span>{transaction.r_selection || transaction.r_match_details || "Bet details"}</span>
                    <section>
                      <p><small>Bet</small>{"\u20b9"}{formatMoney(transaction.r_match_bet ?? transaction.r_match_amount, 0)}</p>
                      <p className={statusType}><small>Result</small>{isLoss ? "-" : "+"}{"\u20b9"}{formatMoney(resultValue, 0)}</p>
                      <p><small>Date</small>{transaction.r_date || "--"}</p>
                    </section>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="statement-v2-empty">
            {isLoading ? <FaClock /> : <FaSearch />}
            <strong>{isLoading ? "Loading records" : "No records found"}</strong>
            <span>Try a different status, time range, or search keyword.</span>
          </div>
        )}

        <div className="statement-v2-pagination">
          <div>
            <span>Rows</span>
            <select
              value={itemsPerPage}
              onChange={(event) => {
                setItemsPerPage(parseInt(event.target.value, 10))
                setCurrentPage(1)
              }}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <button type="button" disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage((prev) => prev - 1)}>
              Prev
            </button>
            <strong>Page {currentPage}</strong>
            <button type="button" disabled={!hasMore || isLoading} onClick={() => setCurrentPage((prev) => prev + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="statement-v2-footnote">
        <FaHistory />
        <span>Statement data is synchronized from live game records. Open any row for complete round details.</span>
        <FaTrophy />
      </section>

      <RoundDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTx}
      />
    </div>
  )
}

export default BettingTransactionPage

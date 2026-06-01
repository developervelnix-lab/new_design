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

import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa"
import { Toast } from "flowbite-react"
import { useNavigate } from "react-router-dom"
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { apiGet } from '@/utils/apiFetch';
import { useSite } from "../../context/SiteContext"

function Deposit() {
  const COLORS = useColors();
  const [amount, setAmount] = useState("")
  const [activeTab, setActiveTab] = useState("upi")
  const [copiedUPI, setCopiedUPI] = useState(false)
  const [selectedOption, setSelectedOption] = useState("upi1")
  const [upi, setUpi] = useState("")
  const [upi2, setUpi2] = useState("")
  const [bank, setBank] = useState([])
  const [utr, setUtr] = useState("")
  const [mode, setMode] = useState("")
  const navigate = useNavigate()
  const availableDepositOptions = localStorage.getItem("deposit_options") || "100,500,1000,2000,5000"
  const userId = localStorage.getItem("account_id")
  const [toasts, setToasts] = useState([])
  const [notification, setNotification] = useState({ isOpen: false, message: "", type: "" })
  const [depositRecords, setDepositRecords] = useState([])
  const [historyFilter, setHistoryFilter] = useState("All")
  const [loadingHistory, setLoadingHistory] = useState(false)

  const { accountInfo, logout } = useSite();

  const paymentOptions = [
    { id: "upi1", name: "UPI 1", type: "upi", logo: faQrcode },
    { id: "upi2", name: "UPI 2", type: "upi", logo: faQrcode },
    { id: "3", name: "BANK", type: "bank", logo: faCreditCard },
    { id: "casypay", name: "CASYPAY", type: "gateway2", logo: faCreditCard },
  ]

  const addToast = (message, type = "info") => {
    setNotification({ isOpen: true, message, type })
  }

  const [quickAmounts, setQuickAmounts] = useState(["100", "200", "500", "1000", "5000", "10000"])

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
        const response = await apiGet("route-deposit-info");
        const result = await response.json()
        setUpi(result.UPI.UPI_ID_1)
        setUpi2(result.UPI.UPI_ID_2)
        if (result.deposit_options) {
          setQuickAmounts(result.deposit_options.split(","))
        }
        setBank({
          ACCOUNT_HOLDER: result.BANK_DETAILS?.ACCOUNT_HOLDER || "VELPLAY365 TRADING",
          ACCOUNT_NUMBER: result.BANK_DETAILS?.ACCOUNT_NUMBER || "912020001234567",
          IFSC_CODE: result.BANK_DETAILS?.IFSC_CODE || "UTIB0001234",
          BANK_NAME: result.BANK_DETAILS?.BANK_NAME || "AXIS BANK"
        })
      } catch (error) {
        console.error("Error fetching Deposit Address", error)
        setBank({
          ACCOUNT_HOLDER: "VELPLAY365 TRADING",
          ACCOUNT_NUMBER: "912020001234567",
          IFSC_CODE: "UTIB0001234",
          BANK_NAME: "AXIS BANK"
        })
      }
    }
    if (userId) fetchDepositAddress()
  }, [userId])

  const fetchDepositRecords = async () => {
    if (!userId) return
    setLoadingHistory(true)
    try {
      const response = await apiGet("route-recharge-records", { PAGE_NUM: 1 });
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
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(`${label} copied!`, "success");
  };

  const handleCopyUPI = () => {
    const upiValue = selectedOption === "upi1" ? upi : upi2;
    if (!upiValue) return;
    navigator.clipboard.writeText(upiValue);
    setCopiedUPI(true);
    addToast("UPI ID copied!", "success");
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${selectedOption}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast("QR Code download started!", "success");
    } catch (error) {
      addToast("Failed to download QR Code", "error");
    }
  };

  const copyBankDetails = () => {
    const details = `Holder: ${bank.ACCOUNT_HOLDER || "--"}\nNumber: ${bank.ACCOUNT_NUMBER || "--"}\nIFSC: ${bank.IFSC_CODE || "--"}\nBank: ${bank.BANK_NAME || "--"}`;
    copyToClipboard(details, "Bank details");
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 100) { addToast("Min. ₹100 required", "error"); return; }
    if (mode === "CasyPay") {
      const paymentURL = "https://pay.ranamatch.com/gateapi/payments/gateways1/initialisation/casypay.php"
      window.location.href = `${paymentURL}?amount=${amount}&user_id=${userId}`
      return
    }
    if (!utr || utr.trim() === "") { addToast("Transaction UTR is required", "error"); return; }

    // Alphanumeric validation (Letters and Numbers only, 12-22 chars)
    const utrRegex = /^[a-zA-Z0-9]{12,22}$/;
    if (!utrRegex.test(utr)) {
      if (utr.length < 12 || utr.length > 22) {
        addToast("UTR must be between 12 and 22 characters", "error");
      } else {
        addToast("UTR must contain only letters and numbers", "error");
      }
      return;
    }

    try {
      const response = await apiGet("route-recharge-request", {
        RECHARGE_AMOUNT: amount,
        RECHARGE_MODE: mode,
        RECHARGE_DETAILS: `${utr},${mode}`
      });
      const result = await response.json()
      if (result.status_code === "pending") {
        addToast(`Deposit of ₹${amount} submitted!`, "success")
        setAmount("")
        setUtr("")
        fetchDepositRecords()
      }
      else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      }
      else addToast(`Error: ${result.status_code}`, "error")
    } catch (error) { addToast("Error submitting request", "error") }
  }


  const isLoggedIn = !!(accountInfo?.account_id);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="text-black dark:text-white w-[95%] md:w-[90%] mx-auto overflow-hidden rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-3xl relative mb-10"
      style={{ backgroundColor: COLORS.bg2, color: COLORS.text }}>

      {/* Subtle Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/30 blur-[60px]"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/30 blur-[60px]"></div>
      </div>

      {/* Header */}
      <div className="p-3.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between relative z-10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand shadow-lg">
            <FontAwesomeIcon icon={faWallet} className="text-black dark:text-white text-base" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: FONTS.head }}>
            Deposit <span className="text-brand">Funds</span>
          </h2>
        </div>
      </div>

      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {/* Keeping flowbite toasts for minor system alerts if any, but moving main ones to modal */}
      </div>

      {/* Notification Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-[2rem] p-8 w-full max-w-xs shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 blur-[40px] rounded-full"></div>
            <div className="flex flex-col items-center text-center gap-6 relative z-10">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                notification.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-brand/10 text-brand'
                }`}>
                <FontAwesomeIcon icon={notification.type === 'success' ? faCheck : faInfoCircle} className="text-3xl" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: FONTS.head }}>
                  {notification.type === 'success' ? 'Confirmed' : 'Update'}
                </h3>
                <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, isOpen: false })}
                className="w-full py-4 rounded-xl bg-brand text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-95 transition-all hover:shadow-brand/20"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-4 md:p-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">

          {/* Left Column: Methods & Details */}
          <div className="flex flex-col h-full space-y-4">
            {/* Step 1: Methods */}
            <div>
              <label className="text-[8px] text-black/40 dark:text-white/40 font-black uppercase tracking-widest mb-2.5 block">1. Payment Method</label>
              <div className="grid grid-cols-4 gap-1.5">
                {paymentOptions.map((opt) => (
                  <button key={opt.id} onClick={() => { setSelectedOption(opt.id); setActiveTab(opt.type); }}
                    className={`p-2 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1.5 relative ${selectedOption === opt.id ? "border-brand bg-brand/10 shadow-md" : "border-black/5 dark:border-white/5 bg-white/[0.03] hover:border-black/20 dark:border-white/20"
                      }`}
                    style={{ backgroundColor: selectedOption === opt.id ? "rgba(230,160,0,0.1)" : "rgba(255,255,255,0.03)" }}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedOption === opt.id ? "bg-brand text-black dark:text-white" : "bg-gray-100 dark:bg-white/5 text-black/30 dark:text-white/30"}`}>
                      <FontAwesomeIcon icon={opt.logo} className="text-[12px]" />
                    </div>
                    <span className="text-[7px] font-bold uppercase tracking-tight text-black/60 dark:text-white/60">{opt.name}</span>
                    {selectedOption === opt.id && <FontAwesomeIcon icon={faCheck} className="absolute top-1.5 right-1.5 text-brand text-[7px]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Content */}
            <div className="animate-fadeIn flex-1 flex flex-col">
              {activeTab === "upi" ? (
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border border-black/5 dark:border-white/5 flex-1" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <div className="flex justify-between items-center w-full px-1 mb-auto">
                      <span className="text-[7px] text-black/20 dark:text-white/20 font-black uppercase tracking-widest">ID: {selectedOption.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 border-b border-black/10 dark:border-white/10 pb-1.5 w-full">
                      <p className="text-black dark:text-white font-mono text-[13px] tracking-wider text-center">
                        {selectedOption === "upi1" ? upi || "FETCHING..." : upi2 || "FETCHING..."}
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedOption === "upi1" ? upi : upi2, "UPI ID")}
                        className="text-brand text-[10px] opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 my-auto">
                      <div className="bg-white p-2.5 rounded-xl">
                        <img src={qrCodeUrl || "/placeholder.svg"} alt="QR" className="w-24 h-24" />
                      </div>
                      <button
                        onClick={downloadQRCode}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[8px] font-bold uppercase tracking-wider text-brand"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        Download QR
                      </button>
                    </div>
                    <div className="mt-auto pt-2 opacity-20 hidden lg:block">
                      <p className="text-[6px] uppercase font-black tracking-widest">Scan with any UPI App</p>
                    </div>
                  </div>
                </div>
              ) : activeTab === "bank" ? (
                <div className="rounded-2xl p-3.5 space-y-2.5 border border-black/5 dark:border-white/5 flex-1 flex flex-col justify-center relative" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[7px] text-black/20 dark:text-white/20 font-black uppercase tracking-widest">Bank Details</span>
                    <button
                      onClick={copyBankDetails}
                      className="flex items-center gap-1 text-brand text-[8px] font-bold uppercase hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      Copy All
                    </button>
                  </div>
                  <div className="space-y-2.5 w-full">
                    {[{ l: "Holder", v: bank.ACCOUNT_HOLDER }, { l: "Number", v: bank.ACCOUNT_NUMBER, m: true }, { l: "IFSC", v: bank.IFSC_CODE, m: true }, { l: "Bank", v: bank.BANK_NAME }].map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/[0.05] pb-1.5 last:border-0 h-8">
                        <span className="text-[7px] text-black/30 dark:text-white/30 font-black uppercase text-nowrap">{i.l}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] text-black dark:text-white font-bold uppercase ${i.m ? 'font-mono text-brand' : ''}`}>{i.v || "--"}</span>
                          {i.v && i.v !== "--" && (
                            <button
                              onClick={() => copyToClipboard(i.v, i.l)}
                              className="text-brand/60 hover:text-brand transition-colors text-[9px] p-1"
                              title={`Copy ${i.l}`}
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-5 text-center border border-black/5 dark:border-white/5 flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                  <FontAwesomeIcon icon={faCreditCard} className="text-brand text-xl mb-2.5" />
                  <p className="text-black dark:text-white text-[10px] font-black uppercase">Instant Secure Gateway</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Amount entry & Submit */}
          <div className="space-y-5 lg:pt-8">

            {/* Step 3: Input */}
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-[8px] text-black/40 dark:text-white/40 font-black uppercase tracking-widest mb-2 block">2. Enter Amount</label>
                <div className="relative max-w-[160px] mx-auto">
                  <div className="absolute inset-y-0 left-3.5 flex items-center text-brand text-base"><FontAwesomeIcon icon={faIndianRupeeSign} /></div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full py-3 pl-9 pr-3 rounded-2xl border border-black/10 dark:border-white/10 text-xl font-black text-center focus:outline-none focus:border-brand/40 shadow-inner"
                    style={{ backgroundColor: COLORS.bg3, color: COLORS.text, fontFamily: FONTS.head }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-w-[280px] mx-auto">
                {quickAmounts.map((v) => (
                  <button key={v} onClick={() => handleQuickAmount(v)}
                    className={`py-1.5 rounded-lg border text-[8px] font-black transition-all ${amount === v.toString() ? "bg-brand border-brand text-black dark:text-white" : "border-black/5 dark:border-white/5 bg-white/[0.03] text-black/40 dark:text-white/40"}`}
                    style={{ backgroundColor: amount === v.toString() ? COLORS.brand : "rgba(255,255,255,0.03)" }}>
                    ₹{parseInt(v)}
                  </button>
                ))}
              </div>

              {activeTab !== "gateway" && activeTab !== "gateway2" && (
                <div className="max-w-[220px] mx-auto pt-1">
                  <label className="text-[8px] text-black/20 dark:text-white/20 font-black uppercase tracking-widest mb-1.5 block text-center">3. Transaction UTR</label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      setUtr(value);
                    }}
                    placeholder="12 DIGIT NUMBER"
                    autoComplete="off"
                    maxLength={22}
                    minLength={12}
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full py-2.5 px-3 rounded-xl border border-black/10 dark:border-white/10 text-center font-mono text-[13px] tracking-widest placeholder:text-black/5 dark:text-white/5 focus:outline-none focus:border-brand/30"
                    style={{ backgroundColor: COLORS.bg3, color: COLORS.brand }}
                  />
                </div>
              )}

              <button onClick={handleDeposit} disabled={!(amount && parseFloat(amount) > 0 && (activeTab.includes('gateway') || utr))}
                className={`w-full py-4 rounded-xl text-black dark:text-white font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-lg ${amount && parseFloat(amount) > 0 && (activeTab.includes('gateway') || utr) ? "opacity-100" : "opacity-20 pointer-events-none"
                  }`}
                style={{ background: COLORS.brandGradient }}>
                <FontAwesomeIcon icon={faWallet} className="text-[12px]" />
                <span>Continue</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="pb-6 text-center opacity-10">
        <p className="text-[7px] uppercase font-black tracking-[1em]">Authorized Infrastructure</p>
      </div>

      {/* History Section */}
      <div className="p-4 md:p-6 border-t border-black/5 dark:border-white/5 bg-black/10 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-brand text-xs" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Deposit History</h3>
          </div>
          <div className="flex gap-1">
            {["All", "Success", "Processing", "Rejected"].map((f) => (
              <button key={f} onClick={() => setHistoryFilter(f)}
                className={`px-2 py-1 rounded-md text-[7px] font-black uppercase transition-all ${historyFilter === f ? "bg-brand text-black" : "bg-white/5 text-black/40 dark:text-white/40 hover:bg-white/10"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {depositRecords
            .filter(r => historyFilter === "All" || r.r_status.toLowerCase() === historyFilter.toLowerCase())
            .slice(0, 5) // Show top 5
            .map((r, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-black dark:text-white">₹{r.r_amount}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase ${r.r_status.toLowerCase() === 'success' ? 'bg-green-500/10 text-green-500' :
                      r.r_status.toLowerCase() === 'processing' || r.r_status.toLowerCase() === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                      {r.r_status}
                    </span>
                  </div>
                  <span className="text-[7px] text-black/30 dark:text-white/30 font-bold uppercase tracking-tight">{r.r_date} • {r.r_mode}</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] text-brand font-mono block">#{r.r_uniq_id.substring(0, 8)}</span>
                  <span className="text-[6px] text-black/20 dark:text-white/20 uppercase font-black">{r.r_time}</span>
                  {r.r_remark && (
                    <div className="mt-1 flex items-center justify-end gap-1 text-[7px] font-bold text-blue-400/60 uppercase">
                      <faInfoCircle size={6} />
                      {r.r_remark}
                    </div>
                  )}
                </div>
              </div>
            ))}
          {depositRecords.length === 0 && !loadingHistory && (
            <div className="py-8 text-center opacity-20">
              <FontAwesomeIcon icon={faSearch} className="mb-2 text-xs" />
              <p className="text-[8px] font-black uppercase tracking-widest">No history found</p>
            </div>
          )}
          {loadingHistory && (
            <div className="py-8 text-center opacity-20">
              <FontAwesomeIcon icon={faClock} className="animate-spin mb-2 text-xs" />
              <p className="text-[8px] font-black uppercase tracking-widest">Loading history...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Deposit

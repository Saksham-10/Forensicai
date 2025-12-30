import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  HomeIcon,
  ChipIcon,
  LightningBoltIcon,
  ClockIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  SearchIcon,
  ChartBarIcon,
  DocumentReportIcon,
  ExclamationCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SunIcon,
  MoonIcon,
  XIcon, 
  AdjustmentsIcon,
  SparklesIcon,
  ArrowsExpandIcon // NEW ICON
} from '@heroicons/react/solid';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- HELPER: DETECT CURRENCY ---
const getCurrency = (ticker) => {
    if (!ticker) return '₹';
    return ticker.toUpperCase().includes('.NS') || ticker.toUpperCase().includes('.BO') ? '₹' : '$';
};

// --- DATA: MASTER STOCK LIST ---
const POPULAR_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises" },
  { symbol: "ZOMATO.NS", name: "Zomato Ltd" },
  { symbol: "PAYTM.NS", name: "One 97 Communications" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp" },
  { symbol: "GOOGL", name: "Alphabet (Google)" },
  { symbol: "AMZN", name: "Amazon.com" },
  { symbol: "NVDA", name: "NVIDIA Corp" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "BTC-USD", name: "Bitcoin USD" },
];

// --- COMPONENT: DEEP SCAN EXPLANATION MODAL (NEW) ---
const DeepScanModal = ({ show, onClose, onConfirm, darkMode }) => {
    if (!show) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg p-6 rounded-xl shadow-2xl border ${darkMode ? 'bg-[#18181b] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-bold text-xl flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <SearchIcon className="h-6 w-6 mr-2 text-purple-500" />
                        Deep Scan Protocol
                    </h3>
                    <XIcon onClick={onClose} className="h-6 w-6 text-gray-500 cursor-pointer hover:text-red-500" />
                </div>
                
                <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-purple-900/20 text-gray-300' : 'bg-purple-50 text-gray-700'}`}>
                    <p className="mb-3 font-semibold">You are about to initiate a Level-2 Historical Forensic Analysis.</p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Fetches <strong>2 Years</strong> of daily OHLCV data.</li>
                        <li>Switches detection algorithm to find long-term <strong>Pump & Dump</strong> schemes.</li>
                        <li>Uses a stricter anomaly threshold (only flags major deviations).</li>
                    </ul>
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-purple-500/20"
                    >
                        Initialize Deep Scan
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: EXPANDED CHART MODAL (NEW) ---
const ExpandedChartModal = ({ show, onClose, chartData, darkMode, mode }) => {
    if (!show || !chartData) return null;

    const hasData = chartData.prices.length > 0;
    let labels = hasData ? chartData.timestamps : [];
    // If Deep Scan, reduce labels for performance/cleanliness
    if (mode === 'Deep Scan' && labels.length > 30) {
        labels = labels.map((date, index) => index % 15 === 0 ? date : '');
    }

    const data = {
        labels: labels,
        datasets: [{
            label: 'Price Action',
            data: chartData.prices,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: mode === 'Deep Scan' ? 0 : 4,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: darkMode ? '#333' : '#e5e7eb' }, ticks: { color: darkMode ? '#999' : '#666', maxTicksLimit: 12, font: { size: 14 } } },
            y: { grid: { color: darkMode ? '#333' : '#e5e7eb' }, ticks: { color: darkMode ? '#999' : '#666', font: { size: 14 } } }
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-8">
            <div className={`w-full h-full p-6 rounded-xl border flex flex-col ${darkMode ? 'bg-[#0f0f13] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className={`font-bold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{chartData.ticker} - Detailed View</h2>
                        <p className="text-gray-500">{mode === 'Deep Scan' ? '2-Year Historical Analysis' : 'Intraday Live Monitor'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <XIcon className="h-8 w-8 text-gray-400 hover:text-white" />
                    </button>
                </div>
                <div className="flex-1 w-full">
                    <Line data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: EXPLANATION MODAL ---
const ExplanationModal = ({ show, onClose, explanation, loading, darkMode }) => {
    if (!show) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl p-6 rounded-xl shadow-2xl border ${darkMode ? 'bg-[#18181b] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`font-bold text-lg flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <SparklesIcon className="h-6 w-6 mr-2 text-pink-500 animate-pulse" />
                        AI Forensic Analyst
                    </h3>
                    <XIcon onClick={onClose} className="h-6 w-6 text-gray-500 cursor-pointer hover:text-red-500" />
                </div>
                <div className={`p-6 rounded-lg min-h-[200px] leading-relaxed whitespace-pre-line ${darkMode ? 'bg-black/30 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-mono animate-pulse">Analyzing Market Patterns...</span>
                        </div>
                    ) : ( explanation || "No explanation available." )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm transition-all">Close Report</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: SETTINGS MODAL ---
const SettingsModal = ({ show, onClose, sensitivity, setSensitivity, darkMode, onApply }) => {
    if (!show) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className={`w-80 p-6 rounded-xl shadow-2xl border ${darkMode ? 'bg-[#18181b] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <AdjustmentsIcon className="h-5 w-5 mr-2 text-cyan-500" />
                        Model Parameters
                    </h3>
                    <XIcon onClick={onClose} className="h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500 transition-colors" />
                </div>
                <div className="mb-8">
                    <div className="flex justify-between mb-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sensitivity Threshold</label>
                        <span className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">{sensitivity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={sensitivity} onChange={(e) => setSensitivity(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400" />
                    <div className="flex justify-between mt-3 text-[10px] text-gray-500 font-mono"><span>LOOSE (Safe)</span><span>STRICT (Risky)</span></div>
                </div>
                <div className="space-y-3">
                    <div className={`p-3 rounded-lg text-xs border ${darkMode ? 'bg-black/30 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                        <p className="font-bold mb-1">Current Config:</p>
                        <p>Contamination: {(0.01 + (sensitivity/100)*0.19).toFixed(3)}</p>
                        <p>Model: Isolation Forest (v2.1)</p>
                    </div>
                    <button onClick={() => { onApply(); onClose(); }} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-cyan-500/20">Apply Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ darkMode }) => (
  <div className={`${darkMode ? 'bg-[#0f0f13] border-gray-800' : 'bg-white border-gray-200'} w-64 flex flex-col h-screen border-r transition-colors duration-300`}>
    <div className="p-6 flex items-center space-x-3">
      <div className="h-8 w-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-md shadow-lg"></div>
      <span className={`text-xl font-bold tracking-wide ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Forensic<span className="text-cyan-500">.AI</span>
      </span>
    </div>
    <nav className="flex-1 px-4 space-y-3 mt-4">
      <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Surveillance</p>
      <a href="#" className={`flex items-center px-4 py-3 border-l-2 rounded-r-md transition-all ${darkMode ? 'bg-gray-800/50 text-cyan-400 border-cyan-400' : 'bg-blue-50 text-blue-600 border-blue-600'}`}>
        <HomeIcon className="h-5 w-5 mr-3" /> Live Monitor
      </a>
      <a href="#" className={`flex items-center px-4 py-3 rounded-md transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
      </a>
    </nav>
    <div className={`p-4 border-t flex items-center ${darkMode ? 'border-gray-800 bg-[#0a0a0c]' : 'border-gray-200 bg-gray-50'}`}>
       <div className="ml-3"><p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin User</p><p className="text-xs text-gray-500">Analyst Lvl 2</p></div>
    </div>
  </div>
);

// --- COMPONENT: HEADER ---
const Header = ({ searchTicker, setSearchTicker, handleSearch, loading, darkMode, toggleTheme }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchTicker.length > 0) {
      const filtered = POPULAR_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTicker.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTicker.toLowerCase())
      );
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [searchTicker]);

  return (
    <div className={`flex justify-between items-center px-8 py-5 border-b transition-colors duration-300 ${darkMode ? 'bg-[#0f0f13] border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="relative w-96">
        <div className={`flex items-center rounded-lg px-4 py-2 border transition-colors ${darkMode ? 'bg-[#18181b] border-gray-700 focus-within:border-cyan-500' : 'bg-gray-100 border-gray-300 focus-within:border-blue-500'}`}>
          <SearchIcon className="h-5 w-5 text-gray-500" />
          <input type="text" value={searchTicker} onChange={(e) => setSearchTicker(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setShowDropdown(false); handleSearch(searchTicker); }}} onFocus={() => searchTicker.length > 0 && setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} placeholder="Search Ticker (e.g. RELIANCE)..." className={`bg-transparent border-none focus:ring-0 ml-3 w-full font-mono text-sm ${darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-500'}`} />
          {loading && <span className="text-xs text-cyan-500 animate-pulse">SCANNING...</span>}
        </div>
        {showDropdown && (
          <div className={`absolute top-full left-0 w-full mt-2 rounded-lg shadow-xl border z-50 overflow-hidden max-h-60 overflow-y-auto ${darkMode ? 'bg-[#18181b] border-gray-700' : 'bg-white border-gray-200'}`}>
            {suggestions.map((stock) => (
              <div key={stock.symbol} onClick={() => { setSearchTicker(stock.symbol); setShowDropdown(false); handleSearch(stock.symbol); }} className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-blue-50 text-gray-800'}`}>
                <span className="font-bold font-mono text-sm">{stock.symbol}</span>
                <span className="text-xs text-gray-500 truncate ml-2">{stock.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-end mr-4"><span className="text-xs text-green-500 font-mono flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>ONLINE</span></div>
        <button onClick={toggleTheme} className={`p-2 rounded-full transition-all ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: STAT CARD ---
const StatCard = ({ title, value, subValue, trend, isPositive, icon: Icon, colorClass, darkMode }) => (
  <div className={`p-5 rounded-xl border shadow-lg transition-all group ${darkMode ? 'bg-[#18181b] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
    <div className="flex justify-between items-start mb-2">
      <div><h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3><p className={`text-2xl font-bold mt-1 font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p></div>
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}><Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} /></div>
    </div>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-gray-400 font-mono">{subValue}</span>
      <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{isPositive ? <TrendingUpIcon className="h-3 w-3 mr-1" /> : <TrendingDownIcon className="h-3 w-3 mr-1" />}{trend}</div>
    </div>
  </div>
);

// --- COMPONENT: CHART AREA (UPDATED WITH EXPAND BUTTON) ---
const ForensicChartArea = ({ chartData, darkMode, mode, onExpand }) => {
    const hasData = chartData && chartData.prices.length > 0;
    let labels = [];
    if (hasData) {
        labels = chartData.timestamps;
        if (mode === 'Deep Scan' && labels.length > 30) {
            labels = labels.map((date, index) => index % 30 === 0 ? date : '');
        }
    } else {
        labels = ['10:00', '10:30', '11:00'];
    }

    const data = {
        labels: labels,
        datasets: [{
            label: 'Price Action',
            data: hasData ? chartData.prices : [0, 0, 0],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: mode === 'Deep Scan' ? 0 : 3,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: darkMode ? '#333' : '#e5e7eb' }, ticks: { color: darkMode ? '#666' : '#9ca3af', maxTicksLimit: 8 } },
            y: { grid: { color: darkMode ? '#333' : '#e5e7eb' }, ticks: { color: darkMode ? '#666' : '#9ca3af' } }
        }
    };

    return (
        <div className={`p-6 rounded-xl border shadow-lg col-span-2 relative overflow-hidden transition-all ${darkMode ? 'bg-[#18181b] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-6 z-10 relative">
                <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {mode === 'Deep Scan' ? 'Historical Forensic Scan (2 Years)' : 'Intraday Anomaly Detection'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {mode === 'Deep Scan' ? 'Long-term manipulation patterns' : 'Live monitoring of price-volume divergence'}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {/* EXPAND BUTTON */}
                    <button 
                        onClick={onExpand}
                        className={`p-1.5 rounded border transition-colors cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-black'}`}
                        title="Expand Chart"
                    >
                        <ArrowsExpandIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => window.print()} className={`px-3 py-1 text-xs rounded border transition-colors cursor-pointer ${darkMode ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800 hover:bg-cyan-900/50' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>Export Evidence</button>
                </div>
            </div>
            <div className="h-64 w-full"><Line data={data} options={options} /></div>
        </div>
    );
};

// --- COMPONENT: RISK GAUGE ---
const RiskGaugeCard = ({ anomalyCount, darkMode }) => {
  const riskScore = Math.min(Math.round((anomalyCount / 370) * 100 * 5), 100); 
  return (
    <div className={`p-6 rounded-xl border shadow-lg flex flex-col justify-between transition-all ${darkMode ? 'bg-[#18181b] border-gray-800' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manipulation Risk</h3>
        <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />
      </div>
      <div className="relative w-40 h-20 mx-auto my-6 overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-full rounded-t-full border-[12px] ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-t-full border-[12px] border-red-500 border-b-0 border-r-0 origin-bottom transform transition-all duration-1000 ease-out" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)', transform: `rotate(${riskScore * 1.8 - 180}deg)` }}></div>
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{riskScore}%</div>
      </div>
      <div className="text-center text-xs text-red-500 font-bold uppercase tracking-widest mb-4">CRITICAL LEVEL</div>
      <div className="space-y-3 mt-auto">
        <div className="flex justify-between text-xs"><span className="text-gray-500">VWAP Divergence</span><span className="text-red-500 font-bold">High</span></div>
      </div>
    </div>
  );
};

// --- COMPONENT: QUICK ACTION ---
const QuickAction = ({ icon: Icon, title, desc, color, onClick, darkMode }) => (
    <div onClick={onClick} className={`p-4 rounded-xl border cursor-pointer transition-all group active:scale-95 ${darkMode ? 'bg-[#18181b] border-gray-800 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-blue-300 shadow-sm'}`}>
        <div className={`p-3 rounded-lg w-fit mb-3 bg-opacity-10 ${color}`}><Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} /></div>
        <h4 className={`font-bold text-sm ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-800 group-hover:text-black'}`}>{title}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-tight">{desc}</p>
    </div>
);

// --- MAIN APP ---
const App = () => {
  const [searchTicker, setSearchTicker] = useState("RELIANCE.NS");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [mode, setMode] = useState("Live");
  const [sensitivity, setSensitivity] = useState(50);
  
  // Modals State
  const [showSettings, setShowSettings] = useState(false);
  const [showDeepScanInfo, setShowDeepScanInfo] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showExpandedChart, setShowExpandedChart] = useState(false);

  // Explanation Data
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const handleSearch = async (tickerOverride) => {
    const ticker = tickerOverride || searchTicker;
    if (!ticker) return;
    setLoading(true);
    setMode("Live");
    try {
const API_BASE = "https://forensicai-backend.onrender.com";

const response = await axios.get(
  `${API_BASE}/analyze?ticker=${ticker}&sensitivity=${sensitivity}`
);
      setData(response.data);
    } catch (error) {
      console.error(error);
      alert("Backend Error");
    }
    setLoading(false);
  };

  // Triggered by QuickAction Button
  const handleDeepScanClick = () => {
    if (!searchTicker) return;
    setShowDeepScanInfo(true); // Open Info Modal instead of running directly
  };

  // Triggered by "Initialize" inside Modal
  const confirmDeepScan = async () => {
    setShowDeepScanInfo(false);
    setLoading(true);
    setMode("Deep Scan");
    try {
const API_BASE = "https://forensicai-backend.onrender.com";

const response = await axios.get(
  `${API_BASE}/analyze?ticker=${ticker}&sensitivity=${sensitivity}`
);
      setData(response.data);
    } catch (error) {
      alert("Deep Scan Error");
    }
    setLoading(false);
  };
  
  const handleExplanation = async () => {
      if (!data) return alert("Please search for a stock first!");
      setShowExplanation(true);
      setLoadingExplanation(true);
      setExplanation(""); 
      try {
const API_BASE = "https://forensicai-backend.onrender.com";

const response = await axios.get(
  `${API_BASE}/analyze?ticker=${ticker}&sensitivity=${sensitivity}`
);
          setExplanation(response.data.explanation);
      } catch (error) {
          setExplanation("AI Connection Failed. Please ensure Backend is running.");
      }
      setLoadingExplanation(false);
  };

  const toggleTheme = () => setDarkMode(!darkMode);
  const currency = data ? getCurrency(data.ticker) : '₹';

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#0B0B0F] text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
      <Sidebar darkMode={darkMode} />
      
      {/* MODALS LAYER */}
      <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} sensitivity={sensitivity} setSensitivity={setSensitivity} darkMode={darkMode} onApply={() => handleSearch(searchTicker)} />
      <ExplanationModal show={showExplanation} onClose={() => setShowExplanation(false)} explanation={explanation} loading={loadingExplanation} darkMode={darkMode} />
      
      {/* NEW MODALS */}
      <DeepScanModal show={showDeepScanInfo} onClose={() => setShowDeepScanInfo(false)} onConfirm={confirmDeepScan} darkMode={darkMode} />
      <ExpandedChartModal show={showExpandedChart} onClose={() => setShowExpandedChart(false)} chartData={data} darkMode={darkMode} mode={mode} />

      <div className="flex-1 flex flex-col relative">
        <Header searchTicker={searchTicker} setSearchTicker={setSearchTicker} handleSearch={handleSearch} loading={loading} darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="p-8 overflow-y-auto h-full scrollbar-hide">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <StatCard title="Last Traded Price" value={data ? `${currency}${data.prices[data.prices.length-1]}` : "—"} subValue={data ? data.ticker : "No Data"} trend={data ? (mode === "Live" ? "Live" : "Historical") : "Offline"} isPositive={true} icon={ChartBarIcon} colorClass="text-green-500" darkMode={darkMode} />
            <StatCard title="Total Anomalies" value={data ? data.anomaly_count : "0"} subValue={mode === "Live" ? "Last 5 Days" : "Last 2 Years"} trend={data && data.anomaly_count > 0 ? "Risk Detected" : "Stable"} isPositive={data && data.anomaly_count === 0} icon={ExclamationCircleIcon} colorClass="text-red-500" darkMode={darkMode} />
            <StatCard title="Data Points" value={data ? data.total_points : "0"} subValue={mode === "Live" ? "5m Candles" : "Daily Candles"} trend="Updated" isPositive={true} icon={LightningBoltIcon} colorClass="text-yellow-500" darkMode={darkMode} />
          </div>
          <div className="grid grid-cols-3 gap-6 mb-8 h-96">
            <ForensicChartArea 
                chartData={data} 
                darkMode={darkMode} 
                mode={mode} 
                onExpand={() => setShowExpandedChart(true)} // Pass expand handler
            />
            <RiskGaugeCard anomalyCount={data ? data.anomaly_count : 0} darkMode={darkMode} />
          </div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Forensic Toolkit</h3>
          <div className="grid grid-cols-4 gap-6">
              <QuickAction icon={DocumentReportIcon} title="Generate Report" desc="Download PDF evidence" color="text-blue-500" onClick={() => window.print()} darkMode={darkMode} />
              
              {/* UPDATED CLICK HANDLER FOR DEEP SCAN */}
              <QuickAction icon={SearchIcon} title="Deep Scan" desc="Run 2-Year Analysis" color="text-purple-500" onClick={handleDeepScanClick} darkMode={darkMode} />
              
              <QuickAction icon={ChipIcon} title="AI Explanation" desc="Analyze Patterns" color="text-pink-500" onClick={handleExplanation} darkMode={darkMode} />
              <QuickAction icon={CogIcon} title="Parameters" desc="Adjust threshold" color="text-gray-500" onClick={() => setShowSettings(true)} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
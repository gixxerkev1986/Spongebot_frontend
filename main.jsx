import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [coins, setCoins] = useState(["BTCUSDT"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Haal Binance pairs op bij component load
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
        const data = await res.json();
        const usdtPairs = data.symbols
          .filter((s) => s.quoteAsset === "USDT" && s.status === "TRADING")
          .map((s) => s.symbol);
        setCoins(usdtPairs.sort());
      } catch (err) {
        console.error("Fout bij ophalen van Binance pairs:", err);
      }
    };
    fetchPairs();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`https://spongebot-backend.onrender.com/analyse?symbol=${symbol.toUpperCase()}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Fout bij ophalen." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Spongebot Crypto Analyse</h1>
      <div className="mb-4">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="p-2 bg-gray-800 rounded w-full mb-2"
        >
          {coins.map((coin) => (
            <option key={coin} value={coin}>{coin}</option>
          ))}
        </select>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Of typ handmatig bijv. BTCUSDT"
          className="p-2 bg-gray-800 rounded w-full mb-2"
        />
        <button
          onClick={fetchAnalysis}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Analyseer
        </button>
      </div>
      {loading && <p>Analyseren...</p>}
      {result && result.frames && (
        <div className="space-y-4">
          {Object.entries(result.frames).map(([tf, data]) => (
            <div key={tf} className="p-4 bg-gray-800 rounded shadow">
              <h2 className="text-xl font-semibold mb-1">{tf}</h2>
              {data.error ? (
                <p>{data.error}</p>
              ) : (
                <>
                  <p>RSI: {data.rsi}</p>
                  <p>EMA9: {data.ema9}</p>
                  <p>EMA21: {data.ema21}</p>
                  <p>Crossover: {data.crossover}</p>
                  <p>Trendadvies: {data.trend}</p>
                  <p>Stop-loss: {data.stop_loss}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

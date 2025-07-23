import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function App() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [token, setToken] = useState("");
  const [users, setUsers] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [stockResult, setStockResult] = useState(null);
  const [bulkPrices, setBulkPrices] = useState({});
  const [source, setSource] = useState("alpha");
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioSymbols, setPortfolioSymbols] = useState("");
  const [portfolios, setPortfolios] = useState([]);

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.message || JSON.stringify(data));
    fetchUsers();
  };

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username, password: form.password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      alert("Login successful");
    } else {
      alert(data.error || "Login failed");
    }
  };

  const fetchProfile = async () => {
    const res = await fetch("http://localhost:5000/api/users/profile", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  };

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users/profiles");
    const data = await res.json();
    setUsers(data);
  };

  const fetchSingleStock = async () => {
    if (!symbol.trim()) return alert("Please enter a symbol");
    const res = await fetch(`http://localhost:5002/price/${symbol}?source=${source}`);
    const data = await res.json();
    setStockResult(data);
  };

  const fetchBulkStocks = async () => {
    const symList = "AAPL,RELIANCE.NS,ZOMATO.NS,INFY.NS";
    const res = await fetch(`http://localhost:5002/prices?symbols=${symList}&source=${source}`);
    const data = await res.json();
    setBulkPrices(data);
  };

  const fetchPortfolios = async () => {
    const res = await fetch("http://localhost:5003/portfolios/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPortfolios(data);
  };

  const createPortfolio = async () => {
    const res = await fetch("http://localhost:5003/portfolios/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: portfolioName, stocks: portfolioSymbols.split(",") })
    });
    await res.json();
    fetchPortfolios();
  };

  const deletePortfolio = async (id) => {
    await fetch(`http://localhost:5003/portfolios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPortfolios();
  };

  const getValue = async (id) => {
    const res = await fetch(`http://localhost:5003/portfolios/${id}/value`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    alert(`Total Value: ₹${data.total_value}`);
  };

  useEffect(() => {
    fetchUsers();
    if (token) fetchPortfolios();
  }, [token]);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">User Management & Portfolio UI</h1>

      {/* User Registration / Login */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={handleRegister}>Register</Button>
            <Button onClick={handleLogin}>Login</Button>
            <Button onClick={fetchProfile} disabled={!token}>Get My Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Service Integration */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-bold">📈 Stock Lookup</h2>
          <div className="flex gap-2 items-center">
            <Input placeholder="Enter symbol (e.g. AAPL, RELIANCE.NS)" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            <select value={source} onChange={(e) => setSource(e.target.value)} className="border p-2 rounded text-sm">
              <option value="alpha">Alpha Vantage</option>
              <option value="yahoo">Yahoo Finance</option>
            </select>
            <Button onClick={fetchSingleStock}>Search</Button>
          </div>
          {stockResult && (
            <Card className="mt-2">
              <CardContent>
                <div><strong>Symbol:</strong> {stockResult.symbol}</div>
                <div><strong>Price:</strong> ₹{stockResult.price ?? "N/A"}</div>
                <div className="text-xs text-gray-500">Source: {stockResult.source}</div>
              </CardContent>
            </Card>
          )}
          <Button onClick={fetchBulkStocks}>Load Popular Stocks</Button>
          {Object.keys(bulkPrices).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(bulkPrices).map(([sym, price]) => (
                <div key={sym} className="text-sm">
                  {sym}: ₹{price !== undefined && price !== null ? price : "Not found"}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Management */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-bold">📊 Portfolio Manager</h2>
          <Input placeholder="Portfolio Name" value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} />
          <Input placeholder="Comma separated symbols (e.g. AAPL,TSLA)" value={portfolioSymbols} onChange={(e) => setPortfolioSymbols(e.target.value)} />
          <Button onClick={createPortfolio}>Create Portfolio</Button>
          {portfolios.map((p) => (
            <div key={p.id} className="border p-2 rounded">
              <div><strong>{p.name}</strong></div>
              <div>Stocks: {p.stocks.join(", ")}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => getValue(p.id)}>Value</Button>
                <Button size="sm" variant="destructive" onClick={() => deletePortfolio(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

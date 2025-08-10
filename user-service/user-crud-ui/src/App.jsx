import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import PortfolioForm from "@/components/PortfolioForm";
import PortfolioList from "@/components/PortfolioList";
import './index.css';

function App() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [token, setToken] = useState("");
  const [users, setUsers] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [stockResult, setStockResult] = useState(null);
  const [bulkPrices, setBulkPrices] = useState({});
  const [source, setSource] = useState("alpha");

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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 bg-gradient-to-b from-green-100 to-white shadow-md rounded-xl min-h-screen">
      <Header isLoggedIn={!!token} onLogout={() => setToken("")} />

      <PortfolioForm token={token} onPortfolioCreated={() => {}} />

      <PortfolioList />

      {/* User Registration / Login */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-bold">User Access</h2>
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="bg-gradient-to-r from-green-50 via-yellow-100 to-red-200 text-center p-6 rounded-lg shadow">
            🌟 HoneyTrade UI Gradient Test
          </div>
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
    </div>
  );
}

export default App;

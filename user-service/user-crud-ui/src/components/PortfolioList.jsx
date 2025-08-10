import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);

  const fetchPortfolios = async () => {
    const res = await fetch("http://localhost:5003/portfolio/all");
    const data = await res.json();
    setPortfolios(data);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <div className="space-y-4">
      {portfolios.map((p) => (
        <Card key={p.id}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg text-blue-600">
              📁 {p.name}
            </h3>
            <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-700">
              {p.stocks.length === 0 ? (
                <li>No stocks in this portfolio.</li>
              ) : (
                p.stocks.map((s) => (
                  <li key={s.symbol}>
                    <strong>{s.symbol}</strong> &nbsp;| Alert:
                    {s.alert_above ? ` ↑ ${s.alert_above}` : " —"} /
                    {s.alert_below ? ` ↓ ${s.alert_below}` : " —"}
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default PortfolioList;

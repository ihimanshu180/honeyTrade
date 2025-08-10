import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function PortfolioForm({ token, onPortfolioCreated }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    const res = await fetch("http://localhost:5003/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token })
      },
      body: JSON.stringify({
        name,
        user_id: 1  // 🛠️ TODO: replace with actual logged-in user ID
      }),
    });
    const data = await res.json();
    alert(data.message || "Created portfolio");
    setName("");
    if (onPortfolioCreated) onPortfolioCreated();  // trigger refresh
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-2">
        <h2 className="font-semibold text-lg">Create Portfolio</h2>
        <Input
          placeholder="Portfolio Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={handleCreate}>Create</Button>
      </CardContent>
    </Card>
  );
}

export default PortfolioForm;

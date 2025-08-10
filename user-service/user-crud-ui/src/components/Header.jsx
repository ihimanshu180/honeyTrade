// src/components/Header.jsx
import React from 'react';
import { Button } from "@/components/ui/button";

const Header = ({ isLoggedIn, onLogout }) => {
  return (
    <header className="flex items-center justify-between bg-white shadow p-4 rounded-md">
      <div className="flex items-center gap-3">
        <img
          src="/assets/app_logo.webp"
          alt="HoneyTrade Logo"
          className="w-10 h-10 rounded-full"
        />
        <h1 className="text-2xl font-bold text-green-700">HoneyTrade</h1>
      </div>
      {isLoggedIn && (
        <Button variant="destructive" onClick={onLogout}>
          Logout
        </Button>
      )}
    </header>
  );
};

export default Header;

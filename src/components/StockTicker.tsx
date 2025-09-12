import { useState, useEffect } from "react";

const stockTickerData = [
  { symbol: "AAPL", price: 185.43, change: 2.87, isPositive: true },
  { symbol: "TSLA", price: 248.91, change: -5.12, isPositive: false },
  { symbol: "NVDA", price: 421.67, change: 8.24, isPositive: true },
  { symbol: "MSFT", price: 367.12, change: 1.45, isPositive: true },
  { symbol: "AMZN", price: 142.38, change: -1.92, isPositive: false },
  { symbol: "GOOGL", price: 138.21, change: 3.47, isPositive: true },
  { symbol: "META", price: 312.45, change: -2.18, isPositive: false },
  { symbol: "BTC-USD", price: 42891.23, change: 1247.56, isPositive: true },
  { symbol: "ETH-USD", price: 2534.67, change: -89.34, isPositive: false },
];

export const StockTicker = () => {
  return (
    <div className="bg-card border-b border-border/50 overflow-hidden py-3">
      <div className="flex gap-8 animate-scroll">
        {/* Duplicate the items for seamless scrolling */}
        {[...stockTickerData, ...stockTickerData].map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center gap-2 whitespace-nowrap min-w-fit">
            <span className="font-semibold text-primary">{stock.symbol}</span>
            <span className="text-foreground">${stock.price.toLocaleString()}</span>
            <span className={`text-sm ${stock.isPositive ? 'text-secondary' : 'text-destructive'}`}>
              {stock.isPositive ? '+' : ''}{stock.change.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
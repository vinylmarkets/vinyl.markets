export interface Briefing {
  id: string;
  title: string;
  date: string;
  category: string;
  readTime: number;
  confidenceScore: number;
  summary: string;
  academicContent: string;
  plainSpeakContent: string;
  methodology: string;
  rating?: number;
  feedback?: string;
  tags: string[];
}

export const mockBriefings: Briefing[] = [
  {
    id: "brief-001",
    title: "Quantum Computing Sector Momentum Analysis",
    date: "2024-03-15T10:30:00Z",
    category: "Technology Sector",
    readTime: 4,
    confidenceScore: 87,
    summary: "Analysis of quantum computing companies showing significant technical momentum with strong institutional accumulation patterns.",
    academicContent: `## Executive Summary

Our proprietary signal analysis indicates a statistically significant momentum shift in quantum computing equities, with a 87% confidence interval. The sector exhibits classic Wyckoff accumulation patterns, corroborated by elevated institutional volume signatures.

## Technical Analysis

The quantum computing sector (tracked via 12 primary equities) demonstrates:

- **Momentum Oscillators**: RSI divergence patterns suggesting oversold conditions reversing
- **Volume Analysis**: 34% above 20-day moving average, indicating institutional accumulation  
- **Price Action**: Breaking above key resistance levels with sustained volume
- **Market Microstructure**: Bid-ask spreads tightening, suggesting reduced uncertainty

## Fundamental Catalyst Assessment

Recent developments include IBM's 1000-qubit milestone and Google's quantum error correction breakthroughs. Patent filings in the sector increased 23% QoQ, with notable activity from established tech giants.

## Risk Factors

- Regulatory uncertainty in quantum export controls
- Technical implementation delays (estimated 18-24 month commercialization timeline)
- Market volatility correlation remains elevated at 0.73 with broader tech indices`,

    plainSpeakContent: `## What's Happening?

Quantum computing stocks are showing strong signs of moving higher. Think of it like this: smart money (big institutions) appears to be quietly buying up these stocks before the general public catches on.

## Why Should You Care?

Quantum computers are like regular computers on steroids - they can solve certain problems millions of times faster. Companies like IBM and Google just had major breakthroughs, and this is getting investors excited.

## The Numbers

- **Confidence Level**: 87 out of 100 (pretty strong signal)
- **Key Companies**: IBM, Google (Alphabet), IonQ, Rigetti
- **Recent Performance**: Up 12% in the last month while most tech stocks were flat

## What's Driving This?

1. **Big Tech Breakthroughs**: IBM just announced a 1000-qubit quantum computer (that's huge)
2. **Smart Money Moving**: Large investors are buying more than usual
3. **Patent Boom**: Companies filing 23% more quantum-related patents

## The Risks

- **Still Early**: Real quantum computers for everyday use are probably 2+ years away  
- **Volatile**: These stocks can swing wildly up and down
- **Regulatory Risk**: Government might restrict some quantum technology exports

## Bottom Line

The data suggests quantum computing stocks could see significant gains, but it's still a high-risk, high-reward play best suited for investors comfortable with volatility.`,

    methodology: "Analysis based on proprietary momentum signals, institutional flow data, patent filings analysis, and technical chart patterns. Confidence score derived from weighted ensemble of 12 quantitative factors.",
    tags: ["quantum-computing", "technology", "momentum", "institutional-flow"],
    rating: 4,
    feedback: "Very insightful analysis, helped me understand the sector dynamics"
  },
  {
    id: "brief-002", 
    title: "Federal Reserve Policy Impact on Financial Sector Rotation",
    date: "2024-03-14T14:15:00Z",
    category: "Economic Policy",
    readTime: 6,
    confidenceScore: 92,
    summary: "Analysis of Fed policy implications driving rotation from growth to value stocks, particularly benefiting regional banks and insurance companies.",
    academicContent: `## Monetary Policy Transmission Analysis

The Federal Reserve's latest FOMC minutes reveal a hawkish pivot with material implications for sector allocation. Our econometric models suggest a 92% probability of sustained financial sector outperformance over the subsequent 6-month period.

## Interest Rate Sensitivity Matrix

Financial sector performance exhibits negative duration characteristics, benefiting from:

- **Net Interest Margin Expansion**: Regional banks show 150bp sensitivity to 10-year yields
- **Discount Rate Mechanics**: Insurance companies benefit from higher reinvestment yields
- **Credit Loss Provisioning**: Normalization from historically elevated levels

## Quantitative Factor Decomposition

Our multi-factor model attributes expected financial sector alpha to:
- Rate sensitivity (40% of expected outperformance)
- Credit cycle normalization (25%)
- Regulatory tailwinds (20%) 
- Valuation mean reversion (15%)

## Regional Banking Subsector Analysis

KRE (Regional Banking ETF) technical indicators:
- P/E ratio: 11.2x vs. 10-year average of 13.4x
- Price-to-book: 1.1x vs. historical mean of 1.3x
- Dividend yield: 3.4% vs. 10-year Treasury at 4.2%

Risk-adjusted Sharpe ratios suggest material undervaluation relative to fundamental earnings power.`,

    plainSpeakContent: `## What Changed?

The Federal Reserve (America's central bank) is keeping interest rates higher for longer. This is actually great news for banks and insurance companies - here's why in simple terms.

## Banks Make More Money When Rates Are Higher

Think of banks as middlemen:
- They borrow money from you (your savings account) at low rates
- They lend it out (mortgages, business loans) at higher rates  
- The bigger the difference, the more profit they make

With rates staying high, that profit margin gets fatter.

## The Numbers

- **Confidence**: 92 out of 100 (very strong signal)
- **Timeline**: Next 6 months looking good for bank stocks
- **Key Beneficiaries**: Regional banks, insurance companies

## What This Means for Your Portfolio

**Winners:**
- Regional banks (like PNC, Fifth Third Bank)
- Insurance companies (like Progressive, Allstate)
- Credit card companies

**Why Now?**
- Bank stocks are trading cheap (P/E ratio of 11 vs usual 13)
- Many people avoided banks during the low-rate period
- Now the fundamentals are flipping in their favor

## The Simple Strategy

If you believe rates stay higher (which the Fed is signaling), then financial stocks should do well. Many are still priced like rates will drop quickly - creating an opportunity.

## Risks to Watch

- If the economy weakens, banks could face more loan defaults
- If rates drop faster than expected, the opportunity disappears`,

    methodology: "Fed policy analysis combined with sector rotation models, interest rate sensitivity calculations, and relative valuation metrics across 47 financial sector equities.",
    tags: ["federal-reserve", "financial-sector", "interest-rates", "policy-analysis"]
  },
  {
    id: "brief-003",
    title: "Cryptocurrency Market Structure Evolution",  
    date: "2024-03-13T09:45:00Z",
    category: "Digital Assets",
    readTime: 5,
    confidenceScore: 78,
    summary: "Institutional adoption metrics and regulatory clarity driving structural changes in cryptocurrency market dynamics and volatility patterns.",
    academicContent: `## Market Microstructure Analysis

The cryptocurrency ecosystem exhibits fundamental structural evolution, characterized by institutional participation metrics and regulatory framework clarity. Our confidence interval of 78% reflects the nascent nature of regulatory developments.

## Institutional Flow Indicators

On-chain analysis reveals:
- **Whale Accumulation**: Addresses holding >1000 BTC increased 2.3% monthly
- **Exchange Outflows**: Net negative flows of -$2.1B, suggesting long-term holding behavior
- **Derivatives Market**: Open interest in BTC futures up 45% QoQ, indicating sophisticated hedging

## Regulatory Environment Assessment 

Recent developments include:
- SEC Commissioner statements on Bitcoin ETF approval pathway
- European MiCA regulation implementation timeline clarification  
- Hong Kong retail trading authorization framework

## Volatility Regime Analysis

30-day realized volatility decreased to 35% (vs. historical mean of 67%), suggesting:
- Improved price discovery mechanisms
- Reduced speculative excess
- Institutional stabilization effects

## Cross-Asset Correlation Dynamics

Bitcoin's correlation with traditional assets:
- S&P 500: 0.23 (decreasing from 0.67 in 2022)
- Gold: 0.31 (increasing, suggesting store-of-value recognition)
- 10Y Treasury: -0.15 (developing negative correlation typical of risk assets)`,

    plainSpeakContent: `## Crypto Is Growing Up

The "Wild West" days of cryptocurrency are slowly ending. Big institutions, clear rules, and professional investors are making crypto behave more like a real investment market.

## What's Different Now?

**The Smart Money Is Moving In:**
- Big investment firms are buying Bitcoin in bulk
- Professional traders are using sophisticated strategies
- Companies are adding Bitcoin to their balance sheets

**Rules Are Getting Clearer:**
- The SEC (market regulator) is warming up to Bitcoin ETFs
- Europe just passed clear crypto laws
- Hong Kong is letting regular people trade crypto legally

## Why This Matters for Prices

**Good News:**
- Less crazy swings up and down (volatility dropped from 67% to 35%)
- Bitcoin is acting less like a "risk-on" tech stock
- More like digital gold - a place to store value

**The Trend:**
Bitcoin used to crash whenever stocks crashed. Now it's starting to move independently, which is what you'd expect from a mature asset class.

## What to Watch

**Positive Signals:**
- Big Bitcoin holders are buying more, not selling
- Money is flowing OUT of exchanges (people holding long-term)
- Professional derivatives market growing rapidly

**Reality Check:**
Still early days - crypto is volatile and regulatory changes could shift things quickly.

## Bottom Line

Crypto is evolving from a speculative playground to a legitimate asset class, but the transformation isn't complete yet.`,

    methodology: "On-chain data analysis, regulatory monitoring, institutional flow tracking, and cross-asset correlation studies across 15 major cryptocurrencies.",
    tags: ["cryptocurrency", "bitcoin", "institutional-adoption", "regulation"]
  }
];
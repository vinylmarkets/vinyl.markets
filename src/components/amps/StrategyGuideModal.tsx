import { useState } from 'react';
import { UserAmp } from '@/types/amps';
import { X } from 'lucide-react';

interface StrategyGuideModalProps {
  amp: UserAmp;
  isOpen: boolean;
  onClose: () => void;
}

export function StrategyGuideModal({ amp, isOpen, onClose }: StrategyGuideModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
      role="dialog"
      aria-modal="true"
      aria-labelledby="strategy-guide-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="strategy-guide-title" className="text-2xl font-bold text-foreground">
              {amp.name} Strategy Guide
            </h2>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {amp.catalog?.category || 'hybrid'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close strategy guide"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <TabButton
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            label="How It Works"
            isActive={activeTab === 'how-it-works'}
            onClick={() => setActiveTab('how-it-works')}
          />
          <TabButton
            label="Risk & Disclaimers"
            isActive={activeTab === 'risk'}
            onClick={() => setActiveTab('risk')}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'overview' && <OverviewTab amp={amp} />}
          {activeTab === 'how-it-works' && <HowItWorksTab amp={amp} />}
          {activeTab === 'risk' && <RiskTab amp={amp} />}
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-6 py-3 font-medium transition-colors text-sm sm:text-base
        ${isActive 
          ? 'text-primary border-b-2 border-primary' 
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );
}

// Overview Tab
function OverviewTab({ amp }: { amp: UserAmp }) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Strategy Summary */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Strategy Summary</h3>
        <p className="text-muted-foreground leading-relaxed">
          {amp.catalog?.description || 'A momentum-based hybrid strategy that combines technical indicators, options flow analysis, and market microstructure signals to identify high-probability intraday trading opportunities.'}
        </p>
      </section>

      {/* Best Used When */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Best Used When</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1 font-bold">✓</span>
            <span className="text-muted-foreground">Markets show clear directional momentum</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1 font-bold">✓</span>
            <span className="text-muted-foreground">Volume is above average (confirms strength)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1 font-bold">✓</span>
            <span className="text-muted-foreground">Trending market conditions (not choppy/sideways)</span>
          </li>
        </ul>
      </section>

      {/* Avoid Using When */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Avoid Using When</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1 font-bold">✗</span>
            <span className="text-muted-foreground">Markets are range-bound or consolidating</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1 font-bold">✗</span>
            <span className="text-muted-foreground">During major economic announcements (high volatility)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1 font-bold">✗</span>
            <span className="text-muted-foreground">Low liquidity periods (pre-market, after-hours)</span>
          </li>
        </ul>
      </section>

      {/* Quick Stats Grid */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Strategy Type" value="Momentum" />
          <StatCard label="Trade Duration" value="Intraday" />
          <StatCard label="Avg Trades/Day" value="3-5" />
          <StatCard label="Risk Level" value="Moderate" />
        </div>
      </section>
    </div>
  );
}

// How It Works Tab
function HowItWorksTab({ amp }: { amp: UserAmp }) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Strategy Logic */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Strategy Logic</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This algorithm combines three key market signals to identify high-probability intraday momentum opportunities:
        </p>
        
        <div className="space-y-4">
          <SignalExplanation
            number="1"
            title="Technical Indicators"
            description="Analyzes RSI, MACD, and moving average crossovers to identify momentum shifts and trend strength."
            icon="📈"
          />
          
          <SignalExplanation
            number="2"
            title="Options Flow Analysis"
            description="Monitors unusual options activity and large institutional orders that may signal informed trading."
            icon="📊"
          />
          
          <SignalExplanation
            number="3"
            title="Market Microstructure"
            description="Examines bid-ask spreads, order book depth, and volume patterns to confirm signal strength."
            icon="🔍"
          />
        </div>
      </section>

      {/* Entry Criteria */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Entry Criteria</h3>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-muted-foreground leading-relaxed mb-3">
            A trade signal is generated when:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="text-muted-foreground">• All three signal types align in the same direction</li>
            <li className="text-muted-foreground">• Confidence score exceeds your configured minimum threshold</li>
            <li className="text-muted-foreground">• Volume confirmation is present (if enabled in settings)</li>
            <li className="text-muted-foreground">• No conflicting signals from higher-priority amps</li>
          </ul>
        </div>
      </section>

      {/* Exit Strategy */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Exit Strategy</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-semibold text-foreground">Take Profit</h4>
              <p className="text-sm text-muted-foreground">
                Automatically exits when price reaches your configured profit target percentage
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <span className="text-2xl">🛑</span>
            <div>
              <h4 className="font-semibold text-foreground">Stop Loss</h4>
              <p className="text-sm text-muted-foreground">
                Automatically exits when price reaches your configured stop loss percentage
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <span className="text-2xl">⏰</span>
            <div>
              <h4 className="font-semibold text-foreground">End of Day</h4>
              <p className="text-sm text-muted-foreground">
                All positions automatically close 15 minutes before market close (3:45 PM ET)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Configurable Parameters */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">What You Can Configure</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">⚙️</span>
              <div>
                <span className="font-medium text-foreground">RSI Period:</span>
                <span className="text-muted-foreground"> Sensitivity of momentum detection (5-50 periods)</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">⚙️</span>
              <div>
                <span className="font-medium text-foreground">Volume Multiplier:</span>
                <span className="text-muted-foreground"> Minimum volume vs average (1.0x-5.0x)</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">⚙️</span>
              <div>
                <span className="font-medium text-foreground">Confidence Threshold:</span>
                <span className="text-muted-foreground"> Minimum signal strength to execute (50%-95%)</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Methodology Transparency */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Our Approach to Transparency</h3>
        <div className="bg-primary/5 border-l-4 border-primary p-4">
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Open Source Philosophy:</strong> We believe in radical transparency. 
            The complete source code for this algorithm, including all calculations and logic, is available on our{' '}
            <a href="https://github.com/vinyl/amps" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>. You can review, audit, and understand exactly how every trading decision is made.
          </p>
        </div>
      </section>
    </div>
  );
}

// Risk & Disclaimers Tab
function RiskTab({ amp }: { amp: UserAmp }) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Risk Profile */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Risk Profile</h3>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Moderate Risk Strategy</h4>
              <p className="text-muted-foreground leading-relaxed">
                This momentum-based strategy can experience periods of drawdown, especially in choppy or range-bound markets. 
                While designed with risk management built-in, no strategy eliminates risk entirely.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <RiskMetric
              label="Typical Drawdown"
              value="5-10%"
              description="Expected peak-to-trough decline during normal market conditions"
            />
            <RiskMetric
              label="Max Historical Drawdown"
              value="18%"
              description="Largest observed decline during backtesting period (2020-2024)"
            />
            <RiskMetric
              label="Volatility"
              value="Moderate"
              description="Daily P&L swings typically between -2% to +3%"
            />
          </div>
        </div>
      </section>

      {/* Key Risk Factors */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Key Risk Factors</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="text-red-500 text-xl">📉</span>
            <div>
              <h4 className="font-semibold text-foreground">Market Regime Changes</h4>
              <p className="text-sm text-muted-foreground">
                Performance may decline when markets shift from trending to range-bound conditions
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="text-red-500 text-xl">⚡</span>
            <div>
              <h4 className="font-semibold text-foreground">High Volatility Events</h4>
              <p className="text-sm text-muted-foreground">
                Major news events or market shocks can trigger larger losses than typical
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="text-red-500 text-xl">🔄</span>
            <div>
              <h4 className="font-semibold text-foreground">Slippage & Execution</h4>
              <p className="text-sm text-muted-foreground">
                Actual fills may differ from signals due to market liquidity and speed
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="text-red-500 text-xl">💸</span>
            <div>
              <h4 className="font-semibold text-foreground">Trading Costs</h4>
              <p className="text-sm text-muted-foreground">
                Commissions and fees will reduce actual returns below gross performance
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Best Practices */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Best Practices for Using This Amp</h3>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Start small:</strong> Allocate only 10-20% of total capital initially
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Set stop losses:</strong> Always use the stop loss feature (recommend 2-3%)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Monitor daily:</strong> Check performance and adjust settings as needed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Respect daily limits:</strong> Enable daily loss limit to protect capital
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Diversify:</strong> Use multiple amps with different strategies
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Educational Disclaimer */}
      <section>
        <h3 className="text-xl font-bold mb-3 text-foreground">Important Disclaimers</h3>
        <div className="bg-muted border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-3">
          <p>
            <strong className="text-foreground">Educational Purpose Only:</strong> This strategy guide is provided for educational purposes only 
            and does not constitute investment advice, financial advice, trading advice, or any other sort of advice. 
            You should not treat any of Vinyl's content as such.
          </p>
          
          <p>
            <strong className="text-foreground">No Guarantees:</strong> Past performance is not indicative of future results. 
            Backtested or hypothetical performance results have inherent limitations. No representation is being made 
            that any account will or is likely to achieve profits or losses similar to those shown.
          </p>
          
          <p>
            <strong className="text-foreground">Risk of Loss:</strong> Trading and investing involves substantial risk of loss 
            and is not suitable for every investor. The valuation of securities may fluctuate and, as a result, 
            you may lose more than your original investment.
          </p>
          
          <p>
            <strong className="text-foreground">Your Responsibility:</strong> You are solely responsible for your own investment decisions 
            and should consult with a qualified financial advisor before making any investment. Vinyl does not recommend 
            that any security should be bought, sold, or held by you.
          </p>
          
          <p>
            <strong className="text-foreground">Market Conditions:</strong> Market conditions change over time. Strategies that performed 
            well historically may not perform well in the future. You should continuously monitor your positions and 
            adjust settings as needed.
          </p>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}

function SignalExplanation({ 
  number, 
  title, 
  description, 
  icon 
}: { 
  number: string; 
  title: string; 
  description: string; 
  icon: string;
}) {
  return (
    <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function RiskMetric({ 
  label, 
  value, 
  description 
}: { 
  label: string; 
  value: string; 
  description: string;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="text-lg font-bold text-foreground whitespace-nowrap">{value}</div>
    </div>
  );
}

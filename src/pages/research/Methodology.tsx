import { Navigation } from "@/components/Navigation";

const Methodology = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Tubeamp: Transparent Probabilistic Analysis for Retail Trading
          </h1>
          <h2 className="text-xl md:text-2xl text-secondary font-medium mb-8">
            Building Market Intelligence Through Educational Transparency
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Traditional trading tools treat probability as a black box. We believe the opposite: <strong>understanding why a prediction was made is more valuable than the prediction itself.</strong>
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-4">
            Tubeamp transforms market analysis from mystical art to accessible science by making our methodology completely transparent, continuously validated, and inherently educational.
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="bg-card border border-border rounded-lg p-6 mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contents</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <a href="#core-methodology" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Our Core Methodology
            </a>
            <a href="#continuous-iteration" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Continuous Iteration Framework
            </a>
            <a href="#what-we-dont-do" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              What We Don't Do
            </a>
            <a href="#educational-philosophy" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Educational Empowerment Philosophy
            </a>
            <a href="#research-transparency" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Research Transparency
            </a>
            <a href="#academic-experience" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              The Academic User Experience
            </a>
            <a href="#research-community" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Join Our Research Community
            </a>
          </div>
        </nav>

        <hr className="border-border mb-12" />

        {/* Core Methodology Section */}
        <section id="core-methodology" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Our Core Methodology</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Bayesian Foundation with Educational Overlay</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our probability engine starts with a simple premise: <strong>every stock has a historical base rate of upward movement</strong>. This becomes our prior probability, which we then adjust based on current evidence.
              </p>

              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h4 className="text-xl font-semibold text-foreground mb-4">Base Rate Calculation:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Historical frequency analysis over rolling 252-day periods</li>
                  <li>• Segmented by market cap and sector for relevance</li>
                  <li>• Continuously updated as new data becomes available</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-xl font-semibold text-foreground mb-4">Evidence Integration:</h4>
                <p className="text-muted-foreground mb-4">We apply measured adjustments to base rates using five primary evidence categories:</p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-secondary pl-4">
                    <h5 className="font-semibold text-foreground">1. Technical Oversold/Overbought Conditions (±15% probability adjustment)</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• RSI-based momentum analysis</li>
                      <li>• Clear thresholds: &lt;30 (oversold), &gt;70 (overbought)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h5 className="font-semibold text-foreground">2. Volume Anomalies (+10% for unusual volume)</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Volume ratio vs. 20-day moving average</li>
                      <li>• Threshold: &gt;1.5x average indicates unusual interest</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h5 className="font-semibold text-foreground">3. Short-term Momentum (±12% adjustment)</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• 5-day price momentum analysis</li>
                      <li>• Captures recent directional bias</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h5 className="font-semibold text-foreground">4. Market Context (±8% adjustment)</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• S&P 500 correlation and direction</li>
                      <li>• Acknowledges systematic risk factors</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h5 className="font-semibold text-foreground">5. Earnings Proximity (-5% confidence penalty)</h5>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Increases uncertainty within 7 days of earnings</li>
                      <li>• Reflects fundamental unpredictability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Transparency by Design</h3>
              <p className="text-muted-foreground mb-4">Every prediction includes:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Complete reasoning chain</strong>: Why each factor contributed</li>
                <li>• <strong>Explicit limitations</strong>: What our model doesn&apos;t know</li>
                <li>• <strong>Confidence quantification</strong>: Based on evidence strength and data quality</li>
                <li>• <strong>Historical calibration</strong>: How often our X% predictions actually occur</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Continuous Iteration Framework */}
        <section id="academic-experience" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Continuous Iteration Framework</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">1. Real-Time Calibration Testing</h3>
              <p className="text-muted-foreground mb-4">We continuously validate prediction accuracy through:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Daily outcome tracking</strong>: Comparing predictions to actual results</li>
                <li>• <strong>Calibration analysis</strong>: Ensuring 70% predictions happen ~70% of the time</li>
                <li>• <strong>Evidence weight optimization</strong>: Adjusting factor weights based on predictive power</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">2. User Query Intelligence</h3>
              <p className="text-muted-foreground mb-4">Our &quot;Ask Tubeamp&quot; terminal captures user questions to:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Identify knowledge gaps in our methodology</li>
                <li>• Prioritize feature development based on actual user needs</li>
                <li>• Understand mental models of market analysis</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">3. Academic Collaboration</h3>
              <p className="text-muted-foreground mb-4">We commit to:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Open methodology documentation</strong>: All calculations and assumptions published</li>
                <li>• <strong>Peer review engagement</strong>: Submitting methodology to academic scrutiny</li>
                <li>• <strong>Data sharing</strong>: Anonymized prediction accuracy data available for research</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* What We Don't Do */}
        <section id="continuous-iteration" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">What We Don&apos;t Do</h2>
          
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">We Are Not a Black Box</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• No proprietary &quot;secret sauce&quot; algorithms</li>
                <li>• Every prediction factor is documented and explainable</li>
                <li>• All methodology changes are publicly announced</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">We Don&apos;t Promise Certainty</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All probabilities bounded between 20-80% (acknowledging market uncertainty)</li>
                <li>• Clear warnings about model limitations</li>
                <li>• Explicit disclaimers about unpredictable events</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">We Don&apos;t Encourage Gambling Behavior</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Educational framing over &quot;hot tips&quot;</li>
                <li>• Focus on process improvement over individual trades</li>
                <li>• Emphasis on risk management and position sizing</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Educational Empowerment Philosophy */}
        <section id="what-we-dont-do" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Educational Empowerment Philosophy</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Teaching Through Application</h3>
              <p className="text-muted-foreground mb-4">Each prediction becomes a mini-lesson in:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Statistical thinking and base rates</li>
                <li>• Market microstructure concepts</li>
                <li>• Correlation and systematic risk</li>
                <li>• Uncertainty quantification</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Building Analytical Intuition</h3>
              <p className="text-muted-foreground mb-4">Users develop understanding of:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• When technical indicators provide signal vs. noise</li>
                <li>• How market context affects individual stocks</li>
                <li>• Why volume patterns matter for price movement</li>
                <li>• How to calibrate confidence in predictions</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Democratizing Institutional Knowledge</h3>
            <p className="text-muted-foreground mb-4">We translate concepts typically reserved for quantitative hedge funds into accessible explanations:</p>
            <ul className="grid md:grid-cols-2 gap-2 text-muted-foreground">
              <li>• Options flow interpretation</li>
              <li>• Market regime classification</li>
              <li>• Volatility term structure analysis</li>
              <li>• Cross-asset correlation dynamics</li>
            </ul>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Research Transparency */}
        <section id="educational-philosophy" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Research Transparency</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Open Data Commitment</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Historical prediction accuracy published monthly</li>
                <li>• Methodology changes documented with rationale</li>
                <li>• Performance attribution analysis available</li>
                <li>• User query analytics (anonymized) shared publicly</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Academic Standards</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All statistical claims backed by peer-reviewable analysis</li>
                <li>• Confidence intervals provided for all accuracy metrics</li>
                <li>• Multiple hypothesis testing corrections applied</li>
                <li>• Survivor bias and look-ahead bias explicitly addressed</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Continuous Learning</h3>
              <p className="text-muted-foreground mb-4">Our algorithm improves through:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Weekly evidence weight updates</strong> based on recent predictive power</li>
                <li>• <strong>Monthly methodology reviews</strong> incorporating new academic research</li>
                <li>• <strong>Quarterly model architecture evaluation</strong> for structural improvements</li>
                <li>• <strong>Annual comprehensive backtesting</strong> across different market regimes</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* The Academic User Experience */}
        <section id="research-transparency" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">The Academic User Experience</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">For Quantitative Researchers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Complete methodology documentation</li>
                <li>• Historical prediction dataset access</li>
                <li>• API for backtesting integration</li>
                <li>• Collaboration opportunities on model improvements</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">For Finance Educators</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Case study materials from real predictions</li>
                <li>• Curriculum integration support</li>
                <li>• Student-friendly probability explanations</li>
                <li>• Interactive learning modules</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">For Applied Statisticians</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bayesian updating examples with real market data</li>
                <li>• Calibration testing frameworks</li>
                <li>• Uncertainty quantification case studies</li>
                <li>• Model validation methodologies</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Call to Action */}
        <section id="research-community" className="text-center">
          <h2 className="text-3xl font-serif text-foreground mb-6">Join Our Research Community</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We invite academics, researchers, and analytically-minded practitioners to:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="text-left">
              <ol className="space-y-2 text-muted-foreground">
                <li><strong>1. Review our methodology</strong> and provide feedback</li>
                <li><strong>2. Access our datasets</strong> for independent research</li>
              </ol>
            </div>
            <div className="text-left">
              <ol className="space-y-2 text-muted-foreground" start={3}>
                <li><strong>3. Collaborate on improvements</strong> to probability modeling</li>
                <li><strong>4. Contribute to financial education</strong> through transparent analysis</li>
              </ol>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-8">
            Our goal isn&apos;t to build the most profitable trading system—it&apos;s to create the most educational one. We believe that understanding market analysis makes better investors, and transparency builds trust.
          </p>

          <div className="text-2xl font-semibold text-foreground mb-8">
            Ready to explore probabilistic thinking in markets?
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Access Research Documentation
            </button>
            <button className="border border-border hover:bg-accent text-foreground px-6 py-3 rounded-lg font-medium transition-colors">
              View Live Methodology
            </button>
            <button className="border border-border hover:bg-accent text-foreground px-6 py-3 rounded-lg font-medium transition-colors">
              Join Academic Beta
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <footer className="text-center text-sm text-muted-foreground border-t border-border pt-8">
          <p>
            <em>Tubeamp is committed to responsible financial education. All probability assessments are for educational purposes and should not be considered investment advice. Past performance does not guarantee future results. We encourage diversification, risk management, and consultation with qualified financial advisors.</em>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Methodology;
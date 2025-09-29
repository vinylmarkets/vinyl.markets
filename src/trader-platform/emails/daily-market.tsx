import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface DailyMarketEmailProps {
  article: {
    headline: string
    biggerPicture: string
    marketStory: string
    sectorBreakdown: {
      winners: Array<{ sector: string; change: string; reason: string }>
      losers: Array<{ sector: string; change: string; reason: string }>
    }
    algorithmInsights: string
    tomorrowSetup: string
    consensusPick?: string
    keyLevel?: string
    subjectLine: string
  }
  marketData: {
    topGainer: { symbol: string; percent: number }
    buySignals: number
    momentumWinRate: number
    vixLevel: number
    watchList: string[]
    earningsNote?: string
    earningsCompany?: string
    expectedMove?: string
  }
  date: string
}

export const DailyMarketEmail = ({
  article,
  marketData,
  date,
}: DailyMarketEmailProps) => (
  <Html>
    <Head />
    <Preview>{article.subjectLine}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={title}>TubeAmp Daily</Heading>
          <Text style={subtitle}>
            {date} - Your 5-minute market download
          </Text>
        </Section>

        {/* Section 1: The Bigger Picture */}
        <Section style={section}>
          <Heading style={sectionTitle}>The Bigger Picture</Heading>
          <Text style={bodyText}>{article.biggerPicture}</Text>
          
          <div style={calloutBox}>
            <Text style={calloutText}>
              <strong>Quick hits from the outside world:</strong>
            </Text>
            <ul style={bulletList}>
              <li><strong>Fed signals:</strong> Still playing it by ear on rates</li>
              <li><strong>China update:</strong> Manufacturing data came in mixed</li>
              <li><strong>Crypto corner:</strong> Bitcoin did Bitcoin things</li>
            </ul>
          </div>
        </Section>

        {/* Section 2: Market Story */}
        <Section style={section}>
          <Heading style={sectionTitle}>Today's Market Story</Heading>
          <Text style={bodyText}>
            So here's what actually went down: {article.marketStory}
          </Text>
          
          <div style={translationBox}>
            <Text style={translationText}>
              <strong>Translation for humans:</strong> The VIX (think of it as Wall Street's 
              fear meter) hit {marketData.vixLevel} today. Under 20 means traders are feeling chill. 
              Over 30 means everyone's freaking out. At {marketData.vixLevel}? People are borderline cocky. 
              That usually means we're due for some drama soon.
            </Text>
          </div>
          
          <Text style={bodyText}>
            Our algorithms caught the momentum early and sent out {marketData.buySignals} buy signals 
            before lunch. The momentum strategy killed it with a {marketData.momentumWinRate}% success rate.
          </Text>
        </Section>

        {/* Section 3: Sector Breakdown */}
        <Section style={section}>
          <Heading style={sectionTitle}>Winners, Losers, and the Confused Middle</Heading>
          
          <div style={sectorGrid}>
            <div style={winnerColumn}>
              <Heading style={winnerTitle}>😎 Crushed It</Heading>
              <ul style={sectorList}>
                {article.sectorBreakdown.winners.map((winner, index) => (
                  <li key={index}>
                    <Text style={sectorItem}>
                      {winner.sector} ({winner.change}) - {winner.reason}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={loserColumn}>
              <Heading style={loserTitle}>😰 Rough Day</Heading>
              <ul style={sectorList}>
                {article.sectorBreakdown.losers.map((loser, index) => (
                  <li key={index}>
                    <Text style={sectorItem}>
                      {loser.sector} ({loser.change}) - {loser.reason}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Section 4: Algorithm Insights */}
        <Section style={section}>
          <Heading style={sectionTitle}>What The Algorithms Are Seeing</Heading>
          <Text style={bodyText}>
            {article.algorithmInsights}
          </Text>
          
          {article.consensusPick && (
            <div style={nerdBox}>
              <Text style={nerdText}>
                <strong>For the nerds:</strong> Our three strategies are actually agreeing on {article.consensusPick} 
                for once (this happens about as often as Congress passes a bill). RSI hit oversold territory, 
                MACD crossed positive, and volume was 2.3x average.
              </Text>
            </div>
          )}
          
          <Text style={bodyText}>
            Tomorrow we're watching {marketData.watchList.join(', ')}. Not saying you should buy them 
            (definitely not saying that - lawyers, you know?), but our computers are very interested 
            in what they do next.
          </Text>
        </Section>

        {/* Section 5: Tomorrow's Setup */}
        <Section style={section}>
          <Heading style={sectionTitle}>Setting Up Tomorrow</Heading>
          <Text style={bodyText}>
            {marketData.earningsNote ? 
              `${marketData.earningsCompany} reports after the bell tomorrow. The options market is pricing in a ${marketData.expectedMove}% move, which seems aggressive but what do I know.` :
              `No major earnings tomorrow, so we'll probably trade on whatever random tweet goes viral or some Fed member's cousin's barber's economic opinion.`
            }
          </Text>
          
          {article.keyLevel && (
            <Text style={bodyText}>
              Keep an eye on {article.keyLevel} on the S&P. We've bounced off it three times this month. 
              Fourth time's either the charm or the alarm.
            </Text>
          )}
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={disclaimerText}>
            <strong>Remember:</strong> This is what happened, not what will happen. Markets are weird, 
            algorithms are fallible, and sometimes a company goes up 10% because their CEO posted a good meme. 
            Trade accordingly.
          </Text>
          
          <Text style={footerNote}>
            You're getting this because you signed up for market updates that don't assume you have a 
            Bloomberg terminal. We're teaching computers to trade so you don't have to stare at charts 
            all day. Questions? Hit reply, an actual human (me) reads these.
          </Text>
          
          <Text style={unsubscribeText}>
            <Link href="#" style={link}>Manage preferences</Link> | 
            <Link href="#" style={link}> Unsubscribe</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default DailyMarketEmail

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
}

const header = {
  marginBottom: '30px',
}

const title = {
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  color: '#1a1b23',
  fontFamily: 'Georgia, serif',
}

const subtitle = {
  color: '#666666',
  fontStyle: 'italic',
  fontSize: '16px',
  margin: '0',
}

const section = {
  marginBottom: '30px',
}

const sectionTitle = {
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
  color: '#333333',
  borderBottom: '2px solid #333333',
  paddingBottom: '5px',
}

const bodyText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 15px 0',
  fontFamily: 'Georgia, serif',
}

const calloutBox = {
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderLeft: '4px solid #4CAF50',
  margin: '20px 0',
}

const calloutText = {
  fontSize: '16px',
  margin: '0 0 10px 0',
  color: '#333333',
}

const bulletList = {
  margin: '0',
  paddingLeft: '20px',
}

const translationBox = {
  backgroundColor: '#fff3cd',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
}

const translationText = {
  fontSize: '15px',
  color: '#856404',
  margin: '0',
}

const sectorGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  margin: '20px 0',
}

const winnerColumn = {
  padding: '15px',
  backgroundColor: '#f8fff8',
  borderRadius: '8px',
}

const loserColumn = {
  padding: '15px',
  backgroundColor: '#fff8f8',
  borderRadius: '8px',
}

const winnerTitle = {
  color: '#4CAF50',
  fontSize: '18px',
  margin: '0 0 10px 0',
}

const loserTitle = {
  color: '#f44336',
  fontSize: '18px',
  margin: '0 0 10px 0',
}

const sectorList = {
  margin: '0',
  paddingLeft: '0',
  listStyle: 'none',
}

const sectorItem = {
  fontSize: '14px',
  margin: '5px 0',
  color: '#333333',
}

const nerdBox = {
  backgroundColor: '#f0f8ff',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
}

const nerdText = {
  fontSize: '15px',
  color: '#1e40af',
  margin: '0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
}

const footer = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #ddd',
}

const disclaimerText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 15px 0',
}

const footerNote = {
  fontSize: '12px',
  fontStyle: 'italic',
  color: '#666666',
  margin: '0 0 10px 0',
}

const unsubscribeText = {
  fontSize: '12px',
  color: '#666666',
  margin: '0',
  textAlign: 'center' as const,
}

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
}
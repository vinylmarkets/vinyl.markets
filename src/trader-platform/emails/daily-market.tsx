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
    leadParagraph: string
    sectorAnalysis: string
    signalAnalysis: string
    outlook: string
  }
  totalSignals: number
  topSector: string
  todayWinRate: number
  topMovers: Array<{
    symbol: string
    change: number
    signal: string
  }>
  date: string
}

export const DailyMarketEmail = ({
  article,
  totalSignals,
  topSector,
  todayWinRate,
  topMovers,
  date,
}: DailyMarketEmailProps) => (
  <Html>
    <Head />
    <Preview>TubeAmp Trader Daily - {article.headline}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logoText}>TubeAmp Trader Daily</Heading>
          <Text style={dateText}>{date}</Text>
        </Section>

        {/* Headline */}
        <Heading style={headline}>{article.headline}</Heading>

        {/* Key Metrics */}
        <Section style={metricsSection}>
          <div style={metricsTable}>
            <div style={metricsRow}>
              <div style={metricCell}>
                <Text style={metricLabel}>Signals Today</Text>
                <Text style={metricValue}>{totalSignals}</Text>
              </div>
              <div style={metricCell}>
                <Text style={metricLabel}>Top Sector</Text>
                <Text style={metricValue}>{topSector}</Text>
              </div>
              <div style={metricCell}>
                <Text style={metricLabel}>Win Rate</Text>
                <Text style={metricValue}>{todayWinRate}%</Text>
              </div>
            </div>
          </div>
        </Section>

        <Hr style={divider} />

        {/* Article Body */}
        <Section style={articleBody}>
          <Text style={bodyText}>{article.leadParagraph}</Text>

          <Heading style={sectionTitle}>Sector Analysis</Heading>
          <Text style={bodyText}>{article.sectorAnalysis}</Text>

          <Heading style={sectionTitle}>Signal Intelligence</Heading>
          <Text style={bodyText}>{article.signalAnalysis}</Text>

          <Heading style={sectionTitle}>Tomorrow's Watchlist</Heading>
          <Text style={bodyText}>{article.outlook}</Text>
        </Section>

        <Hr style={divider} />

        {/* Top Movers Table */}
        <Section>
          <Heading style={sectionTitle}>Top Movers</Heading>
          <div style={moversTable}>
            <div style={tableHeaderRow}>
              <div style={tableHeader}>Symbol</div>
              <div style={tableHeader}>Change</div>
              <div style={tableHeader}>Signal</div>
            </div>
            {topMovers.map((stock, index) => (
              <div key={index} style={tableRow}>
                <div style={tableCell}>
                  <Text style={symbolText}>{stock.symbol}</Text>
                </div>
                <div style={tableCell}>
                  <Text style={stock.change >= 0 ? positiveChange : negativeChange}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </Text>
                </div>
                <div style={tableCell}>
                  <Text style={signalText}>{stock.signal}</Text>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={disclaimerText}>
            For educational purposes only. Past performance does not guarantee future results.
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
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '20px 30px',
  backgroundColor: '#1a1b23',
  borderRadius: '8px 8px 0 0',
}

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const dateText = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0',
}

const headline = {
  color: '#1a1b23',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '32px 30px 24px 30px',
  lineHeight: '1.3',
}

const metricsSection = {
  padding: '0 30px',
}

const metricsTable = {
  width: '100%',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
}

const metricsRow = {
  display: 'flex',
  justifyContent: 'space-between',
}

const metricCell = {
  textAlign: 'center' as const,
  padding: '8px',
  flex: '1',
}

const metricLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
}

const metricValue = {
  color: '#1a1b23',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 30px',
}

const articleBody = {
  padding: '0 30px',
}

const sectionTitle = {
  color: '#1a1b23',
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 12px 0',
}

const bodyText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}

const moversTable = {
  width: '100%',
  margin: '0 30px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
}

const tableHeaderRow = {
  display: 'flex',
  backgroundColor: '#f3f4f6',
}

const tableHeader = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px',
  flex: '1',
  borderRight: '1px solid #e5e7eb',
}

const tableRow = {
  display: 'flex',
  borderBottom: '1px solid #f3f4f6',
}

const tableCell = {
  padding: '12px',
  flex: '1',
  borderRight: '1px solid #f3f4f6',
}

const symbolText = {
  color: '#1a1b23',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const positiveChange = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const negativeChange = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const signalText = {
  color: '#6366f1',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
}

const footer = {
  padding: '24px 30px',
  textAlign: 'center' as const,
}

const disclaimerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 8px 0',
}

const unsubscribeText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
}
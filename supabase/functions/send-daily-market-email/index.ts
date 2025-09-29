import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";
// import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Daily Market Email Template Component
const DailyMarketEmail = ({ article, totalSignals, topSector, todayWinRate, topMovers, date }: any) => {
  return React.createElement('div', {
    style: {
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
      backgroundColor: '#f6f9fc',
      padding: '20px',
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      style: {
        backgroundColor: '#1a1b23',
        color: '#ffffff',
        padding: '20px',
        borderRadius: '8px 8px 0 0',
      }
    }, [
      React.createElement('h1', {
        key: 'logo',
        style: { margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }
      }, 'TubeAmp Trader Daily'),
      React.createElement('p', {
        key: 'date',
        style: { margin: '0', color: '#9ca3af', fontSize: '14px' }
      }, date)
    ]),
    
    // Content
    React.createElement('div', {
      key: 'content',
      style: {
        backgroundColor: '#ffffff',
        padding: '30px',
      }
    }, [
      // Headline
      React.createElement('h2', {
        key: 'headline',
        style: { fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px 0', color: '#1a1b23' }
      }, article.headline),
      
      // Key Metrics
      React.createElement('div', {
        key: 'metrics',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          margin: '0 0 32px 0',
        }
      }, [
        React.createElement('div', { key: 'signals', style: { textAlign: 'center' } }, [
          React.createElement('div', { key: 'label1', style: { fontSize: '12px', color: '#6b7280', fontWeight: '500' } }, 'SIGNALS TODAY'),
          React.createElement('div', { key: 'value1', style: { fontSize: '20px', color: '#1a1b23', fontWeight: 'bold' } }, totalSignals)
        ]),
        React.createElement('div', { key: 'sector', style: { textAlign: 'center' } }, [
          React.createElement('div', { key: 'label2', style: { fontSize: '12px', color: '#6b7280', fontWeight: '500' } }, 'TOP SECTOR'),
          React.createElement('div', { key: 'value2', style: { fontSize: '20px', color: '#1a1b23', fontWeight: 'bold' } }, topSector)
        ]),
        React.createElement('div', { key: 'winrate', style: { textAlign: 'center' } }, [
          React.createElement('div', { key: 'label3', style: { fontSize: '12px', color: '#6b7280', fontWeight: '500' } }, 'WIN RATE'),
          React.createElement('div', { key: 'value3', style: { fontSize: '20px', color: '#1a1b23', fontWeight: 'bold' } }, `${todayWinRate}%`)
        ])
      ]),
      
      // Article Content
      React.createElement('div', { key: 'article' }, [
        React.createElement('p', { key: 'lead', style: { fontSize: '16px', lineHeight: '1.6', color: '#374151' } }, article.leadParagraph),
        React.createElement('h3', { key: 'sector-title', style: { fontSize: '20px', fontWeight: '600', margin: '24px 0 12px 0' } }, 'Sector Analysis'),
        React.createElement('p', { key: 'sector-content', style: { fontSize: '16px', lineHeight: '1.6', color: '#374151' } }, article.sectorAnalysis),
        React.createElement('h3', { key: 'signal-title', style: { fontSize: '20px', fontWeight: '600', margin: '24px 0 12px 0' } }, 'Signal Intelligence'),
        React.createElement('p', { key: 'signal-content', style: { fontSize: '16px', lineHeight: '1.6', color: '#374151' } }, article.signalAnalysis),
        React.createElement('h3', { key: 'outlook-title', style: { fontSize: '20px', fontWeight: '600', margin: '24px 0 12px 0' } }, 'Tomorrow\'s Watchlist'),
        React.createElement('p', { key: 'outlook-content', style: { fontSize: '16px', lineHeight: '1.6', color: '#374151' } }, article.outlook),
      ]),
      
      // Top Movers Table
      React.createElement('div', { key: 'movers', style: { margin: '32px 0' } }, [
        React.createElement('h3', { key: 'movers-title', style: { fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0' } }, 'Top Movers'),
        React.createElement('table', {
          key: 'movers-table',
          style: { width: '100%', borderCollapse: 'collapse' }
        }, [
          React.createElement('tr', { key: 'header-row' }, [
            React.createElement('th', { key: 'symbol-header', style: { padding: '12px', textAlign: 'left', backgroundColor: '#f3f4f6', fontWeight: '600' } }, 'Symbol'),
            React.createElement('th', { key: 'change-header', style: { padding: '12px', textAlign: 'left', backgroundColor: '#f3f4f6', fontWeight: '600' } }, 'Change'),
            React.createElement('th', { key: 'signal-header', style: { padding: '12px', textAlign: 'left', backgroundColor: '#f3f4f6', fontWeight: '600' } }, 'Signal'),
          ]),
          ...topMovers.map((stock: any, index: number) =>
            React.createElement('tr', { key: `row-${index}` }, [
              React.createElement('td', { key: 'symbol', style: { padding: '12px', borderBottom: '1px solid #f3f4f6' } }, stock.symbol),
              React.createElement('td', {
                key: 'change',
                style: {
                  padding: '12px',
                  borderBottom: '1px solid #f3f4f6',
                  color: stock.change >= 0 ? '#059669' : '#dc2626',
                  fontWeight: '600'
                }
              }, `${stock.change >= 0 ? '+' : ''}${stock.change}%`),
              React.createElement('td', { key: 'signal', style: { padding: '12px', borderBottom: '1px solid #f3f4f6', color: '#6366f1', fontWeight: '500' } }, stock.signal),
            ])
          )
        ])
      ]),
      
      // Footer
      React.createElement('div', {
        key: 'footer',
        style: { textAlign: 'center', marginTop: '32px', padding: '24px 0', borderTop: '1px solid #e5e7eb' }
      }, [
        React.createElement('p', {
          key: 'disclaimer',
          style: { fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }
        }, 'For educational purposes only. Past performance does not guarantee future results.'),
        React.createElement('p', {
          key: 'unsubscribe',
          style: { fontSize: '12px', color: '#6b7280', margin: '0' }
        }, 'Manage preferences | Unsubscribe')
      ])
    ])
  ]);
};

async function generateAndSendDailyEmail() {
  console.log('Starting daily market email generation...');
  
  try {
    // Get today's article
    const today = new Date().toISOString().split('T')[0];
    const { data: article } = await supabase
      .from('daily_articles')
      .select('*')
      .eq('publish_date', today)
      .single();
    
    if (!article) {
      // Generate new article if none exists
      const { data: generateResponse } = await supabase.functions.invoke('market-narrator');
      if (!generateResponse) {
        throw new Error('Failed to generate market narrative');
      }
    }
    
    // Get market data for metrics
    const { data: marketData } = await supabase
      .from('market_narrative_data')
      .select('*')
      .eq('date', today)
      .single();
    
    // Mock data for demonstration
    const emailData = {
      article: article || {
        headline: "Markets Rally on Tech Strength",
        leadParagraph: "Technology stocks led a broad market rally today as investors showed renewed confidence in growth sectors.",
        sectorAnalysis: "The technology sector outperformed with a 2.3% gain, driven by semiconductor and software stocks.",
        signalAnalysis: "Our algorithms detected 47 buy signals today, with highest confidence in the technology and healthcare sectors.",
        outlook: "Looking ahead, momentum indicators suggest continued strength in growth sectors, with key resistance levels to watch."
      },
      totalSignals: marketData?.signal_summary?.total || 47,
      topSector: marketData?.sector_performances ? Object.keys(marketData.sector_performances)[0] : "Technology",
      todayWinRate: 73,
      topMovers: marketData?.top_movers || [
        { symbol: "NVDA", change: 5.2, signal: "BUY" },
        { symbol: "AAPL", change: 2.8, signal: "HOLD" },
        { symbol: "MSFT", change: 1.9, signal: "BUY" },
        { symbol: "GOOGL", change: -1.2, signal: "SELL" },
        { symbol: "TSLA", change: -2.1, signal: "SELL" }
      ],
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    // Get email subscribers (mock for now)
    const subscribers = [
      'demo@example.com' // Add actual subscriber logic here
    ];
    
    // Generate HTML from React component
    const htmlElement = React.createElement(DailyMarketEmail, emailData);
    // For now, we'll use a simplified HTML template until React Email is properly configured
    const html = generateSimpleHtml(emailData);
    
    // Send emails
    for (const email of subscribers) {
      const { error } = await resend.emails.send({
        from: 'TubeAmp Trader <noreply@tubeamp.com>',
        to: [email],
        subject: `Daily Market Brief: ${emailData.article.headline}`,
        html,
      });
      
      if (error) {
        console.error(`Failed to send email to ${email}:`, error);
      } else {
        console.log(`Email sent successfully to ${email}`);
      }
    }
    
    // Update article as sent
    if (article) {
      await supabase
        .from('daily_articles')
        .update({ email_sent: true })
        .eq('id', article.id);
    }
    
    console.log('Daily market email generation completed successfully');
    
    return { success: true, emailsSent: subscribers.length };
    
  } catch (error) {
    console.error('Error in daily email generation:', error);
    throw error;
  }
}

function generateSimpleHtml(emailData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TubeAmp Trader Daily</title>
    </head>
    <body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #1a1b23; color: #ffffff; padding: 20px;">
          <h1 style="margin: 0 0 8px 0; fontSize: 24px; font-weight: bold;">TubeAmp Trader Daily</h1>
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">${emailData.date}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 24px 0; color: #1a1b23;">${emailData.article.headline}</h2>
          
          <!-- Key Metrics -->
          <div style="display: flex; justify-content: space-between; background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 0 0 32px 0;">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">SIGNALS TODAY</div>
              <div style="font-size: 20px; color: #1a1b23; font-weight: bold;">${emailData.totalSignals}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">TOP SECTOR</div>
              <div style="font-size: 20px; color: #1a1b23; font-weight: bold;">${emailData.topSector}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">WIN RATE</div>
              <div style="font-size: 20px; color: #1a1b23; font-weight: bold;">${emailData.todayWinRate}%</div>
            </div>
          </div>
          
          <!-- Article Content -->
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${emailData.article.leadParagraph}</p>
          <h3 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0;">Sector Analysis</h3>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${emailData.article.sectorAnalysis}</p>
          <h3 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0;">Signal Intelligence</h3>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${emailData.article.signalAnalysis}</p>
          <h3 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0;">Tomorrow's Watchlist</h3>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${emailData.article.outlook}</p>
          
          <!-- Top Movers -->
          <h3 style="font-size: 20px; font-weight: 600; margin: 32px 0 16px 0;">Top Movers</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">Symbol</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Change</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Signal</th>
            </tr>
            ${emailData.topMovers.map((stock: any) => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${stock.symbol}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; color: ${stock.change >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">${stock.change >= 0 ? '+' : ''}${stock.change}%</td>
                <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; color: #6366f1; font-weight: 500;">${stock.signal}</td>
              </tr>
            `).join('')}
          </table>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px; padding: 24px 0; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">For educational purposes only. Past performance does not guarantee future results.</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">Manage preferences | Unsubscribe</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const result = await generateAndSendDailyEmail();
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-market-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
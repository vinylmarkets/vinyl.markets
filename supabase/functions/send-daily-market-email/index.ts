import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "https://esm.sh/resend@4.0.0";
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
const DailyMarketEmail = ({ emailData }: any) => {
  return React.createElement('div', {
    style: {
      fontFamily: 'Georgia, serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      padding: '20px',
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: { 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0', 
          color: '#1a1b23',
          fontFamily: 'Georgia, serif'
        }
      }, 'TubeAmp Daily'),
      React.createElement('p', {
        key: 'subtitle',
        style: { 
          color: '#666666', 
          fontStyle: 'italic', 
          fontSize: '16px', 
          margin: '0' 
        }
      }, `${emailData.date} - Your 5-minute market download`)
    ]),
    
    // The Bigger Picture
    React.createElement('div', {
      key: 'bigger-picture',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { 
          fontSize: '22px', 
          fontWeight: 'bold', 
          margin: '0 0 15px 0', 
          color: '#333333',
          borderBottom: '2px solid #333333',
          paddingBottom: '5px'
        }
      }, 'The Bigger Picture'),
      React.createElement('p', {
        key: 'content',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, emailData.article.biggerPicture),
      React.createElement('div', {
        key: 'callout',
        style: {
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderLeft: '4px solid #4CAF50',
          margin: '20px 0'
        }
      }, [
        React.createElement('p', { 
          key: 'callout-text', 
          style: { fontSize: '16px', margin: '0 0 10px 0', color: '#333333' } 
        }, React.createElement('strong', {}, 'Quick hits from the outside world:')),
        React.createElement('ul', { key: 'list', style: { margin: '0', paddingLeft: '20px' } }, [
          React.createElement('li', { key: 'fed' }, React.createElement('strong', {}, 'Fed signals: '), 'Still playing it by ear on rates'),
          React.createElement('li', { key: 'china' }, React.createElement('strong', {}, 'China update: '), 'Manufacturing data came in mixed'),
          React.createElement('li', { key: 'crypto' }, React.createElement('strong', {}, 'Crypto corner: '), 'Bitcoin did Bitcoin things')
        ])
      ])
    ]),
    
    // Market Story
    React.createElement('div', {
      key: 'market-story',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { 
          fontSize: '22px', 
          fontWeight: 'bold', 
          margin: '0 0 15px 0', 
          color: '#333333',
          borderBottom: '2px solid #333333',
          paddingBottom: '5px'
        }
      }, 'Today\'s Market Story'),
      React.createElement('p', {
        key: 'story',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, `So here's what actually went down: ${emailData.article.marketStory}`),
      React.createElement('div', {
        key: 'translation',
        style: {
          backgroundColor: '#fff3cd',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }
      }, React.createElement('p', {
        style: { fontSize: '15px', color: '#856404', margin: '0' }
      }, [
        React.createElement('strong', { key: 'label' }, 'Translation for humans: '),
        `The VIX (think of it as Wall Street's fear meter) hit ${emailData.marketData.vixLevel} today. Under 20 means traders are feeling chill. Over 30 means everyone's freaking out. At ${emailData.marketData.vixLevel}? People are borderline cocky.`
      ])),
      React.createElement('p', {
        key: 'algorithms',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, `Our algorithms caught the momentum early and sent out ${emailData.marketData.buySignals} buy signals before lunch. The momentum strategy killed it with a ${emailData.marketData.momentumWinRate}% success rate.`)
    ]),
    
    // Sector Breakdown
    React.createElement('div', {
      key: 'sectors',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { 
          fontSize: '22px', 
          fontWeight: 'bold', 
          margin: '0 0 15px 0', 
          color: '#333333',
          borderBottom: '2px solid #333333',
          paddingBottom: '5px'
        }
      }, 'Winners, Losers, and the Confused Middle'),
      React.createElement('div', {
        key: 'grid',
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          margin: '20px 0'
        }
      }, [
        React.createElement('div', {
          key: 'winners',
          style: {
            padding: '15px',
            backgroundColor: '#f8fff8',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', {
            key: 'title',
            style: { color: '#4CAF50', fontSize: '18px', margin: '0 0 10px 0' }
          }, '😎 Crushed It'),
          React.createElement('ul', { 
            key: 'list', 
            style: { margin: '0', paddingLeft: '0', listStyle: 'none' } 
          }, emailData.article.sectorBreakdown.winners.map((winner: any, index: number) =>
            React.createElement('li', { key: `winner-${index}` }, 
              React.createElement('div', { 
                style: { fontSize: '14px', margin: '5px 0', color: '#333333' } 
              }, `${winner.sector} (${winner.change}) - ${winner.reason}`)
            )
          ))
        ]),
        React.createElement('div', {
          key: 'losers',
          style: {
            padding: '15px',
            backgroundColor: '#fff8f8',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', {
            key: 'title',
            style: { color: '#f44336', fontSize: '18px', margin: '0 0 10px 0' }
          }, '😰 Rough Day'),
          React.createElement('ul', { 
            key: 'list', 
            style: { margin: '0', paddingLeft: '0', listStyle: 'none' } 
          }, emailData.article.sectorBreakdown.losers.map((loser: any, index: number) =>
            React.createElement('li', { key: `loser-${index}` }, 
              React.createElement('div', { 
                style: { fontSize: '14px', margin: '5px 0', color: '#333333' } 
              }, `${loser.sector} (${loser.change}) - ${loser.reason}`)
            )
          ))
        ])
      ])
    ]),
    
    // Algorithm Insights
    React.createElement('div', {
      key: 'algorithms',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { 
          fontSize: '22px', 
          fontWeight: 'bold', 
          margin: '0 0 15px 0', 
          color: '#333333',
          borderBottom: '2px solid #333333',
          paddingBottom: '5px'
        }
      }, 'What The Algorithms Are Seeing'),
      React.createElement('p', {
        key: 'insights',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, emailData.article.algorithmInsights),
      emailData.article.consensusPick ? React.createElement('div', {
        key: 'nerd-box',
        style: {
          backgroundColor: '#f0f8ff',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }
      }, React.createElement('p', {
        style: { fontSize: '15px', color: '#1e40af', margin: '0' }
      }, [
        React.createElement('strong', { key: 'label' }, 'For the nerds: '),
        `Our three strategies are actually agreeing on ${emailData.article.consensusPick} for once (this happens about as often as Congress passes a bill). RSI hit oversold territory, MACD crossed positive, and volume was 2.3x average.`
      ])) : null,
      React.createElement('p', {
        key: 'watchlist',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, `Tomorrow we're watching ${emailData.marketData.watchList.join(', ')}. Not saying you should buy them (definitely not saying that - lawyers, you know?), but our computers are very interested in what they do next.`)
    ]),
    
    // Tomorrow's Setup
    React.createElement('div', {
      key: 'tomorrow',
      style: { marginBottom: '30px' }
    }, [
      React.createElement('h2', {
        key: 'title',
        style: { 
          fontSize: '22px', 
          fontWeight: 'bold', 
          margin: '0 0 15px 0', 
          color: '#333333',
          borderBottom: '2px solid #333333',
          paddingBottom: '5px'
        }
      }, 'Setting Up Tomorrow'),
      React.createElement('p', {
        key: 'setup',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, emailData.article.tomorrowSetup),
      emailData.article.keyLevel ? React.createElement('p', {
        key: 'key-level',
        style: { 
          fontSize: '16px', 
          lineHeight: '1.6', 
          color: '#333333', 
          margin: '0 0 15px 0',
          fontFamily: 'Georgia, serif'
        }
      }, `Keep an eye on ${emailData.article.keyLevel} on the S&P. We've bounced off it three times this month. Fourth time's either the charm or the alarm.`) : null
    ]),
    
    // Footer
    React.createElement('div', {
      key: 'footer',
      style: {
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd',
      }
    }, [
      React.createElement('p', {
        key: 'disclaimer',
        style: { fontSize: '14px', color: '#666666', margin: '0 0 15px 0' }
      }, [
        React.createElement('strong', { key: 'label' }, 'Remember: '),
        'This is what happened, not what will happen. Markets are weird, algorithms are fallible, and sometimes a company goes up 10% because their CEO posted a good meme. Trade accordingly.'
      ]),
      React.createElement('p', {
        key: 'note',
        style: { fontSize: '12px', fontStyle: 'italic', color: '#666666', margin: '0 0 10px 0' }
      }, 'You\'re getting this because you signed up for market updates that don\'t assume you have a Bloomberg terminal. We\'re teaching computers to trade so you don\'t have to stare at charts all day. Questions? Hit reply, an actual human (me) reads these.'),
      React.createElement('p', {
        key: 'unsubscribe',
        style: { fontSize: '12px', color: '#666666', margin: '0', textAlign: 'center' }
      }, 'Manage preferences | Unsubscribe')
    ])
  ]);
};

function generateCatchySubjectLine(marketData: any, themes: any): string {
  const subjects = [
    `Tech stocks partied while banks nursed a hangover 🎢`,
    `Everyone bought the dip (except energy) 📈`,
    `${marketData.topGainer?.symbol || 'NVDA'} did a thing, markets noticed 🚀`,
    `VIX at ${marketData.vixLevel || '14'} - traders feeling a bit too comfortable 😎`,
    `The algorithms are bullish, humans are confused 🤖`,
    `Sector rotation or just random Tuesday? 🤷‍♂️`
  ];
  
  return subjects[Math.floor(Math.random() * subjects.length)];
}

async function generateConversationalContent(marketData: any, stories: any): Promise<any> {
  console.log('Generating conversational market content...');
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const prompt = `You are writing a daily market email in a conversational, educational style that doesn't assume readers are financial experts. Based on the data below, create content for each section:

Market Data for ${marketData.date}:
- Top Performer: ${stories.biggestMover?.symbol || 'NVDA'} ${stories.biggestMover?.change > 0 ? '+' : ''}${stories.biggestMover?.change || 5.2}%
- Market Regime: ${marketData.marketRegime || 'bullish'}
- VIX Level: ${14.3}
- Algorithm Signals: ${marketData.signalSummary?.bullish_signals || 47} bullish vs ${marketData.signalSummary?.bearish_signals || 12} bearish
- Sector Performance: Tech leading, Energy lagging

Write content for these sections:

1. BIGGER_PICTURE (150-200 words): What's happening outside Wall Street that actually matters. Be conversational, mention specific companies/events, explain WHY things matter in simple terms.

2. MARKET_STORY (150-200 words): What happened in markets today. Focus on explaining WHY moves happened, not just what happened. Use casual language but include specific numbers.

3. ALGORITHM_INSIGHTS (100-150 words): What our trading algorithms are seeing, written for normal humans. Explain technical concepts simply but don't dumb it down too much.

4. TOMORROW_SETUP (75-100 words): What to watch tomorrow. Be specific about levels, earnings, events. End with a slightly witty observation.

5. SECTOR_BREAKDOWN: 
   Winners: 3 sectors with % changes and casual explanations
   Losers: 3 sectors with % changes and casual explanations

Style guidelines:
- Write like you're explaining to a smart friend who doesn't work in finance
- Use humor but keep it professional
- Include specific numbers and company names
- Explain the "why" behind market moves
- No jargon without explanation
- Be slightly skeptical/realistic about market narratives

Return as JSON with fields: biggerPicture, marketStory, algorithmInsights, tomorrowSetup, sectorBreakdown (with winners/losers arrays), consensusPick, keyLevel`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial writer known for making markets accessible to regular people. Your style is conversational, educational, and slightly witty. You explain complex concepts simply without talking down to readers.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content.trim());
    
    console.log('Generated conversational content');
    return content;
    
  } catch (error) {
    console.error('Error generating conversational content:', error);
    
    // Fallback content
    return {
      biggerPicture: "Remember that Fed meeting everyone forgot was happening? Well, they actually said some things that mattered this time. Basically, they're still trying to figure out if the economy is too hot, too cold, or just right. Meanwhile, tech companies continue to spend billions on AI like it's going out of style, which is either genius or the biggest bubble since 1999. Time will tell.",
      marketStory: `Tech stocks had their best day in weeks, and honestly, nobody's quite sure why. ${stories.biggestMover?.symbol || 'NVDA'} jumped ${Math.abs(stories.biggestMover?.change || 5.2)}%, which is wild for a company that size. The weird thing? Usually when tech rallies this hard, banks sell off. Today both went up. That's... unusual.`,
      algorithmInsights: "Our three strategies are actually agreeing on something for once (this happens about as often as Congress passes a bill). All three are bullish on semiconductor stocks, which is interesting because they usually hate each other's picks. The ML model's showing 82% confidence, which is about as excited as a computer can get.",
      tomorrowSetup: "No major earnings tomorrow, so we'll probably trade on whatever random tweet goes viral or some Fed member's cousin's economic opinion. Keep an eye on 4,200 on the S&P - we've bounced off it three times this month.",
      sectorBreakdown: {
        winners: [
          { sector: "Semiconductors", change: "+3.2%", reason: "AI hype is back, baby" },
          { sector: "Software", change: "+2.8%", reason: "Following chips like always" },
          { sector: "Banks", change: "+1.9%", reason: "Wait, what? (see above)" }
        ],
        losers: [
          { sector: "Energy", change: "-2.1%", reason: "Oil's down, nobody knows why" },
          { sector: "Utilities", change: "-1.3%", reason: "The boring stocks being boring" },
          { sector: "Real Estate", change: "-0.9%", reason: "Rates something something" }
        ]
      },
      consensusPick: "NVDA",
      keyLevel: "4,200"
    };
  }
}

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
    
    // Get market data for narrative generation
    const { data: marketData } = await supabase
      .from('market_narrative_data')
      .select('*')
      .eq('date', today)
      .single();
    
    // Generate conversational content
    const conversationalContent = await generateConversationalContent(marketData || {}, {
      biggestMover: { symbol: 'NVDA', change: 5.2 }
    });
    
    // Mock data for demonstration
    const emailData = {
      article: {
        subjectLine: generateCatchySubjectLine(marketData || {}, {}),
        biggerPicture: conversationalContent.biggerPicture,
        marketStory: conversationalContent.marketStory,
        sectorBreakdown: conversationalContent.sectorBreakdown,
        algorithmInsights: conversationalContent.algorithmInsights,
        tomorrowSetup: conversationalContent.tomorrowSetup,
        consensusPick: conversationalContent.consensusPick,
        keyLevel: conversationalContent.keyLevel
      },
      marketData: {
        topGainer: { symbol: "NVDA", percent: 5.2 },
        buySignals: marketData?.signal_summary?.bullish_signals || 47,
        momentumWinRate: 73,
        vixLevel: 14.3,
        watchList: ["AAPL", "MSFT", "GOOGL", "TSLA"],
        earningsNote: null,
        earningsCompany: null,
        expectedMove: null
      },
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
    const htmlElement = React.createElement(DailyMarketEmail, { emailData });
    const html = generateSimpleHtml(emailData);
    
    // Send emails
    for (const email of subscribers) {
      const { error } = await resend.emails.send({
        from: 'TubeAmp Trader <noreply@tubeamp.com>',
        to: [email],
        subject: emailData.article.subjectLine,
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
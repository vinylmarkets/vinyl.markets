import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const styleByEra: Record<string, string> = {
  '1960s': 'Bold colors, mod design, serif fonts, formal band photography, psychedelic elements, vintage print quality',
  '1970s': 'Earth tones, psychedelic art, hand-drawn elements, textured background, warm colors, analog aesthetic',
  '1980s': 'Neon colors, geometric shapes, airbrushed art, synthesizer aesthetic, chrome effects, digital gradient',
  '1990s': 'Grunge aesthetic, minimalist, photography-focused, alternative rock style, muted colors, authentic',
};

const albumTitles: Record<string, string[]> = {
  'tubeamp-v1': ['Momentum Rising', 'The Scanner Sessions', 'Energy Flows', 'Breaking Through', 'Maximum Drive'],
  'reverb': ['Return to Equilibrium', 'Mean Streets', 'Reversion Blues', 'The Comeback', 'Echo of Value'],
  'delay-pedal': ['Swing Time', 'Delayed Gratification', 'The Waiting Game', 'Position Swing', 'Tempo Trading'],
  'compressor': ['Volatility Crush', 'Arbitrage Suite', 'Compressed Time', 'The Vol Sessions', 'Spreads & Butterflies'],
  'overdrive': ['Breakout', 'Resistance is Futile', 'New Highs', 'The Momentum Shift', 'Beyond the Range'],
  'phaser': ['Pairs in Motion', 'Correlation Theory', 'The Spread Album', 'Cointegrated', 'Trading Partners'],
  'chorus': ['Trend Line', 'Following the Leader', 'Riding Waves', 'Directional Bias', 'The Long Run'],
  'wah-wah': ['Options Flow', 'Gamma Squeeze', 'Delta Blues', 'The Greek Suite', 'IV Expansion'],
  'tremolo': ['Range Bound', 'Between the Lines', 'Oscillator', 'Channel Surfer', 'Box Trading'],
  'fuzz-box': ['Gap & Go', 'Opening Bell', 'The Morning Rush', 'Price Action', 'Intraday Express'],
  'flanger': ['Statistical Edge', 'Arbitrage Theory', 'Quantitative Suite', 'The Alpha Factor', 'Mean Reversion'],
  'echo-chamber': ['Pattern Recognition', 'Chart Patterns', 'Technical Signals', 'The Formation', 'Price Memory'],
  'sustain': ['The Long Hold', 'Position Management', 'Staying Power', 'The Patience Trade', 'Time in the Market'],
  'distortion': ['High Frequency', 'Microsecond Edge', 'The Speed of Money', 'Latency Arbitrage', 'Algorithmic Noise'],
  'loop-station': ['Seasonal Cycles', 'Annual Returns', 'The Calendar Effect', 'Monthly Patterns', 'Cyclical Trends'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ampTypeId, count = 5, preferEra, preferGenre } = await req.json();
    
    if (!ampTypeId) {
      return new Response(JSON.stringify({ error: 'ampTypeId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load amp types data
    const ampTypes: Record<string, any> = {
      'tubeamp-v1': { name: 'TubeAmp v1', bandName: 'The Momentum Makers', genre: 'rock', era: '1970s' },
      'reverb': { name: 'Reverb', bandName: 'The Return Traders', genre: 'psychedelic', era: '1960s' },
      'delay-pedal': { name: 'Delay Pedal', bandName: 'Swing Shift Orchestra', genre: 'funk', era: '1970s' },
      'compressor': { name: 'Compressor', bandName: 'The Volatility Players', genre: 'jazz', era: '1960s' },
      'overdrive': { name: 'Overdrive', bandName: 'The Breakout Kings', genre: 'hard-rock', era: '1980s' },
      'phaser': { name: 'Phaser', bandName: 'The Correlation Collective', genre: 'prog-rock', era: '1970s' },
      'chorus': { name: 'Chorus', bandName: 'The Trend Riders', genre: 'pop', era: '1980s' },
      'wah-wah': { name: 'Wah-Wah', bandName: 'The Flow Masters', genre: 'blues', era: '1960s' },
      'tremolo': { name: 'Tremolo', bandName: 'The Range Riders', genre: 'surf-rock', era: '1960s' },
      'fuzz-box': { name: 'Fuzz Box', bandName: 'The Gap Fillers', genre: 'garage-rock', era: '1960s' },
      'flanger': { name: 'Flanger', bandName: 'The Stat Arbiters', genre: 'electronic', era: '1980s' },
      'echo-chamber': { name: 'Echo Chamber', bandName: 'The Pattern Seekers', genre: 'dub', era: '1970s' },
      'sustain': { name: 'Sustain', bandName: 'The Long Hold', genre: 'folk', era: '1970s' },
      'distortion': { name: 'Distortion', bandName: 'The Speed Demons', genre: 'metal', era: '1980s' },
      'loop-station': { name: 'Loop Station', bandName: 'The Cycle Traders', genre: 'ambient', era: '1990s' },
    };

    const ampType = ampTypes[ampTypeId];
    if (!ampType) {
      return new Response(JSON.stringify({ error: 'Invalid amp type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const era = preferEra || ampType.era;
    const genre = preferGenre || ampType.genre;
    const bandName = ampType.bandName;
    const titles = albumTitles[ampTypeId] || ['Trading Volumes', 'Market Makers', 'Price Discovery'];

    const results = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const albumTitle = titles[i % titles.length];
      const styleDescription = styleByEra[era] || styleByEra['1970s'];
      
      const prompt = `Vintage vinyl album cover from ${era}, ${genre} music style, imaginary band called "${bandName}", album titled "${albumTitle}", ${styleDescription}, professional music photography, authentic period typography and design, square album cover format, clean family-friendly content, no explicit text overlays, high quality vintage aesthetic`;

      console.log(`Generating image ${i + 1}/${count} for ${ampTypeId}`);
      console.log(`Prompt: ${prompt}`);

      try {
        // Generate image with DALL-E 3
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url',
          }),
        });

        if (!imageResponse.ok) {
          const error = await imageResponse.text();
          console.error('OpenAI API error:', error);
          continue;
        }

        const imageData = await imageResponse.json();
        const imageUrl = imageData.data[0].url;

        // Download the image
        const imageBlob = await fetch(imageUrl).then(r => r.blob());
        const imageBuffer = await imageBlob.arrayBuffer();

        // Upload to Supabase Storage
        const fileName = `${ampTypeId}/${crypto.randomUUID()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('amp-cover-art')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('amp-cover-art')
          .getPublicUrl(fileName);

        // Save to database
        const { data: dbData, error: dbError } = await supabase
          .from('amp_cover_art')
          .insert({
            amp_type_id: ampTypeId,
            band_name: bandName,
            album_title: albumTitle,
            image_url: urlData.publicUrl,
            generation_prompt: prompt,
            style_era: era,
            genre: genre,
            is_featured: false,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database insert error:', dbError);
          continue;
        }

        results.push(dbData);
        console.log(`Successfully generated and saved image ${i + 1}`);

      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error);
        continue;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      count: results.length,
      covers: results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-amp-covers function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, tags, usageNotes } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Generating DALL-E 3 image with prompt:', prompt.substring(0, 100) + '...')

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment')
      throw new Error('OpenAI API key not found')
    }

    // Generate image using DALL-E 3
    const openaiPayload = {
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      response_format: 'url'
    }
    
    console.log('Making OpenAI API request with payload:', JSON.stringify(openaiPayload, null, 2))

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    })

    console.log('OpenAI API response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error response:', JSON.stringify(error, null, 2))
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('OpenAI API success response received')
    
    // DALL-E 3 returns image URLs
    const imageUrl = data.data[0].url
    
    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI')
    }
    
    console.log('Image URL received, downloading...')
    
    // Download the image to convert to base64
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    const imageData = `data:image/png;base64,${imageBase64}`

    console.log('Image converted to base64, saving to database...')

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Invalid authentication')
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `admin-generated-${timestamp}.png`

    // Save to database
    const { data: savedImage, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        prompt,
        image_url: imageData,
        filename,
        created_by: user.id,
        tags: tags || [],
        usage_notes: usageNotes,
        image_data: imageBase64
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save image to database')
    }

    console.log('Image saved to database successfully:', savedImage.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        image: savedImage,
        message: 'Image generated and saved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-admin-image function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
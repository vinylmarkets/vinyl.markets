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

    console.log('Starting image generation process...')
    console.log('Prompt length:', prompt.length)

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('OpenAI API key found, making request...')

    // Test OpenAI API with a simple request first
    const openaiPayload = {
      model: 'dall-e-2',
      prompt: prompt.length > 1000 ? prompt.substring(0, 1000) : prompt, // Truncate long prompts
      n: 1,
      size: '512x512', // Use smaller size for faster testing
      response_format: 'url'
    }
    
    console.log('Sending request to OpenAI with payload:', JSON.stringify({
      model: openaiPayload.model,
      promptLength: openaiPayload.prompt.length,
      n: openaiPayload.n,
      size: openaiPayload.size
    }))

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    })

    console.log('OpenAI API response status:', response.status)
    console.log('OpenAI API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error status:', response.status)
      console.error('OpenAI API error text:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: { message: errorText } }
      }
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error (${response.status}): ${errorData.error?.message || errorText}`,
          details: errorData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const data = await response.json()
    console.log('OpenAI API success response received')
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Invalid response structure from OpenAI:', data)
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const imageUrl = data.data[0].url
    console.log('Image URL received, downloading...')
    
    // Download the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error('Failed to download image:', imageResponse.status)
      return new Response(
        JSON.stringify({ error: `Failed to download image: ${imageResponse.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBytes = new Uint8Array(imageBuffer)
    
    console.log('Image downloaded, size:', imageBytes.length, 'bytes')

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not found')
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('User authenticated, uploading to storage...')

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `admin-generated-${timestamp}.png`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, imageBytes, {
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload image to storage' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Image uploaded to storage:', uploadData.path)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename)

    // Save to database
    const { data: savedImage, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        prompt,
        image_url: urlData.publicUrl,
        filename,
        created_by: user.id,
        tags: tags || [],
        usage_notes: usageNotes
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save image record to database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Image generation completed successfully:', savedImage.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        image: savedImage,
        message: 'Image generated and saved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in generate-admin-image function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
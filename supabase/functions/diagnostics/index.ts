import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    switch (action) {
      case 'test_connection': {
        const { connectionType } = params;
        const startTime = Date.now();
        let status = false;
        let error = null;

        try {
          switch (connectionType) {
            case 'database': {
              const { error: dbError } = await supabase.from('algorithm_status').select('count').limit(1);
              status = !dbError;
              if (dbError) error = dbError.message;
              break;
            }
            case 'broker': {
              const { data: integrations } = await supabase
                .from('broker_integrations')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .limit(1);
              status = integrations && integrations.length > 0;
              if (!status) error = 'No active broker integration found';
              break;
            }
            case 'api': {
              // Test trading engine API
              const response = await fetch(`${supabaseUrl}/functions/v1/trader-signals`);
              status = response.ok;
              if (!status) error = `API returned ${response.status}`;
              break;
            }
            default:
              status = true;
          }
        } catch (e) {
          error = e.message;
        }

        const responseTime = Date.now() - startTime;

        // Store connection health
        await supabase.from('connection_health').insert({
          user_id: user.id,
          connection_name: connectionType,
          connection_type: connectionType,
          status,
          response_time_ms: responseTime,
          last_error: error,
        });

        return new Response(
          JSON.stringify({ status, responseTime, error }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_algorithm_status': {
        // Get or create default algorithm status
        let { data: statusData } = await supabase
          .from('algorithm_status')
          .select('*')
          .eq('user_id', user.id)
          .limit(10);

        if (!statusData || statusData.length === 0) {
          // Create default status entry
          const { data: newStatus } = await supabase
            .from('algorithm_status')
            .insert({
              user_id: user.id,
              algorithm_id: 'main-algo',
              algorithm_name: 'Main Trading Algorithm',
              status: 'running',
              last_activity: new Date().toISOString(),
            })
            .select();
          statusData = newStatus || [];
        }

        return new Response(
          JSON.stringify({ algorithms: statusData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_logs': {
        const { severity, limit = 50, offset = 0 } = params;
        let query = supabase
          .from('diagnostic_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .range(offset, offset + limit - 1);

        if (severity) {
          query = query.eq('severity', severity);
        }

        const { data: logs, count } = await query;

        return new Response(
          JSON.stringify({ logs: logs || [], total: count || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add_log': {
        const { severity, message, algorithmName, details, stackTrace } = params;
        
        await supabase.from('diagnostic_logs').insert({
          user_id: user.id,
          severity,
          message,
          algorithm_name: algorithmName,
          details,
          stack_trace: stackTrace,
        });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_metrics': {
        const { timeRange = '24h' } = params;
        const now = new Date();
        let startDate = new Date(now);

        switch (timeRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '24h':
            startDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }

        const { data: metrics } = await supabase
          .from('algorithm_metrics')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: true });

        return new Response(
          JSON.stringify({ metrics: metrics || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_alerts': {
        const { data: alerts } = await supabase
          .from('alert_history')
          .select('*, alert_rules(*)')
          .eq('user_id', user.id)
          .order('triggered_at', { ascending: false })
          .limit(50);

        return new Response(
          JSON.stringify({ alerts: alerts || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Diagnostics error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
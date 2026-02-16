import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const method = req.method;
    const prospectId = pathParts[2];

    if (method === 'GET') {
      if (prospectId && pathParts[3] === 'reports') {
        const { data, error } = await supabaseClient
          .from('prospect_reports')
          .select('*')
          .eq('prospect_id', prospectId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (prospectId) {
        const { data, error } = await supabaseClient
          .from('prospects')
          .select('*')
          .eq('id', prospectId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(JSON.stringify({ error: 'Prospect not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (method === 'POST') {
      const body = await req.json();

      if (prospectId && pathParts[3] === 'reports') {
        const { data, error } = await supabaseClient
          .from('prospect_reports')
          .insert({
            prospect_id: prospectId,
            user_id: user.id,
            report_type: body.report_type,
            report_data: body.report_data,
            status: body.status || 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const existingCheck = await supabaseClient
          .from('prospects')
          .select('id')
          .eq('user_id', user.id)
          .eq('place_id', body.place_id)
          .maybeSingle();

        if (existingCheck.data) {
          return new Response(JSON.stringify({
            error: 'Prospect already exists',
            prospect_id: existingCheck.data.id
          }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabaseClient
          .from('prospects')
          .insert({
            user_id: user.id,
            place_id: body.place_id,
            business_name: body.business_name,
            address: body.address,
            phone: body.phone,
            website: body.website,
            rating: body.rating,
            total_ratings: body.total_ratings,
            types: body.types || []
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (method === 'PUT' && prospectId) {
      const body = await req.json();

      const { data, error } = await supabaseClient
        .from('prospects')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (method === 'DELETE' && prospectId) {
      const { error } = await supabaseClient
        .from('prospects')
        .delete()
        .eq('id', prospectId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LoginRequest {
  email: string;
  password: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password }: LoginRequest = await req.json();

    const teacherEmail = Deno.env.get("TEACHER_EMAIL");
    const teacherPassword = Deno.env.get("TEACHER_PASSWORD");

    console.log("Login attempt for email:", email);
    console.log("TEACHER_EMAIL exists:", !!teacherEmail);
    console.log("TEACHER_PASSWORD exists:", !!teacherPassword);

    if (!teacherEmail || !teacherPassword) {
      console.error("Teacher credentials not configured");
      return new Response(
        JSON.stringify({ valid: false, error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailMatch = email.trim().toLowerCase() === teacherEmail.trim().toLowerCase();
    const passwordMatch = password === teacherPassword;
    
    console.log("Email match:", emailMatch);
    console.log("Password match:", passwordMatch);

    const isValid = emailMatch && passwordMatch;

    return new Response(
      JSON.stringify({ valid: isValid }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in teacher-login:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ensureTrialCreditsForUser } from "@/lib/billing/credits";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to");

  // 1️⃣ OAuth provider error
  if (errorParam) {
    console.error("OAuth provider error:", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        errorParam,
      )}&message=${encodeURIComponent(
        errorDescription || "Authentication failed",
      )}`,
    );
  }

  console.log("code", code); // ✅ Fixed syntax
  console.log(errorDescription);
  console.log(origin);
  console.log(redirectTo);
  console.log(errorParam);
  // 2️⃣ OAuth code exchange
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Session exchange error:", error);
      const isCodeExpiredOrInvalid =
        error.message?.toLowerCase().includes("expired") ||
        error.message?.toLowerCase().includes("invalid") ||
        error.message?.toLowerCase().includes("already been used") ||
        error.status === 400;

      if (isCodeExpiredOrInvalid) {
        return NextResponse.redirect(
          `${origin}/login?error=code_expired&message=${encodeURIComponent(
            "Your login session expired. Please try again.",
          )}`,
        );
      }
      return NextResponse.redirect(`${origin}/login?error=session_exchange`); // ✅ Fixed
    }

    // Initialize trial credits (first login)
    try {
      await ensureTrialCreditsForUser(data.user.id);
    } catch (e) {
      // Non-blocking: credits can be created later from the dashboard.
      console.error("Failed to ensure trial credits", e);
    }

    // 2️⃣ Check onboarding status
    const { data: workspace } = await supabase
      .from("workspace_users")
      .select("*")
      .eq("auth_user_id", data.user.id)
      .single();

    console.log("workspace", workspace); // ✅ Fixed

    // 3️⃣ Redirect based on onboarding
    if (!workspace) {
      return NextResponse.redirect(`${origin}/onboarding`); // ✅ Fixed - needs template literal
    }

    return NextResponse.redirect(`${origin}/dashboard`); // ✅ Fixed
  }

  // 4️⃣ Fallback redirect
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`); // ✅ Fixed
  }

  return NextResponse.redirect(`${origin}/login?error=missing_params`); // ✅ Fixed
}

// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";
// // The client you created from the Server-Side Auth instructions

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   // if "next" is in param, use it as the redirect URL
//   let next = searchParams.get("next") ?? "/";
//   if (!next.startsWith("/")) {
//     // if "next" is not a relative URL, use the default
//     next = "/";
//   }

//   if (code) {
//     const supabase = await createClient();
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
//       const isLocalEnv = process.env.NODE_ENV === "development";
//       if (isLocalEnv) {
//         // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
//         return NextResponse.redirect(`${origin}${next}`);
//       } else if (forwardedHost) {
//         return NextResponse.redirect(`https://${forwardedHost}${next}`);
//       } else {
//         return NextResponse.redirect(`${origin}${next}`);
//       }
//     }
//   }

//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }

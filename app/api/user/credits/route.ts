import { NextResponse } from "next/server";

import { ensureTrialCreditsForUser, getCreditsForUser } from "@/lib/billing/credits";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTrialCreditsForUser(user.id);
  const credits = await getCreditsForUser(user.id);

  return NextResponse.json({ credits });
}

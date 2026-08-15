import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "./src/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};

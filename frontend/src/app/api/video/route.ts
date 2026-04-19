import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Remotion preview available in dashboard. Server-side rendering/export can be attached to render infrastructure.",
  });
}

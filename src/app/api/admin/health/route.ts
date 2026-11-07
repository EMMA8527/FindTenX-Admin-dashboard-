import { NextResponse } from "next/server";
import { getDataSourceMeta } from "@/lib/db/bootstrap";
import { dbHealth } from "@/lib/db/queries";

export async function GET() {
  try {
    const health = dbHealth();
    const meta = getDataSourceMeta();
    return NextResponse.json({ ...health, dataSource: meta });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database unavailable",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheet";

const SHEET = "CategoryCapacity";

export async function GET() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A2:B`,
  });

  const rows = response.data.values || [];

  const capacities = rows.map((row) => ({
    category: row[0],
    capacity: Number(row[1]),
  }));

  return NextResponse.json(capacities);
}

export async function POST(req: Request) {
  const body = await req.json();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A:B`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[body.category, body.capacity]],
    },
  });

  return NextResponse.json({ success: true });
}
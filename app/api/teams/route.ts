import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheet";

const SHEET = "Teams";

export async function GET() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A2:B`,
  });

  const rows = response.data.values || [];

  const teams = rows
  .filter((row) => row[0] && row[1])
  .map((row) => ({
    id: Number(row[0]),
    name: row[1],
  }));

  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const body = await req.json();

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A2:A`,
  });

  const nextId = (existing.data.values?.length || 0) + 1;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A:B`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[nextId, body.name]],
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const teamId = Number(body.id);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A2:B`,
  });

  const rows = response.data.values || [];

  const rowIndex = rows.findIndex((row) => Number(row[0]) === teamId);

  if (rowIndex === -1) {
    return NextResponse.json(
      { error: "Team not found" },
      { status: 404 }
    );
  }

  const sheetRowNumber = rowIndex + 2;

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${SHEET}!A${sheetRowNumber}:B${sheetRowNumber}`,
  });

  return NextResponse.json({ success: true });
}
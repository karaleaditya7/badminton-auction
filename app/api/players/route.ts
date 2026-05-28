import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheet";

const SHEET_NAME = "Players";

export async function GET() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:D`,
  });

  const rows = response.data.values || [];

  const players = rows.map((row) => ({
    id: Number(row[0]),
    name: row[1],
    mobile: row[2],
    age: row[3],
  }));

  return NextResponse.json(players);
}

export async function POST(req: Request) {
  const body = await req.json();

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:A`,
  });

  const nextSrNo = (existing.data.values?.length || 0) + 1;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[nextSrNo, body.name, body.mobile, body.category]],
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const playerId = Number(body.id);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:D`,
  });

  const rows = response.data.values || [];

  const rowIndex = rows.findIndex((row) => Number(row[0]) === playerId);

  if (rowIndex === -1) {
    return NextResponse.json(
      { error: "Player not found" },
      { status: 404 }
    );
  }

  const sheetRowNumber = rowIndex + 2;

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${sheetRowNumber}:D${sheetRowNumber}`,
  });

  return NextResponse.json({ success: true });
}
import { NextResponse } from "next/server";
import { sheets, SHEET_ID } from "@/lib/googleSheet";

const SHEET = "Categories";

export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET}!A2:A`,
    });

    const rows = response.data.values || [];

    return NextResponse.json(rows.flat().filter(Boolean));
  } catch (error) {
    console.error("GET_CATEGORIES_ERROR:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET}!A:A`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[body.category]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CREATE_CATEGORY_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const categoryToDelete = body.category;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET}!A2:A`,
    });

    const rows = response.data.values || [];

    const rowIndex = rows.findIndex((row) => row[0] === categoryToDelete);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const sheetRowNumber = rowIndex + 2;

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${SHEET}!A${sheetRowNumber}:A${sheetRowNumber}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_CATEGORY_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
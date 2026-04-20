import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const tableName = "stacks";
    console.log("Deleting from table:", tableName, "ID:", id);

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);
      
    if (error) {
      if (error.code === '42P01') {
        console.warn(`Table "${tableName}" does not exist. Run this in Supabase SQL Editor:`);
        console.warn(`CREATE TABLE ${tableName} (id text primary key, created_at timestamp default now());`);
        // Bypass the error and return 200 so the UI continues working normally
        return NextResponse.json({ success: true, warning: 'Table did not exist' }, { status: 200 });
      }

      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Error in delete stack route:", err);
    return NextResponse.json({ error: "Failed to delete stack" }, { status: 500 });
  }
}

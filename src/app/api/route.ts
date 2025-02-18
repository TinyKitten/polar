import type { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";
import jsSHA from "jssha/sha256";

export const config = {
	runtime: "edge",
};

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_KEY ?? "";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "unknown";

	const shaObj = new jsSHA("SHA-256", "TEXT", {
		hmacKey: { value: process.env.HAMAC_KEY ?? "", format: "TEXT" },
	});

	const kvKey = shaObj.update(ip).getHash("HEX");
	const kvValue = await request.json();

	const { error } = await supabase.from("dumps").insert({
		publisher_id: kvKey,
		json: kvValue,
	});

	if (error) {
		console.error(error);
		return new Response(
			JSON.stringify({ success: false, error: error.message }),
			{
				status: 500,
			},
		);
	}

	return new Response(JSON.stringify({ success: true, key: kvKey, ip }), {
		status: 201,
	});
}

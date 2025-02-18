"use client";

import type { Json } from "@/types/database.types";
import JsonView from "@uiw/react-json-view";
export default function Viewer({
	json,
}: {
	json: Json[];
}) {
	return <JsonView value={json} />;
}

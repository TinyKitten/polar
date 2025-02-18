"use client";

import type { Database, Json } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useRemoteJSON = (publisherId: string) => {
	const [json, setJson] = useState<Json[]>([]);

	useEffect(() => {
		let channel: RealtimeChannel;
		(async () => {
			const supabase = await createClient();

			const { data: dump } = await supabase
				.from("dumps")
				.select("*")
				.order("id", { ascending: false })
				.eq("publisher_id", publisherId);

			setJson(dump?.map((v) => v.json) ?? []);

			channel = supabase
				.channel("custom-insert-channel")
				.on(
					"postgres_changes",
					{ event: "INSERT", schema: "public", table: "dumps" },
					(payload) => {
						const dump =
							payload.new as Database["public"]["Tables"]["dumps"]["Row"];
						if (dump.publisher_id === publisherId) {
							setJson((prev) => [dump.json, ...prev]);
						}
					},
				)
				.subscribe();
		})();

		return () => {
			channel?.unsubscribe();
		};
	}, [publisherId]);

	return json;
};

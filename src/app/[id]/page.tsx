"use client";
import Viewer from "@/components/Viewer";
import { useRemoteJSON } from "@/hooks/useRemoteJSON";
import { useParams } from "next/navigation";

export default function Home() {
	const { id } = useParams();

	const json = useRemoteJSON(id as string);

	return <Viewer json={json} />;
}

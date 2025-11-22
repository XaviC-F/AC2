'use client'

import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import ObjectiveList from "@/components/ObjectiveList";

export interface PublishedObjective {
  id: string,
  title: string;
  description: string;
  resolutionDate: string; // ISO string of future resolution date
  commitedPeople: string[]; // List of people who committed
}

export default function PublishedObjectiveList() {
    const [objectives, setObjectives] = useState<PublishedObjective[] | null>(null);
        
    useEffect(() => {
    let cancelled = false;

    async function loadObjective() {
        try {
        const res = await fetch(`${API_URL}recently_published`,
            {method: "GET"});
        if (!res.ok) throw new Error(`Failed to load objectives (${res.status})`);

        const data = await res.json();
        if (cancelled) return;

        setObjectives(data);
        } catch (e) {
        const message = (e instanceof Error ? e.message : String(e)) || "Failed to load objectives";
        alert(message);
        }
    }

    loadObjective();
    return () => { cancelled = true; };
    }, []);


    return (
        <ObjectiveList title='Recently published objectives' pageItems={objectives} route='/recently_published' />
    );
}

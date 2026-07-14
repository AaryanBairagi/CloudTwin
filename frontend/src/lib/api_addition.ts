import { SimulationResult } from "@/types/simulation"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function simulateTwin( twinId:string , loadMultiplier:number ) : Promise<SimulationResult>{
    const response = await fetch(`${API_BASE}/simulate` , {
        method : "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({twinId,loadMultiplier})

    });
    if(!response.ok) throw new Error("Simulation Failed.");
    return response.json();
}
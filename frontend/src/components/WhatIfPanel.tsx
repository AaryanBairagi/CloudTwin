"use client";

import { useState } from "react";

import { simulateTwin } from "@/lib/api_addition";
import { SimulationResult } from "@/types/simulation";

type Props = {
    twinId: string;
};

export default function WhatIfPanel({ twinId }: Props) {

    const [loadMultiplier, setLoadMultiplier] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    async function handleSimulation() {
        try {
            setLoading(true);
            const prediction = await simulateTwin(twinId,loadMultiplier);
            setResult(prediction);
        } catch (err) {
            console.error(err);
            alert("Simulation failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-lg space-y-6 border p-6">
            <h2 className="text-lg font-semibold">What If Simulation</h2>
            <div className="space-y-2">
                <label className="font-medium">Load Multiplier: {loadMultiplier.toFixed(1)}x</label>
                <input 
                    type = "range"
                    min = "0.5"
                    max = "3"
                    step = "0.1"
                    value = {loadMultiplier}
                    onChange = {
                        (e) => setLoadMultiplier(Number(e.target.value))
                    }
                    className="w-full"
                />

                <button 
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                    onClick={handleSimulation}
                >
                    {loading ? "Simulating..." : "Run Simulation"}
                </button>
            </div>
        </div>
    );
}
"use client";
import dynamic from "next/dynamic";

const SynapseChat = dynamic(() => import("./main"), { ssr: false });

export default function ClientSynapse() {
  return <SynapseChat />;
}
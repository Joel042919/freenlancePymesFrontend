"use client";

import { useParams } from "next/navigation";
import ContractDetail from "@/components/contracts/ContractDetail";

export default function PymeContractDetailPage() {
  const params = useParams<{ id: string }>();
  return <ContractDetail contractId={params.id} backHref="/pyme/contratos" />;
}

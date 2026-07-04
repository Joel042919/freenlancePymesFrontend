"use client";

import { useParams } from "next/navigation";
import ContractDetail from "@/components/contracts/ContractDetail";

export default function FreelancerContractDetailPage() {
  const params = useParams<{ id: string }>();
  return <ContractDetail contractId={params.id} backHref="/freelancer/contratos" />;
}

import React from "react";

export default async function FreelancerPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold text-brand-dark">Portafolio del Freelancer</h1>
      <p className="text-slate-500">ID del Portafolio: {id}</p>
    </div>
  );
}

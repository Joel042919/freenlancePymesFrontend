"use client";

import React, { useState, useEffect, use } from "react";
import FormularioPortafolio, { PortfolioData } from "@/app/features/portafolio/components/FormularioPortafolio";

export default function FreelancerPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initialData, setInitialData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem('jwt_token');
      const userId = localStorage.getItem('user_id');

      if (!token || !userId) {
        console.error("No autenticado");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/portafolios/freelancer/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const portafolios: PortfolioData[] = await res.json();
          const portfolio = portafolios.find(p => p.id === id);
          if (portfolio) {
            setInitialData(portfolio);
          }
        }
      } catch (error) {
        console.error("Error fetching portfolio", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando datos del proyecto...</div>;
  }

  return (
    <div className="p-8 font-sans">
      <FormularioPortafolio initialData={initialData} />
    </div>
  );
}

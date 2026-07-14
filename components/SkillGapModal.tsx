"use client";

import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, Copy, Save, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";

export interface StudyModule {
  week: number;
  title: string;
  topics: string[];
}

export interface StudyPlan {
  skill: string;
  title: string;
  description: string;
  duration: string;
  modules: StudyModule[];
}

export interface SkillGapBody {
  error: string;
  missingSkills: string[];
  studyPlans: Record<string, StudyPlan>;
}

interface SkillGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillGap: SkillGapBody | null;
}

export function SkillGapModal({ isOpen, onClose, skillGap }: SkillGapModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  if (!skillGap) return null;

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      
      let y = 20;
      const marginX = 20;
      const maxWidth = 170;

      pdf.setFontSize(18);
      pdf.setTextColor(30, 41, 59); // brand-dark
      pdf.text("Plan de Nivelación", marginX, y);
      y += 10;

      Object.values(skillGap.studyPlans).forEach(plan => {
        if (y > 270) { pdf.addPage(); y = 20; }
        
        pdf.setFontSize(14);
        pdf.setTextColor(13, 162, 147); // brand-teal
        pdf.setFont("helvetica", "bold");
        pdf.text(plan.title, marginX, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        const splitDesc = pdf.splitTextToSize(plan.description, maxWidth);
        pdf.text(splitDesc, marginX, y);
        y += splitDesc.length * 5 + 5;

        pdf.setTextColor(30, 41, 59);
        plan.modules.forEach(mod => {
          if (y > 270) { pdf.addPage(); y = 20; }
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Semana ${mod.week}: ${mod.title}`, marginX, y);
          y += 6;

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          mod.topics.forEach(t => {
            if (y > 280) { pdf.addPage(); y = 20; }
            const splitTopic = pdf.splitTextToSize(`• ${t}`, maxWidth - 5);
            pdf.text(splitTopic, marginX + 5, y);
            y += splitTopic.length * 5;
          });
          y += 4;
        });
      });

      pdf.save("ruta-aprendizaje.pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  const handleCopyText = () => {
    let text = "Ruta de Aprendizaje\n\n";
    Object.values(skillGap.studyPlans).forEach(plan => {
      text += `${plan.title}\n${plan.description}\nDuración: ${plan.duration}\n\n`;
      plan.modules.forEach(mod => {
        text += `${mod.title}\n`;
        mod.topics.forEach(t => text += ` - ${t}\n`);
        text += "\n";
      });
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // In a real app, send to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto p-6 sm:p-10">
        <DialogHeader className="text-left mb-2">
          <DialogTitle className="text-2xl font-extrabold text-brand-purple">Te faltan habilidades validadas</DialogTitle>
          <DialogDescription className="text-sm font-semibold text-slate-900 mt-2">
            {skillGap.error}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap justify-start gap-2 mb-2">
          {skillGap.missingSkills.map((skill) => (
            <span key={skill} className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-700">
              {skill}
            </span>
          ))}
        </div>

        <div ref={contentRef} className="mt-2 space-y-6 bg-white">
          {Object.entries(skillGap.studyPlans).map(([skill, plan]) => (
            <div key={skill} className="transition-all duration-300 ease-in-out">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-brand-dark text-xl">{plan.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleCopyText} className="gap-2 transition-all">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2 transition-all">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button size="sm" onClick={handleSave} className="gap-2 bg-brand-teal hover:bg-brand-teal/90 text-white transition-all">
                    {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "¡Guardado!" : "Guardar"}
                  </Button>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-xs font-bold text-brand-teal bg-brand-light-teal px-3 py-1 rounded-full">
                  Duración: {plan.duration}
                </span>
              </div>

              <div className="mt-6 relative">
                {/* Connecting line for roadmap */}
                <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-slate-200 z-0"></div>

                <Accordion className="space-y-4">
                  {plan.modules.map((mod) => (
                    <AccordionItem key={mod.week} value={mod.week.toString()} className="border-none relative z-10">
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-sm shrink-0 border-4 border-white shadow-sm mt-1">
                          {mod.week}
                        </div>
                        <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 transition-all duration-300">
                          <AccordionTrigger className="hover:no-underline font-semibold text-slate-700 py-3 text-sm cursor-pointer">
                            {mod.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600 pb-4">
                            <ul className="space-y-2 mt-2">
                              {mod.topics.map((topic, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5"></span>
                                  <span className="text-sm leading-relaxed">{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </div>
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>


      </DialogContent>
    </Dialog>
  );
}

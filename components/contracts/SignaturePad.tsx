"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

const SIGNATURE_IMAGE_SRC = "/firma-ejemplo.svg";

interface SignaturePadProps {
  onSign: (signatureImage: string) => void;
  signing?: boolean;
}

export default function SignaturePad({ onSign, signing }: SignaturePadProps) {
  return (
    <div className="space-y-3">
      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
        <Image src={SIGNATURE_IMAGE_SRC} alt="Firma digital" fill className="object-contain p-2" />
      </div>
      <p className="text-xs text-slate-400">
        Esta es tu firma digital registrada. Al confirmar, quedará asociada a este contrato.
      </p>
      <Button
        type="button"
        disabled={signing}
        onClick={() => onSign(SIGNATURE_IMAGE_SRC)}
        className="w-full rounded-2xl h-10 px-6 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold"
      >
        {signing ? "Firmando..." : "Confirmar y firmar contrato"}
      </Button>
    </div>
  );
}

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md rounded-3xl border-slate-100 shadow-xl shadow-slate-100/50">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Acceso denegado</h1>
          <p className="text-sm text-slate-500">
            No tienes permisos para ver esta página con tu rol actual. Si crees que esto es un error, cierra sesión e ingresa con la cuenta correcta.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants(),
              "mt-2 h-10 rounded-2xl bg-brand-purple px-4 text-white font-bold hover:bg-brand-purple/90"
            )}
          >
            Volver a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Linkedin, CheckCircle2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Credenciales incorrectas.");
      }

      setSession({
        token: data.token,
        role: data.role || "FREELANCER",
        email: data.email || email,
        expiresIn: data.expiresIn,
      });

      setSuccess(true);

      setTimeout(() => {
        if (data.role === "PYME") {
          router.push("/pyme/aplicaciones");
        } else {
          router.push("/freelancer/portafolio/me");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      {/* Cabecera Móvil y Título */}
      <div className="space-y-3 text-center lg:text-left">
        {/* Logo para móvil */}
        <div className="flex items-center justify-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple text-white font-bold">
            S
          </div>
          <span className="text-xl font-black text-brand-dark">Skill<span className="text-brand-purple">Up</span></span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark">
          Ingresa a tu cuenta
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          Digita tus credenciales para ingresar a la plataforma
        </p>
      </div>

      <Card className="border-slate-100 shadow-xl shadow-slate-100/50 bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Mensajes de Alerta */}
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-brand-light-teal p-4 text-xs font-semibold text-brand-teal border border-brand-teal/20 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>¡Sesión iniciada con éxito! Redirigiendo...</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-500 font-semibold text-xs tracking-wider">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 rounded-2xl border-slate-200 h-12 focus:ring-brand-purple focus:border-brand-purple bg-slate-50/50"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-500 font-semibold text-xs tracking-wider">
                  Contraseña
                </Label>
                <Link
                  href="#"
                  onClick={(e) => { e.preventDefault(); setError("La recuperación de contraseña se implementará en una versión futura."); }}
                  className="text-xs font-bold text-brand-purple hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 rounded-2xl border-slate-200 h-12 focus:ring-brand-purple focus:border-brand-purple bg-slate-50/50"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Botón de Enviar */}
            <Button
              type="submit"
              className="w-full rounded-2xl h-12 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold transition-all duration-300 shadow-md shadow-brand-purple/20"
              disabled={loading || success}
            >
              {loading ? "Iniciando sesión..." : "Ingresar"}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold">O ingresa con</span>
            </div>
          </div>

          {/* Registro Social */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setError("Ingreso con Google no integrado. Enlace listo para el backend.")}
              className="rounded-2xl border-slate-200 h-12 hover:bg-slate-50/50 text-slate-600 font-semibold gap-2"
              disabled={loading || success}
            >
              <Chrome className="h-4 w-4 text-red-500" />
              <span>Google</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setError("Ingreso con LinkedIn no integrado. Enlace listo para el backend.")}
              className="rounded-2xl border-slate-200 h-12 hover:bg-slate-50/50 text-slate-600 font-semibold gap-2"
              disabled={loading || success}
            >
              <Linkedin className="h-4 w-4 text-blue-600" />
              <span>LinkedIn</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enlace a Registro */}
      <p className="text-center text-sm font-medium text-slate-500">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-brand-teal hover:underline font-bold">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

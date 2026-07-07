"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Linkedin, CheckCircle2, User, Building2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("FREELANCER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validation helper
  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return minLength && hasUpper && hasLower && hasDigit && hasSpecial;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password || !role) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!validatePassword(password)) {
      setError("La contraseña no cumple los requisitos mínimos de seguridad: debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el usuario.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor.");
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal text-white font-bold">
            S
          </div>
          <span className="text-xl font-black text-brand-dark">Skill<span className="text-brand-teal">Up</span></span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark">
          Regístrate en la plataforma
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          Obtén acceso completo y comienza a crecer hoy mismo
        </p>
      </div>

      <Card className="border-slate-100 shadow-xl shadow-slate-100/50 bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Mensajes de Alerta */}
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-brand-light-teal p-4 text-xs font-semibold text-brand-teal border border-brand-teal/20 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>¡Registro exitoso! Redirigiendo al inicio de sesión...</span>
              </div>
            )}

            {/* Rol Selector */}
            <div className="space-y-3">
              <Label className="text-slate-500 font-semibold text-xs tracking-wider">
                Selecciona tu rol
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Radio Freelancer */}
                <button
                  type="button"
                  onClick={() => setRole("FREELANCER")}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    role === "FREELANCER"
                      ? "border-brand-teal bg-brand-light-teal/30 shadow-sm ring-1 ring-brand-teal"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    role === "FREELANCER" ? "bg-brand-teal text-white" : "bg-slate-100 text-brand-teal"
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700">Freelancer</p>
                    <p className="text-[10px] text-slate-400 truncate">Busco proyectos</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    role === "FREELANCER" ? "border-brand-teal" : "border-slate-300"
                  }`}>
                    {role === "FREELANCER" && <div className="h-2 w-2 rounded-full bg-brand-teal" />}
                  </div>
                </button>

                {/* Radio PYME */}
                <button
                  type="button"
                  onClick={() => setRole("PYME")}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    role === "PYME"
                      ? "border-brand-purple bg-brand-light-purple/30 shadow-sm ring-1 ring-brand-purple"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    role === "PYME" ? "bg-brand-purple text-white" : "bg-slate-100 text-brand-purple"
                  }`}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700">Pymes</p>
                    <p className="text-[10px] text-slate-400 truncate">Busco talento</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    role === "PYME" ? "border-brand-purple" : "border-slate-300"
                  }`}>
                    {role === "PYME" && <div className="h-2 w-2 rounded-full bg-brand-purple" />}
                  </div>
                </button>
              </div>
            </div>

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
                  className="pl-12 rounded-2xl border-slate-200 h-12 focus:ring-brand-teal focus:border-brand-teal bg-slate-50/50"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-500 font-semibold text-xs tracking-wider">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 rounded-2xl border-slate-200 h-12 focus:ring-brand-teal focus:border-brand-teal bg-slate-50/50"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-500 font-semibold text-xs tracking-wider">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 rounded-2xl border-slate-200 h-12 focus:ring-brand-teal focus:border-brand-teal bg-slate-50/50"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Botón de Enviar */}
            <Button
              type="submit"
              className="w-full rounded-2xl h-12 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold transition-all duration-300 shadow-md shadow-brand-teal/20"
              disabled={loading || success}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold">O regístrate con</span>
            </div>
          </div>

          {/* Registro Social */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setError("Registro con Google no integrado. Enlace listo para el backend.")}
              className="rounded-2xl border-slate-200 h-12 hover:bg-slate-50/50 text-slate-600 font-semibold gap-2"
              disabled={loading || success}
            >
              <Chrome className="h-4 w-4 text-red-500" />
              <span>Google</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setError("Registro con LinkedIn no integrado. Enlace listo para el backend.")}
              className="rounded-2xl border-slate-200 h-12 hover:bg-slate-50/50 text-slate-600 font-semibold gap-2"
              disabled={loading || success}
            >
              <Linkedin className="h-4 w-4 text-blue-600" />
              <span>LinkedIn</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enlace a Login */}
      <p className="text-center text-sm font-medium text-slate-500">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-brand-purple hover:underline font-bold">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

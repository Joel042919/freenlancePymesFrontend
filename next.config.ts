import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Next infería la raíz del workspace como C:\Users\FATIMA (por un lockfile ahí),
  // lo que hacía que Turbopack generara identificadores de chunk con la ruta completa
  // "...Ingeniería Web..." y truncara justo en medio del carácter "í" (panic de Rust
  // por un byte-boundary inválido) al compilar /pyme/contratos. Fijar la raíz aquí
  // evita que esa ruta larga con tildes entre en los identificadores.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

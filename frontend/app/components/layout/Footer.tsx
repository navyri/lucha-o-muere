'use client';

import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#222] text-gray-400 py-4 px-8 shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-sm">
          © {new Date().getFullYear()} Lucha o Muere. Todos los derechos reservados.
        </div>
        <Link
          href="https://github.com/1tsm1ri"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 hover:text-red-600 transition-colors"
          aria-label="Perfil de GitHub de 1tsm1ri"
        >
          <Github className="w-5 h-5 text-gray-400 hover:text-red-600" />
          <span className="text-sm font-semibold text-red-700">Mariana Esguerra</span>
        </Link>
      </div>
    </footer>
  );
}

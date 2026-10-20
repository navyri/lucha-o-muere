import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
<main className="grid min-h-full place-items-center bg-[#1a1a1a] px-6 py-24 sm:py-32 lg:px-8">
  <div className="text-center">
    <p className="text-base font-semibold text-red-600">404</p>
    <img
          src="https://cdnb.artstation.com/p/assets/images/images/063/365/995/original/gustavo-soares-health-potion.gif?1685378302"
          alt="errorS"
          className="mx-auto w-45 rounded"
        />
    <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance text-red-600 sm:text-5xl">Pagina no encontrada</h1>
    <p className="mt-6 text-lg font-medium text-pretty text-white sm:text-xl/8">Perdon, no se pudo encontrar la pagina que buscadas.</p>
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <a href="/" className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Volver al inicio</a>
    </div>
  </div>
</main>
  );
}

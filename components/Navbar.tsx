import Link from "next/link";

export default function Navbar() 
{
  return (
    <header className="w-full border-b border-white/10">
      <nav className="max-w-5xl mx-auto flex justify-center gap-12 py-8 text-sm">
        <a href="/" className="hover:text-white transition">
          Home
        </a>
        <a href="/projects" className="hover:text-white transition">
          Projects
        </a>
        <a href="/resume" className="hover:text-white transition">
          Resume
        </a>
      </nav>
    </header>
  );
}

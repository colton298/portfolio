import Link from "next/link";

export default function Navbar() 
{
  return (
    <header className="w-full border-b border-white/10">
      <nav className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-3 px-4 py-8 text-sm sm:gap-x-12">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <Link href="/experience" className="hover:text-white transition">
          Experience
        </Link>
        <Link href="/resume" className="hover:text-white transition">
          Resume
        </Link>
      </nav>
    </header>
  );
}

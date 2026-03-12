import Link from 'next/link'

export default function Header() {
  return (
    <nav className="px-8 py-6 flex justify-between items-center max-w-[1100px] mx-auto">
      <Link href="/" className="font-extrabold text-xl text-[#1a1a1a] no-underline">
        Gde sa decom?
      </Link>
      <Link href="/privacy" className="text-[#666] text-sm hover:text-[#1a1a1a] transition-colors">
        Privatnost
      </Link>
    </nav>
  )
}

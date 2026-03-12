import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[#eee] py-12 px-8 text-center text-[#888] text-sm">
      <div className="mb-4 space-x-8">
        <Link href="/privacy" className="text-[#666] hover:text-[#1a1a1a] transition-colors">
          Politika privatnosti
        </Link>
        <a
          href="mailto:kontakt@gdesadecom.rs"
          className="text-[#666] hover:text-[#1a1a1a] transition-colors"
        >
          Kontakt
        </a>
      </div>
      <p>© {new Date().getFullYear()} Gde sa decom?</p>
    </footer>
  )
}

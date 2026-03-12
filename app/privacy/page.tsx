import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Politika privatnosti - Igralište | Gde sa decom?',
  description: 'Politika privatnosti aplikacije Igralište i platforme Gde sa decom?',
  alternates: {
    canonical: 'https://gdesadecom.rs/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-[800px] mx-auto px-8 py-16">
        <h1 className="font-extrabold text-4xl mb-4">Politika privatnosti</h1>
        <p className="text-[#888] mb-12 text-sm">Poslednja izmena: Februar 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="font-bold text-xl mb-3">1. Uvod</h2>
            <p className="text-[#555] leading-relaxed">
              Dobrodošli u Igralište, mobilnu aplikaciju platforme &quot;Gde sa decom?&quot;. Ova
              politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše lične
              podatke. Korišćenjem aplikacije, prihvatate prakse opisane u ovom dokumentu.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">2. Podaci koje prikupljamo</h2>
            <h3 className="font-semibold text-base mb-2">2.1 Podaci koje vi dajete</h3>
            <ul className="list-disc pl-6 text-[#555] space-y-1">
              <li>Email adresa i lozinka pri registraciji</li>
              <li>Ime i prezime</li>
              <li>Informacije o deci (ime, datum rođenja, pol) — opciono</li>
              <li>Informacije o organizaciji za pružaoce usluga</li>
            </ul>
            <h3 className="font-semibold text-base mb-2 mt-4">2.2 Automatski prikupljeni podaci</h3>
            <ul className="list-disc pl-6 text-[#555] space-y-1">
              <li>Podaci o uređaju i operativnom sistemu</li>
              <li>Podaci o korišćenju aplikacije (pregledane aktivnosti, pretrage)</li>
              <li>IP adresa i podaci o lokaciji (uz vašu dozvolu)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">3. Kako koristimo vaše podatke</h2>
            <ul className="list-disc pl-6 text-[#555] space-y-2">
              <li>Pružanje i poboljšanje usluge</li>
              <li>Personalizacija preporuka aktivnosti</li>
              <li>Komunikacija između roditelja i pružalaca aktivnosti</li>
              <li>Analitika korišćenja radi poboljšanja aplikacije</li>
              <li>Slanje obaveštenja (uz vašu dozvolu)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">4. Deljenje podataka</h2>
            <p className="text-[#555] leading-relaxed mb-3">
              Vaše podatke ne prodajemo trećim stranama. Podatke možemo deliti sa:
            </p>
            <ul className="list-disc pl-6 text-[#555] space-y-1">
              <li>
                <strong>Supabase</strong> — baza podataka i autentifikacija (EU serveri)
              </li>
              <li>
                <strong>Google Analytics</strong> — analitika korišćenja (anonimizovano)
              </li>
              <li>Nadležnim organima u slučaju zakonske obaveze</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">5. Bezbednost podataka</h2>
            <p className="text-[#555] leading-relaxed">
              Koristimo standardne bezbednosne mere: SSL enkripcija, sigurno čuvanje lozinki
              (hashing), Row Level Security na bazi podataka. Nijedan sistem nije 100% siguran, ali
              preduzimamo sve razumne korake za zaštitu vaših podataka.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">6. Vaša prava</h2>
            <ul className="list-disc pl-6 text-[#555] space-y-1">
              <li>Pravo na pristup vašim podacima</li>
              <li>Pravo na ispravku netačnih podataka</li>
              <li>Pravo na brisanje naloga i podataka</li>
              <li>Pravo na prenosivost podataka</li>
              <li>Pravo na povlačenje saglasnosti</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">7. Deca</h2>
            <p className="text-[#555] leading-relaxed">
              Aplikacija je namenjena roditeljima. Direktno ne prikupljamo podatke od dece mlađe od
              13 godina bez roditeljske saglasnosti.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl mb-3">8. Kontakt</h2>
            <p className="text-[#555] leading-relaxed">
              Za pitanja o privatnosti, kontaktirajte nas:{' '}
              <a href="mailto:kontakt@gdesadecom.rs" className="text-[#1a1a1a] underline">
                kontakt@gdesadecom.rs
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

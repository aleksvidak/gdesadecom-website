import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/ActivityCard'
import { getPublishedActivities } from '@/lib/supabase'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const activities = await getPublishedActivities(12)

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-8 py-20 pb-30 grid grid-cols-1 md:grid-cols-[1fr_380px] gap-20 items-center">
        <div>
          <h1 className="font-extrabold text-5xl md:text-[3.5rem] leading-[1.1] mb-6 text-[#1a1a1a]">
            Pronađite aktivnosti za vašu decu
          </h1>
          <p className="text-lg text-[#555] mb-10 max-w-[480px]">
            Igrališta, kreativne radionice, sportski programi, rođendaonice — sve na jednom mestu.
            Za roditelje koji žele najbolje za svoju decu.
          </p>

          <div className="bg-white border border-[#e8e8e8] rounded-2xl p-5 flex items-center gap-4 mb-6 max-w-[320px]">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-300 to-indigo-500 flex items-center justify-center text-2xl shrink-0">
              😊
            </div>
            <div>
              <h3 className="font-semibold text-base">Igralište</h3>
              <span className="text-[#888] text-sm">iOS aplikacija</span>
            </div>
          </div>

          <span className="inline-block bg-[#f0fdf4] text-[#15803d] text-sm font-medium px-3 py-1.5 rounded-full">
            🚀 Uskoro na App Store
          </span>
        </div>

        <div className="hidden md:block w-[280px] h-[600px] bg-black rounded-[36px] p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] mx-auto">
          <div className="w-full h-full bg-white rounded-[30px] overflow-hidden">
            <Image
              src="/screenshots/app_map_v3.png"
              alt="Igralište aplikacija — mapa aktivnosti za decu"
              width={264}
              height={584}
              className="w-full h-auto object-cover object-top"
              priority
            />
          </div>
        </div>
      </section>

      {/* Activity Catalog */}
      {activities.length > 0 && (
        <section className="bg-white py-20 px-8">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-extrabold text-3xl mb-2 text-center">Aktivnosti za decu</h2>
            <p className="text-center text-[#666] mb-12">
              Pronađite savršenu aktivnost za vaše dete
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className={`${activities.length === 0 ? 'bg-white' : ''} py-24 px-8`}>
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-extrabold text-3xl mb-12 text-center">Šta možete da pronađete</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🗺️', title: 'Mapa aktivnosti', desc: 'Pregledajte šta se dešava u vašem komšiluku na interaktivnoj mapi.' },
              { icon: '⚽', title: 'Sport i rekreacija', desc: 'Fudbal, plivanje, gimnastika — pronađite sportske aktivnosti za sve uzraste.' },
              { icon: '🎨', title: 'Kreativne radionice', desc: 'Likovno, muzika, gluma — podržite kreativnost vašeg deteta.' },
              { icon: '🎂', title: 'Rođendani', desc: 'Pronađite savršeno mesto za proslavu dečjeg rođendana.' },
              { icon: '📅', title: 'Događaji', desc: 'Predstave, festivali, radionice — budite u toku sa dešavanjima.' },
              { icon: '⭐', title: 'Preporuke', desc: 'Čitajte iskustva drugih roditelja i delite svoja.' },
            ].map((f) => (
              <div key={f.title} className="p-6 border border-[#eee] rounded-xl">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-[600px] mx-auto py-24 px-8 text-center">
        <h2 className="font-extrabold text-2xl mb-5">O projektu</h2>
        <p className="text-[#555] text-base leading-[1.7]">
          Gde sa decom? je platforma koja pomaže roditeljima da pronađu kvalitetne aktivnosti za
          svoju decu. Verujemo da svako dete zaslužuje pristup zabavnim i edukativnim sadržajima.
        </p>
        <div className="mt-10 p-6 bg-[#f5f5f5] rounded-xl text-sm text-[#666]">
          <strong className="text-[#1a1a1a]">Igralište</strong> je mobilna aplikacija platforme
          Gde sa decom? — vaš džepni vodič kroz svet dečjih aktivnosti.
        </div>
      </section>

      <Footer />
    </>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { supabase, Slot } from '@/lib/supabase'

export default function ClientPage() {
  const [prenom, setPrenom] = useState('')
  const [tel, setTel] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selSlot, setSelSlot] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(true)

  useEffect(() => { fetchSlots() }, [])

  async function fetchSlots() {
    setLoadingSlots(true)
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('slots')
      .select('*')
      .eq('taken', false)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    setSlots(data || [])
    setLoadingSlots(false)
  }

  async function bookRdv() {
    if (!prenom || !tel || !selSlot) {
      alert('Remplissez votre prénom, téléphone et choisissez un créneau.')
      return
    }
    setLoading(true)
    const slot = slots.find(s => s.id === selSlot)
    if (!slot) { setLoading(false); return }

    const { error } = await supabase.from('rdvs').insert({
      name: prenom,
      service: 'Coupe homme',
      price: 15,
      date: slot.date,
      time: slot.time,
      phone: tel,
      status: 'pending',
    })

    if (!error) {
      await supabase.from('slots').update({ taken: true }).eq('id', selSlot)
      setSuccess(true)
      setPrenom('')
      setTel('')
      setSelSlot(null)
      fetchSlots()
      setTimeout(() => setSuccess(false), 5000)
    } else {
      alert('Erreur lors de la réservation. Réessayez.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="bg-[#042C53] px-6 py-14 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#C9A84C] opacity-5" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full bg-[#378ADD] opacity-5" />
        <div className="relative max-w-lg">
          <span className="inline-block bg-[#C9A84C] bg-opacity-10 border border-[#C9A84C] border-opacity-30 text-[#C9A84C] text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Barbier · Epagny
          </span>
          <h1 className="font-playfair text-4xl font-bold text-[#E6F1FB] leading-tight mb-5">
            TC<span className="text-[#C9A84C]">UT</span>
          </h1>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#C9A84C] bg-opacity-10 border border-[#C9A84C] border-opacity-30 text-[#C9A84C] text-sm font-medium px-4 py-2 rounded-lg mb-6 hover:bg-opacity-20 transition-all"
          >
            📲 Pas de créneau dispo ? Envoyez-moi un DM
          </a>
          <div className="flex gap-8">
            <div>
              <div className="font-playfair text-xl font-bold text-[#C9A84C]">15 €</div>
              <div className="text-xs text-[rgba(230,241,251,0.45)]">tarif unique</div>
            </div>
            <div>
              <div className="font-playfair text-xl font-bold text-[#C9A84C]">4.9 ★</div>
              <div className="text-xs text-[rgba(230,241,251,0.45)]">satisfaction</div>
            </div>
            <div>
              <div className="font-playfair text-xl font-bold text-[#C9A84C]">Epagny</div>
              <div className="text-xs text-[rgba(230,241,251,0.45)]">Haute-Savoie</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="font-playfair text-xl font-bold mb-1">Réservez votre créneau</h2>
        <p className="text-sm text-gray-400 mb-6">Coupe homme · 15 € · 40 min</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                placeholder="Ton prénom"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Téléphone</label>
              <input
                type="text"
                value={tel}
                onChange={e => setTel(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              📅 Créneaux disponibles
            </label>
            {loadingSlots ? (
              <p className="text-sm text-gray-400">Chargement...</p>
            ) : slots.length === 0 ? (
              <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
                Aucun créneau disponible — <a href="https://instagram.com" className="text-[#0C447C] underline">envoyez-moi un DM !</a>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map(s => {
                  const df = new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'short', day: 'numeric', month: 'short'
                  })
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelSlot(s.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selSlot === s.id
                          ? 'bg-[#0C447C] text-white border-[#0C447C]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#378ADD] hover:text-[#185FA5]'
                      }`}
                    >
                      {df} · {s.time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={bookRdv}
            disabled={loading}
            className="w-full py-3 bg-[#0C447C] text-white rounded-lg text-sm font-medium hover:bg-[#185FA5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi...' : 'Confirmer ma réservation'}
          </button>

          {success && (
            <div className="mt-4 bg-[#E6F1FB] border border-[#85B7EB] rounded-xl p-4 text-[#0C447C] text-sm text-center">
              ✅ Réservation envoyée ! Je vous confirme très vite.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

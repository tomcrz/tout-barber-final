'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase, Slot, Rdv } from '@/lib/supabase'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: 'Confirmé',   cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  done:      { label: 'Terminé',    cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  cancelled: { label: 'Annulé',     cls: 'bg-red-50 text-red-600 border border-red-200' },
}

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function initials(name: string) {
  return name.split(' ').map(p => p[0] || '').join('').toUpperCase().slice(0, 2)
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [rdvs, setRdvs] = useState<Rdv[]>([])
  const [filt, setFilt] = useState('all')
  const [search, setSearch] = useState('')
  const [cmanOpen, setCmanOpen] = useState(true)
  const [slotMode, setSlotMode] = useState<'auto' | 'manual'>('auto')

  // Manuel
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [addingSlot, setAddingSlot] = useState(false)

  // Auto
  const [autoDate, setAutoDate] = useState('')
  const [autoStart, setAutoStart] = useState('')
  const [autoEnd, setAutoEnd] = useState('')
  const [autoPreview, setAutoPreview] = useState<string[]>([])
  const [addingAuto, setAddingAuto] = useState(false)

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const today = now.toISOString().split('T')[0]

  const fetchAll = useCallback(async () => {
    const [{ data: sData }, { data: rData }] = await Promise.all([
      supabase.from('slots').select('*').order('date').order('time'),
      supabase.from('rdvs').select('*').order('date').order('time'),
    ])
    setSlots(sData || [])
    setRdvs(rData || [])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Génère la preview des créneaux auto
  function generatePreview(date: string, start: string, end: string) {
    if (!date || !start || !end) { setAutoPreview([]); return }
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    if (endMin <= startMin) { setAutoPreview([]); return }
    const times: string[] = []
    let cur = startMin
    while (cur + 40 <= endMin) {
      const h = Math.floor(cur / 60).toString().padStart(2, '0')
      const m = (cur % 60).toString().padStart(2, '0')
      times.push(`${h}:${m}`)
      cur += 40
    }
    setAutoPreview(times)
  }

  async function addAutoSlots() {
    if (!autoDate || autoPreview.length === 0) return
    setAddingAuto(true)
    const toAdd = autoPreview.filter(t => !slots.find(s => s.date === autoDate && s.time === t))
    if (toAdd.length === 0) { alert('Tous ces créneaux existent déjà.'); setAddingAuto(false); return }
    await supabase.from('slots').insert(toAdd.map(t => ({ date: autoDate, time: t, taken: false })))
    setAutoDate(''); setAutoStart(''); setAutoEnd(''); setAutoPreview([])
    await fetchAll()
    setAddingAuto(false)
  }

  async function addSlot() {
    if (!newDate || !newTime) { alert('Date et heure requises.'); return }
    const tFmt = newTime.slice(0, 5)
    if (slots.find(s => s.date === newDate && s.time === tFmt)) { alert('Ce créneau existe déjà.'); return }
    setAddingSlot(true)
    await supabase.from('slots').insert({ date: newDate, time: tFmt, taken: false })
    setNewDate(''); setNewTime('')
    await fetchAll()
    setAddingSlot(false)
  }

  async function delSlot(slot: Slot) {
    if (slot.taken && !confirm('Ce créneau est réservé. Supprimer quand même ?')) return
    await supabase.from('slots').delete().eq('id', slot.id)
    fetchAll()
  }

  async function updateRdv(id: number, status: string) {
    await supabase.from('rdvs').update({ status }).eq('id', id)
    fetchAll()
  }

  const filteredRdvs = rdvs
    .filter(r => filt === 'all' ? (r.status !== 'done' && r.status !== 'cancelled') : r.status === filt)
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))

  const todayCount = rdvs.filter(r => r.date === today).length
  const pendingCount = rdvs.filter(r => r.status === 'pending').length
  const confirmedCount = rdvs.filter(r => r.status === 'confirmed').length
  const ca = rdvs.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.price, 0)

  function renderCalendar() {
    const firstDay = new Date(calYear, calMonth, 1)
    let startDow = firstDay.getDay()
    startDow = startDow === 0 ? 6 : startDow - 1
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const daysInPrev = new Date(calYear, calMonth, 0).getDate()
    const confirmedRdvs = rdvs.filter(r => r.status === 'confirmed' || r.status === 'done')
    const cells: { day: number; cur: boolean }[] = []
    for (let i = startDow - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, cur: false })
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true })
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - startDow - daysInMonth + 1, cur: false })
    return cells.map((c, i) => {
      if (!c.cur) return <div key={i} className="min-h-[64px] border border-gray-100 rounded-lg p-1 bg-gray-50 opacity-40"><div className="text-xs text-gray-400">{c.day}</div></div>
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`
      const isToday = dateStr === today
      const dayRdvs = confirmedRdvs.filter(r => r.date === dateStr)
      return (
        <div key={i} className={`min-h-[64px] border rounded-lg p-1 ${isToday ? 'border-[#378ADD]' : 'border-gray-100'}`}>
          <div className={`text-xs font-medium mb-1 ${isToday ? 'text-[#0C447C] font-bold' : 'text-gray-400'}`}>{c.day}</div>
          {dayRdvs.map(r => (
            <div key={r.id} className={`text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate ${r.status === 'done' ? 'bg-gray-100 text-gray-400 line-through' : 'bg-[#E6F1FB] text-[#0C447C]'}`}>
              {r.time} {r.name.split(' ')[0]}
            </div>
          ))}
        </div>
      )
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="font-playfair text-2xl font-bold mb-1">Dashboard <span className="text-[#C9A84C]">TCUT</span></h2>
          <p className="text-sm text-gray-400">Epagny · Haute-Savoie</p>
        </div>
        <button onClick={onLogout} className="text-xs text-gray-400 border border-gray-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
          🚪 Déconnexion
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Aujourd'hui", value: todayCount, sub: 'rdv', color: '#0C447C' },
          { label: 'En attente', value: pendingCount, sub: 'à confirmer', color: '#BA7517' },
          { label: 'Confirmés', value: confirmedCount, sub: 'total', color: '#3B6D11' },
          { label: 'CA prévu', value: ca + ' €', sub: 'total', color: '#C9A84C' },
        ].map(m => (
          <div key={m.label} className="bg-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{m.label}</div>
            <div className="text-2xl font-medium" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* CALENDRIER */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="bg-[#042C53] px-5 py-3 flex items-center justify-between">
          <span className="text-[#E6F1FB] text-sm font-medium">📅 Calendrier des rendez-vous</span>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }} className="w-7 h-7 bg-[#C9A84C] bg-opacity-20 border border-[#C9A84C] border-opacity-40 text-[#C9A84C] rounded-lg flex items-center justify-center hover:bg-opacity-30 text-sm">‹</button>
            <span className="text-[#C9A84C] text-sm font-medium w-32 text-center">{MONTHS[calMonth]} {calYear}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }} className="w-7 h-7 bg-[#C9A84C] bg-opacity-20 border border-[#C9A84C] border-opacity-40 text-[#C9A84C] rounded-lg flex items-center justify-center hover:bg-opacity-30 text-sm">›</button>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#E6F1FB]"></div><span className="text-xs text-gray-400">Confirmé</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100"></div><span className="text-xs text-gray-400">Terminé (grisé)</span></div>
          </div>
        </div>
      </div>

      {/* CRENEAUX */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="bg-[#042C53] px-5 py-3 flex items-center justify-between">
          <span className="text-[#E6F1FB] text-sm font-medium">📅 Mes créneaux (40 min)</span>
          <button onClick={() => setCmanOpen(!cmanOpen)} className="bg-[#C9A84C] bg-opacity-20 border border-[#C9A84C] border-opacity-40 text-[#C9A84C] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-opacity-30 transition-all">
            {cmanOpen ? '− Réduire' : '+ Ouvrir'}
          </button>
        </div>

        {cmanOpen && (
          <div className="p-5">
            {/* MODE TOGGLE */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setSlotMode('auto')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${slotMode === 'auto' ? 'bg-[#0C447C] text-white border-[#0C447C]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
              >
                ⚡ Génération automatique
              </button>
              <button
                onClick={() => setSlotMode('manual')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${slotMode === 'manual' ? 'bg-[#0C447C] text-white border-[#0C447C]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
              >
                ✏️ Ajout manuel
              </button>
            </div>

            {/* MODE AUTO */}
            {slotMode === 'auto' && (
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-3">Choisissez une date et une plage horaire — les créneaux de 40 min se génèrent automatiquement.</p>
                <div className="flex gap-3 items-end flex-wrap mb-3">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</label>
                    <input type="date" value={autoDate} min={today} onChange={e => { setAutoDate(e.target.value); generatePreview(e.target.value, autoStart, autoEnd) }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]" />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Début</label>
                    <input type="time" value={autoStart} onChange={e => { setAutoStart(e.target.value); generatePreview(autoDate, e.target.value, autoEnd) }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]" />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fin</label>
                    <input type="time" value={autoEnd} onChange={e => { setAutoEnd(e.target.value); generatePreview(autoDate, autoStart, e.target.value) }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]" />
                  </div>
                </div>

                {autoPreview.length > 0 && (
                  <div className="bg-[#E6F1FB] border border-[#85B7EB] rounded-xl p-4 mb-3">
                    <div className="text-xs font-medium text-[#0C447C] mb-2">✅ {autoPreview.length} créneau{autoPreview.length > 1 ? 'x' : ''} généré{autoPreview.length > 1 ? 's' : ''} :</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {autoPreview.map(t => (
                        <span key={t} className="bg-white text-[#0C447C] text-xs font-medium px-3 py-1 rounded-lg border border-[#85B7EB]">{t}</span>
                      ))}
                    </div>
                    <button onClick={addAutoSlots} disabled={addingAuto} className="w-full py-2.5 bg-[#0C447C] text-white rounded-lg text-sm font-medium hover:bg-[#185FA5] transition-all disabled:opacity-50">
                      {addingAuto ? 'Ajout en cours...' : `Ajouter ces ${autoPreview.length} créneaux`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MODE MANUEL */}
            {slotMode === 'manual' && (
              <div className="flex gap-3 items-end flex-wrap mb-5">
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</label>
                  <input type="date" value={newDate} min={today} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]" />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Heure</label>
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]" />
                </div>
                <button onClick={addSlot} disabled={addingSlot} className="px-5 py-2.5 bg-[#0C447C] text-white rounded-lg text-sm font-medium hover:bg-[#185FA5] transition-all disabled:opacity-50 whitespace-nowrap">
                  {addingSlot ? '...' : '+ Ajouter'}
                </button>
              </div>
            )}

            {/* LISTE CRÉNEAUX */}
            {slots.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">Aucun créneau — ajoutez-en ci-dessus</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {slots.map(s => {
                  const df = new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                  return (
                    <div key={s.id} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{s.time}</span>
                        <span className="text-xs text-gray-400">{df} · 40 min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.taken ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#0C447C]'}`}>{s.taken ? 'Réservé' : 'Libre'}</span>
                        <button onClick={() => delSlot(s)} className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all">🗑</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RDV LIST */}
      <div>
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          {['all','pending','confirmed','done'].map(f => (
            <button key={f} onClick={() => setFilt(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filt===f?'bg-[#0C447C] text-white border-[#0C447C]':'bg-transparent text-gray-400 border-gray-200 hover:bg-gray-50'}`}>
              {f==='all'?'Actifs':f==='pending'?'En attente':f==='confirmed'?'Confirmés':'Terminés'}
            </button>
          ))}
          <input className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-200 rounded-full text-sm bg-gray-50 focus:outline-none focus:border-[#378ADD]" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filteredRdvs.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Aucun rendez-vous</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredRdvs.map(r => {
              const st = STATUS_LABELS[r.status] || STATUS_LABELS.done
              const df = new Date(r.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              return (
                <div key={r.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 flex-wrap hover:border-gray-300 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#E6F1FB] flex items-center justify-center text-sm font-medium text-[#0C447C] flex-shrink-0">{initials(r.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">✂️ Coupe homme · {r.price} € · 📱 {r.phone}</div>
                  </div>
                  <div className="text-right"><div className="text-sm font-medium">{r.time}</div><div className="text-xs text-gray-400">{df}</div></div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  <div className="flex gap-2">
                    {r.status === 'pending' && (<><button onClick={() => updateRdv(r.id, 'confirmed')} className="text-xs text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all font-medium">✓ Confirmer</button><button onClick={() => updateRdv(r.id, 'cancelled')} className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium">✕ Annuler</button></>)}
                    {r.status === 'confirmed' && (<><button onClick={() => updateRdv(r.id, 'done')} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all font-medium">✓✓ Terminé</button><button onClick={() => updateRdv(r.id, 'cancelled')} className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium">✕ Annuler</button></>)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useSchool } from '../context/SchoolContext.jsx'
import ReportsPanel from '../components/ReportsPanel.jsx'

function Admin() {
  const {
    classLevels,
    fees,
    termInfo,
    updateFee,
    updateTermInfo,
    promoteStudents,
    changeAdminPin,
    isHydrated,
    students,
    payments,
    getAdjustedFee,
    getOutstanding
  } = useSchool()
  const [session, setSession] = useState(termInfo.session)
  const [term, setTerm] = useState(termInfo.term)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinMessage, setPinMessage] = useState('')
  const [activeTab, setActiveTab] = useState('reports')

  const handlePinSave = () => {
    if (!pin || pin.length < 4) {
      setPinMessage('PIN must be at least 4 digits')
      return
    }
    if (pin !== pinConfirm) {
      setPinMessage('PIN confirmation does not match')
      return
    }
    changeAdminPin(pin)
    setPin('')
    setPinConfirm('')
    setPinMessage('PIN updated')
  }

  return (
    <section className="flex flex-col gap-6">
      {!isHydrated ? (
        <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-5 text-sm text-[#7c6f63]">
          Loading saved data...
        </div>
      ) : null}
      <header className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">Admin settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1f1b17]">Term setup</h2>
        <p className="mt-2 text-sm text-[#7c6f63]">Configure class fees and term controls.</p>
      </header>

      <div className="rounded-2xl border border-[#e6ded4] bg-white/80 px-4 py-3 shadow-[0_12px_25px_-25px_rgba(31,27,23,0.5)]">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              activeTab === 'reports'
                ? 'border-[#1f1b17] bg-[#1f1b17] text-[#fef7ed]'
                : 'border-[#e5ddd2] text-[#7c6f63]'
            }`}
          >
            Reports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              activeTab === 'settings'
                ? 'border-[#1f1b17] bg-[#1f1b17] text-[#fef7ed]'
                : 'border-[#e5ddd2] text-[#7c6f63]'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'reports' ? (
        <ReportsPanel
          students={students}
          payments={payments}
          classLevels={classLevels}
          getAdjustedFee={getAdjustedFee}
          getOutstanding={getOutstanding}
        />
      ) : null}

      {activeTab === 'settings' ? (
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
          <h3 className="text-base font-semibold text-[#1f1b17]">Fee setup</h3>
          <div className="mt-4 grid gap-3">
            {classLevels.map((level) => (
              <div key={level} className="flex items-center justify-between rounded-2xl border border-[#efe6da] bg-[#fefaf4] px-4 py-3">
                <span className="text-sm font-semibold text-[#1f1b17]">{level}</span>
                <input
                  type="number"
                  min="0"
                  value={fees[level] || 0}
                  onChange={(event) => updateFee(level, event.target.value)}
                  className="w-32 rounded-xl border border-[#e5ddd2] bg-white px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
            <h3 className="text-base font-semibold text-[#1f1b17]">Term controls</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm text-[#7c6f63]">
                Session
                <input
                  value={session}
                  onChange={(event) => setSession(event.target.value)}
                  className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-[#7c6f63]">
                Term
                <select
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3"
                >
                  {['1st Term', '2nd Term', '3rd Term'].map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => updateTermInfo({ session, term })}
                className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
              >
                Save term settings
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
            <h3 className="text-base font-semibold text-[#1f1b17]">Admin PIN</h3>
            <div className="mt-4 grid gap-3">
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="New PIN"
                className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3"
              />
              <input
                type="password"
                value={pinConfirm}
                onChange={(event) => setPinConfirm(event.target.value)}
                placeholder="Confirm PIN"
                className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3"
              />
              {pinMessage ? <p className="text-xs text-[#7c6f63]">{pinMessage}</p> : null}
              <button
                type="button"
                onClick={handlePinSave}
                className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
              >
                Update PIN
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-[#f1d9b5] bg-[#fff5e4] p-6 text-sm text-[#7a4d0d]">
            <h3 className="text-base font-semibold">Promote students</h3>
            <p className="mt-2">
              Moves each student to the next class and carries outstanding balances forward.
            </p>
            <button
              type="button"
              onClick={promoteStudents}
              className="mt-4 rounded-full bg-[#f2c278] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4d3510]"
            >
              Promote students
            </button>
          </div>
        </div>
      </div>
      ) : null}
    </section>
  )
}

export default Admin

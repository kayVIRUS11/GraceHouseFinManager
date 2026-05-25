function StatsCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-5 shadow-[0_14px_30px_-28px_rgba(31,27,23,0.5)]">
      <p className="text-xs uppercase tracking-[0.28em] text-[#9c8f83]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[#1f1b17]">{value}</p>
      {helper ? <p className="mt-2 text-sm text-[#7c6f63]">{helper}</p> : null}
    </div>
  )
}

export default StatsCard

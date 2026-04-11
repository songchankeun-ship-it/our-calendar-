interface SubNavProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}

export default function SubNav({ tabs, active, onChange }: SubNavProps) {
  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
      style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 3%, black 92%, transparent 100%)' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap border-[1.5px] transition-all duration-300 shrink-0
            ${active === tab.id
              ? 'bg-teal text-white border-teal shadow-[0_4px_14px_rgba(13,148,136,0.3)]'
              : 'bg-white text-gray-500 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

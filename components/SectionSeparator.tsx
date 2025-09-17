export default function SectionSeparator() {
  return (
    <div className="mt-28 mb-24 text-center font-['Crozet-Regular'] text-2xl tracking-wider text-gray-400 whitespace-nowrap overflow-hidden">
      <div className="animate-scroll font-['Crozet-Regular']">
        {Array(20).fill('antoineview').join('')}
      </div>
    </div>
  )
}

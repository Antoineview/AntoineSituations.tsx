// AntoineSituations.tsx/components/PostDate.tsx:1-12
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale' // Import the French locale

interface PostDateProps {
  dateString: string
}

export default function PostDate({ dateString }: PostDateProps) {
  if (!dateString) return null

  const date = parseISO(dateString)
  return (
    <time dateTime={dateString}>
      {format(date, 'd MMMM yyyy', { locale: fr })}
    </time>
  )
}

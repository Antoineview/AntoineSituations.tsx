import { urlForImage } from 'lib/sanity.image'
import type { auteur } from 'lib/sanity.queries'
import Image from 'next/image'

export default function AuthorAvatar(props: auteur) {
  const { name, picture } = props
  return (
    <div className="flex items-center">
      <div className="relative mr-4 h-12 w-12">
        <Image
          src={
            picture?.asset?._ref
              ? urlForImage(picture).height(96).width(96).fit('crop').url()
              : 'https://source.unsplash.com/96x96/?face'
          }
          className="rounded-full"
          height={96}
          width={96}
          // @TODO add alternative text to avatar image schema
          alt=""
        />
      </div>
      <div className="text-xl font-bold author-name">{name}</div>
    </div>
  )
}

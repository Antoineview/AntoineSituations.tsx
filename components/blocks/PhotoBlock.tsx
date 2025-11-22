import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'

export default function PhotoBlock({
    value,
}: {
    value: {
        image: any
        layout?: string
    }
}) {
    const { image, layout } = value
    if (!image?.asset?._ref) {
        return null
    }

    const isFull = layout === 'full'

    return (
        <figure className={`my-8 ${isFull ? 'w-full' : 'max-w-2xl mx-auto'}`}>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                    className="object-cover"
                    src={urlForImage(image).width(isFull ? 1200 : 800).url()}
                    alt={image.alt || ''}
                    fill
                    sizes={isFull ? '100vw' : '(max-width: 768px) 100vw, 800px'}
                />
            </div>
            {image.caption && (
                <figcaption className="mt-2 text-center text-sm text-gray-500">
                    {image.caption}
                </figcaption>
            )}
        </figure>
    )
}

export default function Divider({ value }: { value: { style?: string } }) {
    if (value?.style === 'wide') {
        return <hr className="my-12 border-gray-200 w-full" />
    }
    return <hr className="my-8 border-gray-200 max-w-2xl mx-auto" />
}

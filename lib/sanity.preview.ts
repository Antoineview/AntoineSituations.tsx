import { useLiveQuery } from 'next-sanity/preview'

// To use live preview, wrap your app (or page) in <LiveQueryProvider client={client}> from next-sanity/preview
// and use the useLiveQuery hook in your components.
// Example usage:
// const [data] = useLiveQuery(initialData, query, params)

export { useLiveQuery }

export function usePreview(token: string | null, query: string, params?: any) {
    const [data] = useLiveQuery(null, query, params)
    return data
}

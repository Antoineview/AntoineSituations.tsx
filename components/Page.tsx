import { PortableText } from '@portabletext/react'
import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import Divider from 'components/blocks/Divider'
import PhotoBlock from 'components/blocks/PhotoBlock'
import { useMemo } from 'react'
import styles from './PostBody.module.css'

// Reusing PostBody styles for text blocks, but adding custom components
export default function Page({
    page,
    preview,
}: {
    page: any
    preview?: boolean
}) {
    const components = useMemo(
        () => ({
            types: {
                divider: Divider,
                photoBlock: PhotoBlock,
                // Add other types here if needed, e.g. youtube
            },
        }),
        [],
    )

    return (
        <Layout preview={preview}>
            <Container>
                <BlogHeader title={page.title} lilparagraph="" bigparapraph="" />
                <div className={`mx-auto max-w-2xl ${styles.content}`}>
                    <PortableText value={page.pageBuilder} components={components} />
                </div>
            </Container>
        </Layout>
    )
}

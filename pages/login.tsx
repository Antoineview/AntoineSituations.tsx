import AuthGate from 'components/AuthGate'
import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const returnTo = router.query.returnTo as string

  const handleAuthenticated = () => {
    if (returnTo) {
      router.push(returnTo)
    } else {
      router.push('/')
    }
  }

  return (
    <Layout preview={false}>
      <Container>
        <BlogHeader lilparagraph={''} bigparapraph={''} title="Login" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <AuthGate onAuthenticated={handleAuthenticated}>
            <div>You are authenticated!</div>
          </AuthGate>
        </motion.div>
      </Container>
    </Layout>
  )
}

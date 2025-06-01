import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from 'components/BlogLayout'
import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import RegisterPasskey from 'components/RegisterPasskey'

export default function RegisterPage() {
  const router = useRouter()
  const { code } = router.query
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate the invitation code when the page loads
  useEffect(() => {
    if (code) {
      validateInvitation(code as string)
    } else {
      setIsValidating(false)
      setError('No invitation code provided')
    }
  }, [code])

  const validateInvitation = async (invitationCode: string) => {
    try {
      const response = await fetch('/api/auth/validate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: invitationCode }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid invitation code')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRegistered = () => {
    router.push('/')
  }

  return (
    <Layout preview={false}>
      <Container>
        <BlogHeader lilparagraph={''} bigparapraph={''} title="Register" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {isValidating ? (
            <div className="text-center">
              <p>Validating invitation code...</p>
            </div>
          ) : isValid ? (
            <RegisterPasskey onRegistered={handleRegistered} />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Invalid Invitation</h2>
              <p className="text-red-500">{error}</p>
              <p className="mt-4">
                Please contact the administrator to get a valid invitation link.
              </p>
            </div>
          )}
        </motion.div>
      </Container>
    </Layout>
  )
} 
import { useState } from 'react'
import { motion } from 'framer-motion'
import RegisterPasskey from './RegisterPasskey'

interface AuthGateProps {
  children: React.ReactNode
  onAuthenticated: () => void
}

export default function AuthGate({ children, onAuthenticated }: AuthGateProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true)
      setError(null)

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser')
      }

      // Get the challenge from your server
      const response = await fetch('/api/auth/challenge')
      const { challenge } = await response.json()

      // Get the credentials
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'preferred',
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('No credential received')
      }

      const assertionResponse = credential.response as AuthenticatorAssertionResponse

      // Send the credential to your server
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              clientDataJSON: Array.from(new Uint8Array(assertionResponse.clientDataJSON)),
              authenticatorData: Array.from(new Uint8Array(assertionResponse.authenticatorData)),
              signature: Array.from(new Uint8Array(assertionResponse.signature)),
              userHandle: assertionResponse.userHandle ? Array.from(new Uint8Array(assertionResponse.userHandle)) : null,
            },
            type: credential.type,
          },
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Authentication failed')
      }

      onAuthenticated()
    } catch (err) {
      if (err instanceof Error && err.message.includes('No credentials found')) {
        setShowRegistration(true)
      } else {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (showRegistration) {
    return (
      <RegisterPasskey
        onRegistered={() => {
          setShowRegistration(false)
          onAuthenticated()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-4">This content requires authentication</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Please authenticate using your passkey to view this content
        </p>
        <button
          onClick={handleAuthenticate}
          disabled={isAuthenticating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating ? 'Authenticating...' : 'Authenticate with Passkey'}
        </button>
        {error && (
          <p className="mt-4 text-red-500">{error}</p>
        )}
      </motion.div>
    </div>
  )
} 
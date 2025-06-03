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
  const [isHovered, setIsHovered] = useState(false)

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true)
      setError(null)

      if (!window.PublicKeyCredential) {
        throw new Error('Votre navigateur ne supporte pas les clés de sécurité')
      }

      const response = await fetch('/api/auth/challenge')
      const { challenge } = await response.json()

      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'preferred',
        },
      })) as PublicKeyCredential

      if (!credential) {
        throw new Error("Aucune information d'identification reçue")
      }

      const assertionResponse =
        credential.response as AuthenticatorAssertionResponse

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
              clientDataJSON: Array.from(
                new Uint8Array(assertionResponse.clientDataJSON),
              ),
              authenticatorData: Array.from(
                new Uint8Array(assertionResponse.authenticatorData),
              ),
              signature: Array.from(
                new Uint8Array(assertionResponse.signature),
              ),
              userHandle: assertionResponse.userHandle
                ? Array.from(new Uint8Array(assertionResponse.userHandle))
                : null,
            },
            type: credential.type,
          },
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error("L'authentification a échoué")
      }

      onAuthenticated()
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes('No credentials found')
      ) {
        setShowRegistration(true)
      } else {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("L'authentification a échoué")
        }
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
        className="flex flex-col items-center text-center"
      >
        <div
          className={`relative cursor-pointer transition-all duration-300 p-8 ${
            isHovered ? 'drop-shadow-[0_0_15px_rgba(255,255,150,0.8)]' : ''
          }`}
          onClick={handleAuthenticate}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 49 100"
            fill="currentColor"
            className={`w-32 h-32 text-gray-700 dark:text-gray-300 ${
              isAuthenticating ? 'animate-pulse' : ''
            }`}
          >
            <path
              id="Trac"
              d="M 48.318001 24.158997 C 48.318001 10.816002 37.502998 0 24.159 0 C 10.816 0 0 10.816002 0 24.158997 C 0 34.373001 6.349 43.089005 15.309 46.622002 L 1.282 100 L 21.209999 100 L 27.108 100 L 47.037998 100 L 33.011002 46.622002 C 41.971001 43.089005 48.318001 34.374001 48.318001 24.158997 Z"
            />
          </svg>
        </div>

        {isAuthenticating && (
          <p className="mt-4 text-lg">Authentification en cours...</p>
        )}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {!isAuthenticating && !error && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Utilisez la clé vers votre coeur.
          </p>
        )}
      </motion.div>
    </div>
  )
}

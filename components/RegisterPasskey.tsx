import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
// Import isoBase64URL for manual serialization
import { isoBase64URL } from '@simplewebauthn/server/helpers';

interface RegisterPasskeyProps {
  onRegistered: () => void
}

export default function RegisterPasskey({ onRegistered }: RegisterPasskeyProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { code } = router.query

  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      setError(null)

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser')
      }

      // Get the challenge from your server
      const response = await fetch('/api/auth/challenge')
      const { challenge } = await response.json()

      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rp: {
            name: 'Your Site Name',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16), // Generate a random user ID
            name: 'user@example.com',
            displayName: 'User Name',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          timeout: 60000,
          attestation: 'direct',
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('No credential received')
      }

      const attestationResponse = credential.response as AuthenticatorAttestationResponse

      // Get the invitation ID from the invitation code
      const validateResponse = await fetch('/api/auth/validate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!validateResponse.ok) {
        throw new Error('Invalid invitation code')
      }

      const { invitationId } = await validateResponse.json();

      if (!invitationId) {
          throw new Error('Could not retrieve invitation ID from validation');
      }

      // Send the credential data and invitation ID to your server
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              clientDataJSON: Array.from(new Uint8Array(attestationResponse.clientDataJSON)),
              attestationObject: Array.from(new Uint8Array(attestationResponse.attestationObject)),
              transports: attestationResponse.getTransports ? attestationResponse.getTransports() : undefined,
            },
            type: credential.type,
          },
          invitationId,
        }),
      })

      if (!registerResponse.ok) {
        throw new Error('Registration failed')
      }

      onRegistered()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Register a Passkey</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Create a passkey to securely access protected content
        </p>
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? 'Registering...' : 'Register Passkey'}
        </button>
        {error && (
          <p className="mt-4 text-red-500">{error}</p>
        )}
      </motion.div>
    </div>
  )
} 
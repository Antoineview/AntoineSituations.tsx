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
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const { code } = router.query

  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      setError(null)

      if (!window.PublicKeyCredential) {
        throw new Error("Votre navigateur ne supporte pas les clés de sécurité")
      }

      const response = await fetch('/api/auth/challenge')
      const { challenge } = await response.json()

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rp: {
            name: 'AntoineView',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: 'key to your hartt',
            displayName: 'key',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          timeout: 60000,
          attestation: 'direct',
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error("Aucune information d'identification reçue.")
      }

      const attestationResponse = credential.response as AuthenticatorAttestationResponse

      const validateResponse = await fetch('/api/auth/validate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!validateResponse.ok) {
        throw new Error("Code d'invitation invalide.")
      }

      const { invitationId } = await validateResponse.json();

      if (!invitationId) {
          throw new Error("Impossible de récupérer l'ID d'invitation après validation.");
      }

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
            clientExtensionResults: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {},
          },
          invitationId,
        }),
      })

      if (!registerResponse.ok) {
        throw new Error("L'enregistrement a échoué.")
      }

      onRegistered()
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("L'enregistrement a échoué.")
        }
    } finally {
      setIsRegistering(false)
    }
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
          onClick={handleRegister}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 45 90"
            fill="currentColor"
            className={`h-32 w-16 text-gray-700 dark:text-gray-300 ${
              isRegistering ? 'animate-pulse' : ''
            }`}
          >
            <path
              id="Trac"
              d="M 40 66.5 L 40 73.5 L 45 73.5 L 45 80 L 34 80 C 34 81.105499 33.105469 82 32 82 C 30.894531 82 30 81.105469 30 80 L 27 80 C 27 81.105499 26.105469 82 25 82 L 25 85 C 25 87.761703 22.7617 90 20 90 C 17.2383 90 15 87.761703 15 85 L 15 28.652 C 13.128899 29.734001 10.8867 30.241798 8.496101 29.890305 C 4.058601 29.234055 0.5313 25.554398 0.058601 21.093399 C -0.578117 15.081696 4.117199 9.999397 10 9.999397 C 10 4.475998 14.476601 -0.000603 20 -0.000603 C 25.523399 -0.000603 30 4.475998 30 9.999397 C 35.882797 9.999397 40.578003 15.077499 39.941399 21.093399 C 39.468742 25.554298 35.941399 29.234001 31.503899 29.890305 C 29.117203 30.245773 26.871101 29.737961 25 28.652 L 25 58 C 26.105499 58 27 58.894531 27 60 L 30 60 C 30 58.894501 30.894531 58 32 58 C 33.105469 58 34 58.894531 34 60 L 45 60 L 45 66.5 Z M 20 6.25 C 17.929699 6.25 16.25 7.929703 16.25 10 C 16.25 12.070297 20 14.75 20 14.75 C 20 14.75 23.75 12.070297 23.75 10 C 23.75 7.929703 22.070301 6.25 20 6.25 Z M 30 16.25 C 27.929699 16.25 25.25 20 25.25 20 C 25.25 20 27.929699 23.75 30 23.75 C 32.070297 23.75 33.75 22.070297 33.75 20 C 33.75 17.929703 32.070297 16.25 30 16.25 Z M 10 16.25 C 7.929699 16.25 6.25 17.929703 6.25 20 C 6.25 22.070297 7.929699 23.75 10 23.75 C 12.070301 23.75 14.75 20 14.75 20 C 14.75 20 12.070301 16.25 10 16.25 Z"
            />
          </svg>
        </div>

        {isRegistering && <p className="mt-4 text-lg">Enregistrement en cours...</p>}
        {error && (
          <p className="mt-4 text-red-500">{error}</p>
        )}
        {!isRegistering && !error && (
           <p className="mt-4 text-gray-600 dark:text-gray-400">
            Créez la clé vers votre coeur.
          </p>
        )}
      </motion.div>
    </div>
  )
} 
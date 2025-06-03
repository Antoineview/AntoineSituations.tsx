import 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: string
      authenticated: boolean
    }
    challenge?: Uint8Array
  }
}

import type { SessionOptions } from 'iron-session'

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

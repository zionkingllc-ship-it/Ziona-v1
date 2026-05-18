export const passwordRules = {
  minLength: (v: string) => v.length >= 8 && v.length <= 20,
  hasLetterAndNumber: (v: string) =>
    /[a-zA-Z]/.test(v) && /\d/.test(v),
  hasSpecialChar: (v: string) =>
    /[!@#$%^&*(),.?":{}|<>]/.test(v),
}

export const isPasswordValid = (password: string) =>
  Object.values(passwordRules).every((rule) => rule(password))

// Login validation must match signup rules (isPasswordValid)
// to avoid rejecting valid passwords created before any rule changes.
// Using stricter-than-signup rules would lock users out of their accounts.
export const isLoginPasswordValid = (password: string) =>
  password.length >= 8 &&
  password.length <= 20 &&
  /[a-zA-Z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(password);
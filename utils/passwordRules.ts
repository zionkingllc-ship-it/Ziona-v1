export const passwordRules = {
  minLength: (v: string) => v.length >= 8 && v.length <= 20,
  hasLetterAndNumber: (v: string) =>
    /[a-zA-Z]/.test(v) && /\d/.test(v),
  hasSpecialChar: (v: string) =>
    /[!@#$%^&*(),.?":{}|<>]/.test(v),
}

export const isPasswordValid = (password: string) =>
  Object.values(passwordRules).every((rule) => rule(password))

export const loginPasswordRules = {
  minLength: (password: string) => password.length >= 8,
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasLowercase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /[0-9]/.test(password),
  hasSpecial: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
};

export const isLoginPasswordValid = (password: string) =>
  loginPasswordRules.minLength(password) &&
  loginPasswordRules.hasUppercase(password) &&
  loginPasswordRules.hasLowercase(password) &&
  loginPasswordRules.hasNumber(password) &&
  loginPasswordRules.hasSpecial(password);
type SupabaseAuthError = {
  code?: string;
  message: string;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  invalid_credentials: "E-mail ou senha incorretos.",
  otp_expired: "Este link de recuperação é inválido ou expirou. Solicite um novo link.",
  over_email_send_rate_limit: "Muitas solicitações foram feitas. Aguarde alguns minutos e tente novamente.",
  over_request_rate_limit: "Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.",
  same_password: "A nova senha deve ser diferente da senha atual.",
  session_not_found: "Este link de recuperação é inválido ou expirou. Solicite um novo link.",
  weak_password: "A senha informada é muito fraca. Use pelo menos 8 caracteres.",
};

export function getAuthErrorMessage(
  error: SupabaseAuthError,
  fallback = "Não foi possível concluir a solicitação. Tente novamente.",
) {
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  return fallback;
}

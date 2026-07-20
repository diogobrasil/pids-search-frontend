/**
 * Traduz mensagens de erro da API para português claro e amigável ao usuário.
 *
 * Cobre erros HTTP comuns, mensagens do backend em inglês, e erros de rede.
 */

/* ------------------------------------------------------------------ */
/*  Mapa de traduções — mensagens do backend (case-insensitive)        */
/* ------------------------------------------------------------------ */
const messageTranslations: [RegExp, string][] = [
  // Auth
  [/unauthorized/i, "Você precisa estar logado para realizar esta ação. Faça login e tente novamente."],
  [/invalid credentials/i, "E-mail ou senha incorretos. Verifique seus dados e tente novamente."],
  [/invalid email or password/i, "E-mail ou senha incorretos. Verifique seus dados e tente novamente."],
  [/user not found/i, "Conta não encontrada. Verifique o e-mail informado ou crie uma nova conta."],
  [/email already (exists|registered|in use)/i, "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail."],
  [/token expired/i, "Sua sessão expirou. Por favor, faça login novamente."],
  [/invalid token/i, "Sua sessão é inválida. Por favor, faça login novamente."],
  [/forbidden/i, "Você não tem permissão para realizar esta ação."],
  [/access denied/i, "Acesso negado. Você não tem permissão para acessar este recurso."],

  // Validation
  [/validation (failed|error)/i, "Alguns dados informados são inválidos. Verifique os campos e tente novamente."],
  [/required field/i, "Preencha todos os campos obrigatórios antes de continuar."],
  [/password.*(short|weak|min)/i, "A senha é muito curta. Use pelo menos 6 caracteres."],
  [/passwords? (do not|don't) match/i, "As senhas não coincidem. Verifique e tente novamente."],

  // File / Upload
  [/file.*(too large|size exceeded)/i, "O arquivo é muito grande. O tamanho máximo permitido é 10 MB."],
  [/invalid file (type|format)/i, "Formato de arquivo não suportado. Envie um arquivo .csv válido."],
  [/no file/i, "Nenhum arquivo foi selecionado. Por favor, selecione um arquivo .csv."],

  // Search / ORCID
  [/orcid.*not found/i, "Nenhum perfil ORCID correspondente foi encontrado."],
  [/batch.*not found/i, "Lote de busca não encontrado. Ele pode ter sido removido."],
  [/query.*not found/i, "Registro de busca não encontrado."],

  // Generic server
  [/internal server error/i, "Ocorreu um erro interno no servidor. Tente novamente em alguns instantes."],
  [/service unavailable/i, "O serviço está temporariamente indisponível. Tente novamente mais tarde."],
  [/too many requests/i, "Muitas requisições em pouco tempo. Aguarde um momento e tente novamente."],
  [/bad request/i, "Requisição inválida. Verifique os dados enviados e tente novamente."],
  [/not found/i, "O recurso solicitado não foi encontrado."],
  [/timeout/i, "A requisição demorou muito para ser processada. Tente novamente."],
];

/* ------------------------------------------------------------------ */
/*  Traduções por código HTTP                                          */
/* ------------------------------------------------------------------ */
const httpStatusMessages: Record<number, string> = {
  400: "Requisição inválida. Verifique os dados enviados e tente novamente.",
  401: "Você precisa estar logado para realizar esta ação. Faça login e tente novamente.",
  403: "Você não tem permissão para acessar este recurso.",
  404: "O recurso solicitado não foi encontrado.",
  408: "A requisição demorou muito para ser processada. Tente novamente.",
  409: "Conflito: este recurso já existe ou está em uso.",
  413: "O arquivo enviado é muito grande.",
  422: "Alguns dados informados são inválidos. Verifique os campos e tente novamente.",
  429: "Muitas requisições em pouco tempo. Aguarde um momento e tente novamente.",
  500: "Ocorreu um erro interno no servidor. Tente novamente em alguns instantes.",
  502: "Erro ao comunicar com o servidor. Tente novamente em alguns instantes.",
  503: "O serviço está temporariamente indisponível. Tente novamente mais tarde.",
  504: "O servidor demorou muito para responder. Tente novamente.",
};

/* ------------------------------------------------------------------ */
/*  Função principal                                                   */
/* ------------------------------------------------------------------ */

/**
 * Recebe um erro genérico (Axios, Error, ou string) e retorna uma mensagem
 * amigável em português.
 */
export function translateError(error: unknown, fallback?: string): string {
  const defaultMsg = fallback || "Ocorreu um erro inesperado. Tente novamente.";

  if (!error) return defaultMsg;

  // ---- Axios error ----
  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    const axiosErr = error as any;

    // Network / connection errors (no response from server)
    if (!axiosErr.response) {
      if (axiosErr.code === "ERR_NETWORK" || axiosErr.message?.includes("Network Error")) {
        return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.";
      }
      if (axiosErr.code === "ECONNABORTED") {
        return "A requisição demorou muito para ser processada. Tente novamente.";
      }
      return "Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.";
    }

    const status = axiosErr.response?.status;
    const serverMessage: string =
      axiosErr.response?.data?.message ||
      axiosErr.response?.data?.error ||
      "";

    // Try to translate the server message first
    if (serverMessage) {
      const translated = matchMessage(serverMessage);
      if (translated) return translated;
    }

    // Fall back to HTTP status code translation
    if (status && httpStatusMessages[status]) {
      return httpStatusMessages[status];
    }

    // Last resort: return the server message if it exists
    if (serverMessage) return serverMessage;
  }

  // ---- Standard Error object ----
  if (error instanceof Error) {
    const translated = matchMessage(error.message);
    if (translated) return translated;

    // If the message is already in Portuguese (heuristic: contains accented chars common in PT)
    if (/[àáâãéêíóôõúç]/i.test(error.message)) {
      return error.message;
    }

    return defaultMsg;
  }

  // ---- String ----
  if (typeof error === "string") {
    const translated = matchMessage(error);
    if (translated) return translated;
    if (/[àáâãéêíóôõúç]/i.test(error)) return error;
    return defaultMsg;
  }

  return defaultMsg;
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function matchMessage(msg: string): string | null {
  for (const [pattern, translation] of messageTranslations) {
    if (pattern.test(msg)) {
      return translation;
    }
  }
  return null;
}

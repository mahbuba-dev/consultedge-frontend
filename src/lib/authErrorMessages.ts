type AuthMode = "login" | "register";

const DEFAULT_MESSAGES: Record<AuthMode, string> = {
  login: "We couldn't sign you in right now. Please try again.",
  register: "We couldn't create your account right now. Please try again.",
};

const INVALID_CREDENTIALS_MESSAGES = [
  "invalid credentials",
  "invalid password",
  "incorrect password",
  "password is incorrect",
  "user not found",
  "no user found",
  "invalid email or password",
  "unauthorized",
];

const EMAIL_EXISTS_MESSAGES = [
  "email already exists",
  "user already exists",
  "already registered",
  "account already exists",
  "duplicate",
];

const NETWORK_MESSAGES = [
  "network error",
  "failed to fetch",
  "timeout",
  "socket hang up",
  "econnrefused",
];

const getStatus = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as {
    response?: { status?: number };
    status?: number;
  };

  return maybeError.response?.status ?? maybeError.status;
};

const getRawMessage = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return "";
  }

  const maybeError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return String(maybeError.response?.data?.message ?? maybeError.message ?? "").trim();
};

export const getFriendlyAuthErrorMessage = (error: unknown, mode: AuthMode) => {
  const rawMessage = getRawMessage(error);
  const normalizedMessage = rawMessage.toLowerCase();
  const status = getStatus(error);

  if (INVALID_CREDENTIALS_MESSAGES.some((item) => normalizedMessage.includes(item))) {
    return "Email or password is incorrect. Please try again.";
  }

  if (EMAIL_EXISTS_MESSAGES.some((item) => normalizedMessage.includes(item))) {
    return "An account with this email already exists. Try logging in instead.";
  }

  if (normalizedMessage.includes("email not verified")) {
    return "Please verify your email before continuing.";
  }

  if (normalizedMessage.includes("too many requests") || status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (NETWORK_MESSAGES.some((item) => normalizedMessage.includes(item))) {
    return "We couldn't reach the server. Please check your internet connection and try again.";
  }

  if (status === 400) {
    return mode === "login"
      ? "Please check your email and password and try again."
      : "Please review your details and try again.";
  }

  if (status === 401) {
    return "Email or password is incorrect. Please try again.";
  }

  if (status === 409) {
    return "An account with this email already exists. Try logging in instead.";
  }

  if (status && status >= 500) {
    return "Something went wrong on our side. Please try again in a moment.";
  }

  return DEFAULT_MESSAGES[mode];
};

import { User } from "@/types";
import { api } from "./client";

/* ---------------- DEBUG HELPERS ---------------- */

const log = (...args: any[]) => {
  console.log("🟦 AUTH API:", ...args);
};

const errorLog = (label: string, err: any) => {
  console.error("🟥 AUTH API ERROR:", label);

  console.log("message:", err?.message);
  console.log("code:", err?.code);
  console.log("status:", err?.response?.status);
  console.log("response:", err?.response?.data);
};

export const authApi = {
  signUp: async (payload: {
    email: string;
    password: string;
    username: string;
    birthday: string;
  }): Promise<{ user: User }> => {
    try {
      log("signUp called");

      const response = await api.post("/auth/register", {
        email: payload.email,
        password: payload.password,
        username: payload.username,
        date_of_birth: payload.birthday,
      });

      log("signUp response:", response.data);

      return {
        user: response.data?.data?.user,
      };
    } catch (err: any) {
      errorLog("signUp failed", err);
      throw err;
    }
  },

  checkEmail: async (email: string) => {
  try {
    log("checkEmail called");

    const response = await api.post("/auth/check-email", { email });

    log("checkEmail response:", response.data);

    return {
      exists: response.data?.data?.exists ?? false,
      message: response.data?.data?.message ?? "",
    };
  } catch (err: any) {
    errorLog("checkEmail failed", err);
    throw err;
  }
},

  signIn: async (payload: { email: string; password: string }) => {
    try {
      log("signIn called");

      const response = await api.post("/auth/login", payload);

      const data = response.data?.data ?? response.data ?? {};

      return {
        requiresOtp: data.requires_otp ?? false,
        user: data.user ?? null,
        tokens: data.tokens ?? null,
      };
    } catch (err: any) {
      errorLog("signIn failed", err);
      throw err;
    }
  },
  suggestUsername: async (payload: {
    email: string;
    date_of_birth: string;
  }) => {
    try {
      log("suggestUsername called");
      log("Payload:", payload);
      const response = await api.post("/auth/suggest-usernames", payload);
      log("suggestUsername response:", response.data);
      return response.data?.data?.suggestions ?? [];
    } catch (err: any) {
      errorLog("suggestUsername failed:", err?.response?.data || err);
      throw err;
    }
  },

  verifyOtp: async (payload: { email: string; code: string }) => {
    try {
      log("verifyOtp called");

      const response = await api.post("/auth/verify-email", payload);

      const data = response.data?.data ?? {};

      return {
        user: data.user ?? null,
        tokens: data.tokens ?? null,
      };
    } catch (err: any) {
      errorLog("verifyOtp failed", err);
      throw err;
    }
  },

  resendOtp: async (email: string) => {
    try {
      log("resendOtp called");

      const response = await api.post("/auth/resend-otp", { email });

      return response.data;
    } catch (err: any) {
      errorLog("resendOtp failed", err);
      throw err;
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      log("requestPasswordReset called");

      const response = await api.post("/auth/password-reset", { email });

      return response.data;
    } catch (err: any) {
      errorLog("requestPasswordReset failed", err);
      throw err;
    }
  },

  confirmPasswordReset: async (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    try {
      log("confirmPasswordReset called");

      const response = await api.post("/auth/password-reset/confirm", {
        email: payload.email,
        otp: payload.otp,
        new_password: payload.newPassword,
      });

      return response.data;
    } catch (err: any) {
      errorLog("confirmPasswordReset failed", err);
      throw err;
    }
  },

  googleLogin: async (idToken: string) => {
    try {
      log("googleLogin called");

      const response = await api.post("/auth/google", {
        id_token: idToken,
      });

      log("googleLogin response:", response.data);

      return response.data;
    } catch (err: any) {
      errorLog("googleLogin failed", err);
      throw err;
    }
  },

  getMe: async (): Promise<User> => {
    try {
      log("getMe called");

      const response = await api.get("/auth/me");

      return response.data;
    } catch (err: any) {
      errorLog("getMe failed", err);
      throw err;
    }
  },

  signOut: async () => {
    try {
      log("signOut called");

      const response = await api.post("/auth/logout");

      log("signOut response:", response?.data);
    } catch (err: any) {
      errorLog("signOut failed", err);
      throw err;
    }
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      log("changePassword called");

      const response = await api.post("/auth/change-password", {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      });

      log("changePassword response:", response.data);

      return response.data;
    } catch (err: any) {
      errorLog("changePassword failed", err);
      throw err;
    }
  },

  deactivateAccount: async () => {
    try {
      log("deactivateAccount called");

      const response = await api.post("/auth/deactivate");

      log("deactivateAccount response:", response.data);

      return response.data;
    } catch (err: any) {
      errorLog("deactivateAccount failed", err);
      throw err;
    }
  },

  deleteAccount: async () => {
    try {
      log("deleteAccount called");

      const response = await api.delete("/auth/account");

      log("deleteAccount response:", response.data);

      return response.data;
    } catch (err: any) {
      errorLog("deleteAccount failed", err);
      throw err;
    }
  },
};

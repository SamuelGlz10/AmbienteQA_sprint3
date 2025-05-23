import axios from "axios";

const FRONT_URL = import.meta.env.VITE_FRONT_URL;
const BACK_URL = import.meta.env.VITE_BACK_URL;

const WHOOP_CONFIG = {
  clientId: "4a7cd98e-1a62-45c4-ad24-59011db56b9f",
  clientSecret:
    "a315fb94189d174a4ef205b479199c28e496d9fa575bed088d70911f0de0fb35",
  redirectUri: `${FRONT_URL}/whoop-callback`,
  apiBaseUrl: "https://api.prod.whoop.com/developer/v1",
  scopes: [
    "read:sleep",
    "read:recovery",
    "read:cycles",
    "read:workout",
    "read:profile",
    "read:body_measurement",
  ].join(" "),
};

class WhoopService {
  accessToken = null;
  refreshToken = null;
  tokenExpiry = null;

  constructor() {
    try {
      this.accessToken = localStorage.getItem("whoop_access_token");
      this.refreshToken = localStorage.getItem("whoop_refresh_token");
      this.tokenExpiry = localStorage.getItem("whoop_token_expiry");

      // Log token state on initialization
      console.log("Token state on initialization:", {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        tokenExpiry: this.tokenExpiry
          ? new Date(parseInt(this.tokenExpiry)).toISOString()
          : null,
      });
    } catch (error) {
      console.error("Error initializing WhoopService:", error);
      this.logout(); // Clear any potentially corrupted state
    }
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: WHOOP_CONFIG.clientId,
      redirect_uri: WHOOP_CONFIG.redirectUri,
      response_type: "code",
      scope: WHOOP_CONFIG.scopes,
      state: Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    });
    return `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`;
  }

  async handleAuthCallback(code) {
    try {
      console.log("Starting token exchange with code:", code);
      const response = await axios.post(`${BACK_URL}/whoop/token`, {
        code,
      });
      console.log("Token exchange response:", response.data);

      const { access_token, refresh_token, expires_in } = response.data;

      if (!access_token) {
        throw new Error("No access token received in response");
      }

      if (!refresh_token) {
        console.warn("No refresh token received in response");
      }

      if (!expires_in) {
        console.warn("No expiration time received in response");
      }

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      this.tokenExpiry = Date.now() + (expires_in || 3600) * 1000;

      try {
        localStorage.setItem("whoop_access_token", access_token);
        if (refresh_token) {
          localStorage.setItem("whoop_refresh_token", refresh_token);
        }
        localStorage.setItem("whoop_token_expiry", this.tokenExpiry.toString());

        console.log("Successfully stored tokens:", {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
          tokenExpiry: new Date(this.tokenExpiry).toISOString(),
        });
      } catch (storageError) {
        console.error("Error storing tokens in localStorage:", storageError);
        throw new Error("Failed to store authentication tokens");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      this.logout(); // Clear any partial state
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        console.error("No refresh token available");
        throw new Error("No hay token de actualización disponible");
      }

      console.log("Attempting to refresh token");
      const response = await axios.post(`${BACK_URL}/whoop/refresh`, {
        refresh_token: this.refreshToken,
      });
      console.log("Token refresh response:", response.data);

      const { access_token, refresh_token, expires_in } = response.data;

      if (!access_token) {
        throw new Error("No access token received in refresh response");
      }

      this.accessToken = access_token;
      if (refresh_token) {
        this.refreshToken = refresh_token;
      }
      this.tokenExpiry = Date.now() + (expires_in || 3600) * 1000;

      try {
        localStorage.setItem("whoop_access_token", access_token);
        if (refresh_token) {
          localStorage.setItem("whoop_refresh_token", refresh_token);
        }
        localStorage.setItem("whoop_token_expiry", this.tokenExpiry.toString());

        console.log("Successfully refreshed tokens:", {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
          tokenExpiry: new Date(this.tokenExpiry).toISOString(),
        });
      } catch (storageError) {
        console.error("Error storing refreshed tokens:", storageError);
        throw new Error("Failed to store refreshed tokens");
      }

      return access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.logout();
      throw error;
    }
  }

  async getHeaders() {
    if (!this.accessToken) {
      throw new Error("No autenticado");
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (this.tokenExpiry && Date.now() + 300000 > this.tokenExpiry) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        throw new Error("Error al actualizar el token de acceso");
      }
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  async makeAuthenticatedRequest(method, endpoint, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios({
        method,
        url: `${WHOOP_CONFIG.apiBaseUrl}${endpoint}${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`,
        headers: await this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh the token once
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          const response = await axios({
            method,
            url: `${WHOOP_CONFIG.apiBaseUrl}${endpoint}${
              queryParams.toString() ? `?${queryParams.toString()}` : ""
            }`,
            headers: await this.getHeaders(),
          });
          return response.data;
        } catch (refreshError) {
          console.error("Error al actualizar el token:", refreshError);
          this.logout();
          throw new Error(
            "La sesión ha expirado. Por favor, vuelve a iniciar sesión."
          );
        }
      }
      throw error;
    }
  }

  async getSleepData(start, end) {
    try {
      return await this.makeAuthenticatedRequest("GET", "/activity/sleep", {
        start,
        end,
      });
    } catch (error) {
      console.error("Error obteniendo datos de sueño:", error);
      throw error;
    }
  }

  async getProfile() {
    try {
      return await this.makeAuthenticatedRequest("GET", "/user/profile/basic");
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      throw error;
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem("whoop_access_token");
    localStorage.removeItem("whoop_refresh_token");
    localStorage.removeItem("whoop_token_expiry");
  }

  isAuthenticated() {
    return (
      !!this.accessToken && (!this.tokenExpiry || Date.now() < this.tokenExpiry)
    );
  }

  async getCycles(start, end) {
    try {
      return await this.makeAuthenticatedRequest("GET", "/cycle", {
        start,
        end,
      });
    } catch (error) {
      console.error("Error obteniendo ciclos:", error);
      throw error;
    }
  }

  async getRecoveryData(start, end) {
    try {
      return await this.makeAuthenticatedRequest("GET", "/recovery", {
        start,
        end,
      });
    } catch (error) {
      console.error("Error obteniendo recuperación:", error);
      throw error;
    }
  }

  async getWorkouts(start, end) {
    try {
      return await this.makeAuthenticatedRequest("GET", "/activity/workout", {
        start,
        end,
      });
    } catch (error) {
      console.error("Error obteniendo workouts:", error);
      throw error;
    }
  }
}

const whoopService = new WhoopService();
export default whoopService;

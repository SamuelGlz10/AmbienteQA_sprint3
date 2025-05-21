import axios from 'axios';

const WHOOP_CONFIG = {
    clientId: '4a7cd98e-1a62-45c4-ad24-59011db56b9f',
    clientSecret: 'a315fb94189d174a4ef205b479199c28e496d9fa575bed088d70911f0de0fb35',
    redirectUri: 'http://localhost:5173/whoop-callback',
    apiBaseUrl: 'https://api.prod.whoop.com/developer/v1',
    scopes: [
        'read:sleep',
        'read:recovery',
        'read:cycles',
        'read:workout',
        'read:profile',
        'read:body_measurement'
    ].join(' ')
};

class WhoopService {
    accessToken = null;

    constructor() {
        this.accessToken = localStorage.getItem('whoop_access_token');
    }

    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: WHOOP_CONFIG.clientId,
            redirect_uri: WHOOP_CONFIG.redirectUri,
            response_type: 'code',
            scope: WHOOP_CONFIG.scopes,
            state: Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
        });
        return `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`;
    }

    async handleAuthCallback(code) {
        try {
            const response = await axios.post('http://localhost:5001/whoop/token', { code });
            const accessToken = response.data.access_token;
            if (typeof accessToken === 'string') {
                this.accessToken = accessToken;
                localStorage.setItem('whoop_access_token', accessToken);
            } else {
                throw new Error('No se recibió el token de acceso');
            }
        } catch (error) {
            console.error('Error durante la autenticación:', error);
            throw error;
        }
    }

    getHeaders() {
        if (!this.accessToken) {
            throw new Error('No autenticado');
        }
        return {
            Authorization: `Bearer ${this.accessToken}`
        };
    }

    async getSleepData(start, end) {
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            const response = await axios.get(
                `${WHOOP_CONFIG.apiBaseUrl}/activity/sleep?${params.toString()}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo datos de sueño:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const response = await axios.get(
                `${WHOOP_CONFIG.apiBaseUrl}/user/profile/basic`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    logout() {
        this.accessToken = null;
        localStorage.removeItem('whoop_access_token');
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    async getCycles(start, end) {
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            const response = await axios.get(
                `${WHOOP_CONFIG.apiBaseUrl}/cycle?${params.toString()}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo ciclos:', error);
            throw error;
        }
    }

    async getRecoveryData(start, end) {
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            const response = await axios.get(
                `${WHOOP_CONFIG.apiBaseUrl}/recovery?${params.toString()}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo recuperación:', error);
            throw error;
        }
    }

    async getWorkouts(start, end) {
        try {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            const response = await axios.get(
                `${WHOOP_CONFIG.apiBaseUrl}/activity/workout?${params.toString()}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo workouts:', error);
            throw error;
        }
    }
}

const whoopService = new WhoopService();
export default whoopService; 
import { apiClient } from './api';
import { AIResponse, AISatelliteAnalysisRequest, EmergencyPriorityResponse } from '../types/cyclone';

const AI_REQUEST_TIMEOUT_MS = 25000;

function normalizeAIResponse(raw: any, fallbackCycloneId: string, fallbackTitle: string): AIResponse {
  if (typeof raw === 'string') {
    return {
      cyclone_id: fallbackCycloneId,
      title: fallbackTitle,
      generated_at: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      model_used: 'CycloneShield FastAPI AI Engine',
      is_simulated_fallback: false,
      content: raw,
      key_findings: [],
      recommended_actions: [],
      disclaimer: 'AI-GENERATED PROTOTYPE ANALYSIS. Not an official meteorological or disaster management order.',
    };
  }

  const data = raw?.data && typeof raw.data === 'object' && !raw.content ? raw.data : raw;
  return {
    cyclone_id: data?.cyclone_id || fallbackCycloneId,
    title: data?.title || fallbackTitle,
    generated_at:
      data?.generated_at ||
      new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    model_used: data?.model_used || 'CycloneShield FastAPI AI Engine',
    is_simulated_fallback: Boolean(data?.is_simulated_fallback),
    content:
      typeof data?.content === 'string'
        ? data.content
        : typeof data?.analysis === 'string'
        ? data.analysis
        : typeof data?.text === 'string'
        ? data.text
        : JSON.stringify(data ?? {}),
    key_findings: Array.isArray(data?.key_findings) ? data.key_findings : [],
    recommended_actions: Array.isArray(data?.recommended_actions) ? data.recommended_actions : [],
    disclaimer:
      data?.disclaimer ||
      'AI-GENERATED PROTOTYPE ANALYSIS. Not an official meteorological or disaster management order.',
    sar_data: data?.sar_data ?? undefined,
  };
}

function normalizeEmergencyResponse(
  raw: any,
  fallbackCycloneId: string
): EmergencyPriorityResponse {
  const data = raw?.data && typeof raw.data === 'object' && !raw.priorities ? raw.data : raw;
  return {
    cyclone_id: data?.cyclone_id || fallbackCycloneId,
    generated_at:
      data?.generated_at ||
      new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    priorities: Array.isArray(data?.priorities) ? data.priorities : [],
    model_used: data?.model_used || 'CycloneShield Operational Multi-Hazard Priority Engine v1.0',
    disclaimer:
      data?.disclaimer ||
      'AI-GENERATED PROTOTYPE PRIORITY ANALYSIS. Not official emergency orders.',
  };
}

export function parseAiRequestError(err: any): { isTimeout: boolean; message: string } {
  const code = err?.code || '';
  const rawMsg = String(err?.message || '');
  const isTimeout =
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    rawMsg.toLowerCase().includes('timeout') ||
    rawMsg.toLowerCase().includes('timed out');

  if (isTimeout) {
    return {
      isTimeout: true,
      message:
        'Request timeout: The FastAPI / Gemini AI reasoning service did not respond within 25 seconds.',
    };
  }

  const status = err?.response?.status;
  const detail =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.response?.data?.error;

  if (status === 404) {
    return {
      isTimeout: false,
      message: detail ? `Invalid cyclone ID or resource not found: ${detail}` : 'Invalid cyclone ID (404 Not Found).',
    };
  }
  if (status === 400 || status === 422) {
    return {
      isTimeout: false,
      message: detail ? `Invalid request: ${ JSON.stringify(detail) }` : `Invalid request payload (HTTP ${status}).`,
    };
  }
  if (status === 503 || status === 502 || status === 504) {
    return {
      isTimeout: false,
      message: detail ? `AI service unavailable: ${detail}` : `AI service unavailable (HTTP ${status}).`,
    };
  }
  if (status && status >= 500) {
    return {
      isTimeout: false,
      message: detail ? `Backend AI service error: ${detail}` : `Backend AI service error (HTTP ${status}).`,
    };
  }
  if (!err?.response) {
    return {
      isTimeout: false,
      message: `Backend unavailable: Unable to connect to the FastAPI AI endpoint (${rawMsg || 'Network Error'}).`,
    };
  }

  return {
    isTimeout: false,
    message: detail ? String(detail) : rawMsg || 'AI reasoning request failed.',
  };
}

export const aiApi = {
  explainRisk: async (cycloneId: string, assetId?: string, district?: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>(
      '/v1/ai/explain-risk',
      {
        cyclone_id: cycloneId,
        asset_id: assetId,
        district,
      },
      { timeout: AI_REQUEST_TIMEOUT_MS }
    );
    return normalizeAIResponse(res.data, cycloneId, 'Infrastructure Asset Risk Explanation');
  },

  explainLandfall: async (cycloneId: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>(
      '/v1/ai/explain-landfall',
      {
        cyclone_id: cycloneId,
      },
      { timeout: AI_REQUEST_TIMEOUT_MS }
    );
    return normalizeAIResponse(res.data, cycloneId, 'Landfall Impact Analysis');
  },

  analyzeSatellite: async (requestOrCycloneId: AISatelliteAnalysisRequest | string): Promise<AIResponse> => {
    const payload: AISatelliteAnalysisRequest =
      typeof requestOrCycloneId === 'string'
        ? {
            cyclone_id: requestOrCycloneId,
            satellite_source: 'Sentinel-1 SAR / INSAT-3DR',
            analysis_type: 'SAR_RECONNAISSANCE',
          }
        : {
            satellite_source: 'Sentinel-1 SAR / INSAT-3DR',
            analysis_type: 'SAR_RECONNAISSANCE',
            ...requestOrCycloneId,
          };

    const res = await apiClient.post<AIResponse>('/v1/ai/analyze-satellite', payload, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });
    return normalizeAIResponse(res.data, payload.cyclone_id, 'Multimodal SAR Flood Analysis');
  },

  generateEmergencyPlan: async (cycloneId: string): Promise<EmergencyPriorityResponse> => {
    const res = await apiClient.post<EmergencyPriorityResponse>(
      '/v1/ai/generate-emergency-plan',
      {
        cyclone_id: cycloneId,
      },
      { timeout: AI_REQUEST_TIMEOUT_MS }
    );
    return normalizeEmergencyResponse(res.data, cycloneId);
  },

  generateReport: async (cycloneId: string): Promise<AIResponse> => {
    const res = await apiClient.post<AIResponse>(
      '/v1/ai/generate-report',
      {
        cyclone_id: cycloneId,
        include_satellite: true,
        include_gis_zones: true,
      },
      { timeout: AI_REQUEST_TIMEOUT_MS }
    );
    return normalizeAIResponse(res.data, cycloneId, 'Disaster Briefing & Incident Action Report');
  },
};


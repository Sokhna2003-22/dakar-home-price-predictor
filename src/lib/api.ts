const API_URL = "/api";

export interface PredictionRequest {
  surface: number;
  chambres: number;
  salles_de_bain: number;
  cuisines: number;
  etage: number;
  salons: number;
  localisation: string;
  ascenseur: number;
  jardin: number;
  parking: number;
  internet: number;
  piscine: number;
  climatisation: number;
  surveillance: number;
}

export interface PredictionResponse {
  prix_estime: number;
}

export async function predictPrice(data: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  return response.json();
}

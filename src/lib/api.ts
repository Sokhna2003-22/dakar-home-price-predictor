const API_URL = "https://immobilier-api-a87u.onrender.com";

export type PredictionType = "vente" | "location";

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

interface ApiPredictionRequest {
  Surface: number;
  Chambres: number;
  Salles_de_bain: number;
  Cuisines: number;
  Etage: number;
  Salons: number;
  Localisation: string;
  Type: "Vente" | "Location";
  Ascenseur: number;
  Jardin: number;
  Parking: number;
  Internet: number;
  Piscine: number;
  Climatisation: number;
  Surveillance: number;
}

export interface PredictionResponse {
  prix_estime: number;
}

function toApiPayload(data: PredictionRequest, type: PredictionType): ApiPredictionRequest {
  return {
    Surface: data.surface,
    Chambres: data.chambres,
    Salles_de_bain: data.salles_de_bain,
    Cuisines: data.cuisines,
    Etage: data.etage,
    Salons: data.salons,
    Localisation: data.localisation,
    Type: type === "vente" ? "Vente" : "Location",
    Ascenseur: data.ascenseur,
    Jardin: data.jardin,
    Parking: data.parking,
    Internet: data.internet,
    Piscine: data.piscine,
    Climatisation: data.climatisation,
    Surveillance: data.surveillance,
  };
}

export async function predictPrice(data: PredictionRequest, type: PredictionType): Promise<PredictionResponse> {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(data, type)),
  });

  if (!response.ok) {
    let message = `Erreur API: ${response.status}`;

    try {
      const errorData = await response.json();
      if (typeof errorData?.error === "string" && errorData.error.trim()) {
        message = errorData.error;
      }
    } catch {
      // Ignore non-JSON error bodies and keep the fallback message.
    }

    throw new Error(message);
  }

  return response.json();
}

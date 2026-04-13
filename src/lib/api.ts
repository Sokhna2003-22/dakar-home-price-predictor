const API_URL = "/api";

export type PredictionType = "vente" | "location";

export interface PredictionRequest {
  surface: number;
  chambres: number;
  salles_de_bain: number;
  cuisines: number;
  etage: number;
  salons: number;
  ascenseur: number;
  jardin: number;
  parking: number;
  internet: number;
  piscine: number;
  climatisation: number;
  surveillance: number;
}

interface ApiPredictionRequest {
  Nb_Chambres: number;
  Nb_Salles_Bain: number;
  Surface_m2: number;
  Ascenseur: number;
  Jardin: number;
  Surveillance: number;
  Internet: number;
  Parking: number;
  Piscine: number;
  Climatisation: number;
  Nb_Salons: number;
  Nb_Cuisines: number;
  Nb_Etages: number;
  Type: "Vente" | "Location";
}

export interface PredictionResponse {
  prix_estime: number;
}

function toApiPayload(data: PredictionRequest, type: PredictionType): ApiPredictionRequest {
  return {
    Nb_Chambres: data.chambres,
    Nb_Salles_Bain: data.salles_de_bain,
    Surface_m2: data.surface,
    Ascenseur: data.ascenseur,
    Jardin: data.jardin,
    Surveillance: data.surveillance,
    Internet: data.internet,
    Parking: data.parking,
    Piscine: data.piscine,
    Climatisation: data.climatisation,
    Nb_Salons: data.salons,
    Nb_Cuisines: data.cuisines,
    Nb_Etages: data.etage,
    Type: type === "vente" ? "Vente" : "Location",
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
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { predictPrice, type PredictionRequest } from "@/lib/api";
import {
  Home, MapPin, BedDouble, Maximize, Calculator,
  Waves, TreePine, Car, Wifi, Snowflake, Shield, Building2, TrendingUp, Key, HandCoins,
  Bath, CookingPot, Layers, Sofa, Loader2, Sparkles
} from "lucide-react";

const locations = [
  "Almadies", "Plateau", "Ngor", "Mermoz", "Fann", "Point E",
  "Ouakam", "Yoff", "Liberté", "Sacré-Cœur", "Mamelles",
  "Dakar Plateau", "Médina", "Grand Dakar", "Parcelles Assainies",
  "Guédiawaye", "Pikine", "Rufisque", "Diamniadio", "Saly",
];

const equipements = [
  { id: "ascenseur", label: "Ascenseur", icon: Building2 },
  { id: "jardin", label: "Jardin", icon: TreePine },
  { id: "parking", label: "Parking", icon: Car },
  { id: "internet", label: "Internet", icon: Wifi },
  { id: "piscine", label: "Piscine", icon: Waves },
  { id: "climatisation", label: "Climatisation", icon: Snowflake },
  { id: "surveillance", label: "Surveillance", icon: Shield },
];

interface FormData {
  surface: number;
  chambres: number;
  sallesDeBain: number;
  cuisines: number;
  etage: number;
  salons: number;
  localisation: string;
  equipements: Record<string, boolean>;
}

const initialForm: FormData = {
  surface: 150,
  chambres: 3,
  sallesDeBain: 2,
  cuisines: 1,
  etage: 0,
  salons: 1,
  localisation: "",
  equipements: Object.fromEntries(equipements.map((e) => [e.id, false])),
};

function formatCFA(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

const SliderField = ({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </Label>
      <span className="text-sm font-bold text-primary tabular-nums">
        {value}{unit}
      </span>
    </div>
    <Slider
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      className="w-full"
    />
  </div>
);

const PredictionForm = ({ type }: { type: "vente" | "location" }) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEquipement = (id: string) => {
    setForm((prev) => ({
      ...prev,
      equipements: { ...prev.equipements, [id]: !prev.equipements[id] },
    }));
  };

  const handlePredict = async () => {
    if (!form.localisation) {
      setError("Veuillez sélectionner un quartier.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: PredictionRequest = {
        surface: form.surface,
        chambres: form.chambres,
        salles_de_bain: form.sallesDeBain,
        cuisines: form.cuisines,
        etage: form.etage,
        salons: form.salons,
        localisation: form.localisation,
        ascenseur: form.equipements.ascenseur ? 1 : 0,
        jardin: form.equipements.jardin ? 1 : 0,
        parking: form.equipements.parking ? 1 : 0,
        internet: form.equipements.internet ? 1 : 0,
        piscine: form.equipements.piscine ? 1 : 0,
        climatisation: form.equipements.climatisation ? 1 : 0,
        surveillance: form.equipements.surveillance ? 1 : 0,
      };
      const result = await predictPrice(payload);
      setPrediction(result.prix_estime);
    } catch {
      setError("Erreur lors de la prédiction. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5">
        <SliderField icon={Maximize} label="Surface" value={form.surface} min={20} max={1000} step={10}
          onChange={(v) => setForm((p) => ({ ...p, surface: v }))} unit=" m²" />
        <SliderField icon={BedDouble} label="Chambres" value={form.chambres} min={1} max={10} step={1}
          onChange={(v) => setForm((p) => ({ ...p, chambres: v }))} />
        <SliderField icon={Bath} label="Salles de bain" value={form.sallesDeBain} min={1} max={6} step={1}
          onChange={(v) => setForm((p) => ({ ...p, sallesDeBain: v }))} />
        <SliderField icon={CookingPot} label="Cuisines" value={form.cuisines} min={1} max={4} step={1}
          onChange={(v) => setForm((p) => ({ ...p, cuisines: v }))} />
        <SliderField icon={Layers} label="Étage" value={form.etage} min={0} max={20} step={1}
          onChange={(v) => setForm((p) => ({ ...p, etage: v }))} />
        <SliderField icon={Sofa} label="Salons" value={form.salons} min={1} max={5} step={1}
          onChange={(v) => setForm((p) => ({ ...p, salons: v }))} />
      </div>

      {/* Localisation */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <MapPin className="h-4 w-4 text-primary" /> Localisation
        </Label>
        <Select value={form.localisation} onValueChange={(v) => setForm((p) => ({ ...p, localisation: v }))}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Choisir un quartier..." />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Équipements */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <Home className="h-4 w-4 text-primary" /> Équipements
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {equipements.map(({ id, label, icon: Icon }) => {
            const active = form.equipements[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleEquipement(id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200
                  ${active
                    ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                  }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bouton */}
      <Button
        onClick={handlePredict}
        disabled={loading}
        className="w-full h-12 text-sm font-semibold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        size="lg"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Calculator className="h-5 w-5" />
        )}
        {loading ? "Calcul en cours..." : type === "vente" ? "Estimer le prix de vente" : "Estimer le loyer mensuel"}
      </Button>

      {error && (
        <p className="text-sm text-destructive text-center font-medium">{error}</p>
      )}

      {/* Résultat */}
      {prediction !== null && !loading && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border border-primary/20 p-6">
          <div className="absolute top-2 right-2">
            <Sparkles className="h-5 w-5 text-primary/30" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {type === "vente" ? "Prix estimé" : "Loyer mensuel estimé"}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
              {formatCFA(prediction)}
            </p>
            {type === "location" && (
              <p className="text-xs text-muted-foreground">par mois</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              DakarImmo
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Estimation immobilière intelligente
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="container px-4 pt-12 pb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-2">
          <Sparkles className="h-3 w-3" /> Propulsé par l'IA
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
          Estimez votre bien
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            immobilier à Dakar
          </span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          Obtenez une estimation précise grâce à notre modèle de prédiction entraîné sur les données du marché dakarois.
        </p>
      </section>

      {/* Main */}
      <main className="container px-4 pb-20 max-w-xl">
        <Card className="shadow-2xl shadow-primary/5 border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="vente" className="w-full">
              <div className="border-b border-border/50 px-4 pt-4">
                <TabsList className="w-full grid grid-cols-2 h-11 rounded-xl bg-muted/50">
                  <TabsTrigger value="vente" className="gap-2 rounded-lg text-xs font-semibold data-[state=active]:shadow-sm">
                    <Key className="h-3.5 w-3.5" /> Vente
                  </TabsTrigger>
                  <TabsTrigger value="location" className="gap-2 rounded-lg text-xs font-semibold data-[state=active]:shadow-sm">
                    <HandCoins className="h-3.5 w-3.5" /> Location
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-5">
                <TabsContent value="vente" className="mt-0">
                  <PredictionForm type="vente" />
                </TabsContent>
                <TabsContent value="location" className="mt-0">
                  <PredictionForm type="location" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Les estimations sont basées sur un modèle d'apprentissage automatique et peuvent varier.
        </p>
      </main>
    </div>
  );
};

export default Index;

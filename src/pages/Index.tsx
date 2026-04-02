import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Home, MapPin, BedDouble, Maximize, Calculator,
  Waves, TreePine, Car, Wifi, Snowflake, Shield, Building2, TrendingUp, Key, HandCoins,
  Bath, CookingPot, Layers, Sofa
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

function simulatePrice(data: FormData, type: "vente" | "location"): number | null {
  if (!data.localisation || data.surface <= 0) return null;

  const locCoeffs: Record<string, number> = {
    Almadies: 1.8, Plateau: 1.7, Ngor: 1.75, Mermoz: 1.5, Fann: 1.45,
    "Point E": 1.4, Ouakam: 1.3, Yoff: 1.2, Liberté: 1.15,
    "Sacré-Cœur": 1.35, Mamelles: 1.55, "Dakar Plateau": 1.6,
    Médina: 1.0, "Grand Dakar": 0.95, "Parcelles Assainies": 0.85,
    Guédiawaye: 0.75, Pikine: 0.7, Rufisque: 0.65, Diamniadio: 0.8, Saly: 1.1,
  };

  const coeff = locCoeffs[data.localisation] ?? 1;
  const eqCount = Object.values(data.equipements).filter(Boolean).length;

  if (type === "vente") {
    const base = data.surface * 650000;
    const chambreBonus = data.chambres * 5000000;
    const eqBonus = eqCount * 3500000;
    return Math.round((base + chambreBonus + eqBonus) * coeff);
  } else {
    const base = data.surface * 3500;
    const chambreBonus = data.chambres * 25000;
    const eqBonus = eqCount * 15000;
    return Math.round((base + chambreBonus + eqBonus) * coeff);
  }
}

function formatCFA(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

const PredictionForm = ({ type }: { type: "vente" | "location" }) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [prediction, setPrediction] = useState<number | null>(null);

  const toggleEquipement = (id: string) => {
    setForm((prev) => ({
      ...prev,
      equipements: { ...prev.equipements, [id]: !prev.equipements[id] },
    }));
  };

  const handlePredict = () => {
    setPrediction(simulatePrice(form, type));
  };

  return (
    <div className="space-y-6">
      {/* Surface */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Maximize className="h-4 w-4 text-accent" /> Surface (m²)
        </Label>
        <div className="flex items-center gap-4">
          <Slider
            min={20}
            max={1000}
            step={10}
            value={[form.surface]}
            onValueChange={([v]) => setForm((p) => ({ ...p, surface: v }))}
            className="flex-1"
          />
          <Input
            type="number"
            min={1}
            value={form.surface}
            onChange={(e) => setForm((p) => ({ ...p, surface: Number(e.target.value) || 0 }))}
            className="w-24 text-center"
          />
        </div>
      </div>

      {/* Chambres */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <BedDouble className="h-4 w-4 text-accent" /> Nombre de chambres
        </Label>
        <div className="flex items-center gap-4">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[form.chambres]}
            onValueChange={([v]) => setForm((p) => ({ ...p, chambres: v }))}
            className="flex-1"
          />
          <span className="w-24 text-center font-bold text-lg">{form.chambres}</span>
        </div>
      </div>

      {/* Localisation */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-accent" /> Localisation
        </Label>
        <Select
          value={form.localisation}
          onValueChange={(v) => setForm((p) => ({ ...p, localisation: v }))}
        >
          <SelectTrigger>
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
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Home className="h-4 w-4 text-accent" /> Équipements
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {equipements.map(({ id, label, icon: Icon }) => {
            const active = form.equipements[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleEquipement(id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all
                  ${active
                    ? "border-accent bg-accent/10 text-accent-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:bg-accent/5"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bouton */}
      <Button onClick={handlePredict} className="w-full h-12 text-base font-semibold gap-2" size="lg">
        <Calculator className="h-5 w-5" />
        {type === "vente" ? "Estimer le prix de vente" : "Estimer le loyer mensuel"}
      </Button>

      {/* Résultat */}
      {prediction !== null && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col items-center py-6 gap-2">
            <TrendingUp className="h-8 w-8 text-accent" />
            <p className="text-sm text-muted-foreground font-medium">
              {type === "vente" ? "Prix estimé" : "Loyer mensuel estimé"}
            </p>
            <p className="text-3xl font-bold text-primary tracking-tight">
              {formatCFA(prediction)}
            </p>
            {type === "location" && (
              <p className="text-xs text-muted-foreground">par mois</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">DakarImmo</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">Prédiction de prix immobilier à Dakar</span>
        </div>
      </header>

      {/* Hero */}
      <section className="container px-4 pt-10 pb-6 text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          Estimez le prix de votre bien immobilier
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Renseignez les caractéristiques de la maison et obtenez une estimation instantanée du prix de vente ou du loyer à Dakar.
        </p>
      </section>

      {/* Main */}
      <main className="container px-4 pb-16 max-w-2xl">
        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-4">
            <Tabs defaultValue="vente" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="vente" className="gap-2">
                  <Key className="h-4 w-4" /> Vente
                </TabsTrigger>
                <TabsTrigger value="location" className="gap-2">
                  <HandCoins className="h-4 w-4" /> Location
                </TabsTrigger>
              </TabsList>

              <CardTitle className="sr-only">Formulaire de prédiction</CardTitle>
              <CardDescription className="sr-only">
                Entrez les caractéristiques du bien pour obtenir une estimation
              </CardDescription>

              <TabsContent value="vente" className="mt-6">
                <PredictionForm type="vente" />
              </TabsContent>
              <TabsContent value="location" className="mt-6">
                <PredictionForm type="location" />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};

export default Index;

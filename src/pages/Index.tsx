import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { predictPrice, type PredictionRequest, type PredictionType } from "@/lib/api";
import { LOCATIONS } from "@/lib/locations";
import {
  Home, BedDouble, Maximize, MapPin,
  Waves, TreePine, Car, Wifi, Snowflake, Shield, Building2, TrendingUp, Key, HandCoins,
  Bath, CookingPot, Layers, Sofa, Loader2, Sparkles, ArrowRight
} from "lucide-react";

const equipements = [
  { id: "ascenseur", label: "Ascenseur", icon: Building2 },
  { id: "jardin", label: "Jardin", icon: TreePine },
  { id: "parking", label: "Parking", icon: Car },
  { id: "internet", label: "Internet", icon: Wifi },
  { id: "piscine", label: "Piscine", icon: Waves },
  { id: "climatisation", label: "Clim.", icon: Snowflake },
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
  return new Intl.NumberFormat("fr-FR").format(Math.round(value)) + " FCFA";
}

/* ---------- Champs réutilisables (style image) ---------- */

const TextField = ({
  label, icon: Icon, children,
}: { label: string; icon?: React.ElementType; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-sm font-semibold text-form-panel-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />} {label}
    </Label>
    {children}
  </div>
);

const PillOptions = ({
  value, onChange, options,
}: {
  value: number;
  onChange: (v: number) => void;
  options: { label: string; value: number }[];
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
            ${active
              ? "bg-chip-active text-white border-chip-active shadow-sm"
              : "bg-white/80 text-form-panel-foreground border-white/80 hover:bg-white"
            }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const NumberInput = ({
  value, onChange, min = 0, max = 9999, suffix,
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; suffix?: string;
}) => (
  <div className="relative">
    <Input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="bg-white border-white text-form-panel-foreground rounded-lg h-10 pr-12"
    />
    {suffix && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
        {suffix}
      </span>
    )}
  </div>
);

/* ---------- Formulaire principal ---------- */

const PredictionForm = ({ type }: { type: PredictionType }) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locSearch, setLocSearch] = useState("");
  const [locOpen, setLocOpen] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!locSearch) return LOCATIONS.slice(0, 50);
    const q = locSearch.toLowerCase();
    return LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 50);
  }, [locSearch]);

  const toggleEquipement = (id: string) => {
    setForm((prev) => ({
      ...prev,
      equipements: { ...prev.equipements, [id]: !prev.equipements[id] },
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      if (!form.localisation) {
        setError("Veuillez sélectionner une localisation.");
        setLoading(false);
        return;
      }
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
      const result = await predictPrice(payload, type);
      setPrediction(result.prix_estime);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la prédiction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Ligne 1: Surface + Chambres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Surface" icon={Maximize}>
          <NumberInput value={form.surface} onChange={(v) => setForm((p) => ({ ...p, surface: v }))} suffix="m²" min={10} max={2000} />
        </TextField>
        <TextField label="Étage" icon={Layers}>
          <NumberInput value={form.etage} onChange={(v) => setForm((p) => ({ ...p, etage: v }))} min={0} max={30} />
        </TextField>
      </div>

      {/* Chambres en pilules */}
      <TextField label="Chambres" icon={BedDouble}>
        <PillOptions
          value={form.chambres}
          onChange={(v) => setForm((p) => ({ ...p, chambres: v }))}
          options={[
            { label: "1", value: 1 }, { label: "2", value: 2 },
            { label: "3", value: 3 }, { label: "4", value: 4 },
            { label: "5+", value: 5 },
          ]}
        />
      </TextField>

      {/* Salles de bain en pilules */}
      <TextField label="Salles de bain" icon={Bath}>
        <PillOptions
          value={form.sallesDeBain}
          onChange={(v) => setForm((p) => ({ ...p, sallesDeBain: v }))}
          options={[
            { label: "1", value: 1 }, { label: "2", value: 2 },
            { label: "3", value: 3 }, { label: "4+", value: 4 },
          ]}
        />
      </TextField>

      {/* Cuisines + Salons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Cuisines" icon={CookingPot}>
          <PillOptions
            value={form.cuisines}
            onChange={(v) => setForm((p) => ({ ...p, cuisines: v }))}
            options={[
              { label: "1", value: 1 }, { label: "2", value: 2 }, { label: "3+", value: 3 },
            ]}
          />
        </TextField>
        <TextField label="Salons" icon={Sofa}>
          <PillOptions
            value={form.salons}
            onChange={(v) => setForm((p) => ({ ...p, salons: v }))}
            options={[
              { label: "1", value: 1 }, { label: "2", value: 2 }, { label: "3+", value: 3 },
            ]}
          />
        </TextField>
      </div>

      {/* Localisation */}
      <TextField label="Localisation" icon={MapPin}>
        <div className="relative">
          <Input
            placeholder="Rechercher un quartier..."
            value={form.localisation || locSearch}
            onChange={(e) => {
              setLocSearch(e.target.value);
              setForm((p) => ({ ...p, localisation: "" }));
              setLocOpen(true);
            }}
            onFocus={() => setLocOpen(true)}
            onBlur={() => setTimeout(() => setLocOpen(false), 150)}
            className="bg-white border-white text-form-panel-foreground rounded-lg h-10"
          />
          {locOpen && filteredLocations.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setForm((p) => ({ ...p, localisation: loc }));
                    setLocSearch("");
                    setLocOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
      </TextField>

      {/* Équipements */}
      <TextField label="Équipements" icon={Home}>
        <div className="flex flex-wrap gap-2">
          {equipements.map(({ id, label, icon: Icon }) => {
            const active = form.equipements[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleEquipement(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border
                  ${active
                    ? "bg-chip-active text-white border-chip-active shadow-sm"
                    : "bg-white/80 text-form-panel-foreground border-white/80 hover:bg-white"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </TextField>

      {/* Bouton + Résultat */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-form-panel-foreground/70">
          Estimation basée sur le marché de Dakar
        </div>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-side-panel hover:bg-side-panel/90 text-side-panel-foreground font-semibold px-6 py-2.5 rounded-full shadow-md transition-all disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Calcul..." : "Estimer"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium bg-white/70 rounded-lg px-3 py-2">{error}</p>
      )}

      {prediction !== null && !loading && (
        <div className="rounded-2xl bg-white/90 border border-white p-5 flex flex-col items-center gap-1.5 shadow-sm">
          <TrendingUp className="h-6 w-6 text-chip-active" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {type === "vente" ? "Prix estimé" : "Loyer mensuel estimé"}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-side-panel tracking-tight">
            {formatCFA(prediction)}
          </p>
          {type === "location" && <p className="text-xs text-muted-foreground">par mois</p>}
        </div>
      )}
    </div>
  );
};

/* ---------- Page ---------- */

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr]">
        
        {/* Panneau latéral mauve */}
        <aside className="bg-side-panel text-side-panel-foreground p-6 sm:p-8 flex flex-col justify-between min-h-[200px] md:min-h-[640px] relative overflow-hidden">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="h-9 w-9 rounded-full bg-chip-active flex items-center justify-center shadow-md">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-wide uppercase">DakarImmo</span>
          </div>

          <div className="hidden md:block relative z-10 space-y-3">
            <h2 className="text-2xl font-bold leading-tight">
              Estimez votre bien à Dakar
            </h2>
            <p className="text-sm text-side-panel-foreground/80 leading-relaxed">
              Notre IA analyse les données du marché pour vous donner une estimation précise en quelques secondes.
            </p>
            <div className="flex items-center gap-2 text-xs text-side-panel-foreground/70 pt-2">
              <Sparkles className="h-3.5 w-3.5" /> Propulsé par l'IA
            </div>
          </div>

          {/* Décoration */}
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-chip-active/20 pointer-events-none" />
        </aside>

        {/* Panneau formulaire pêche */}
        <section className="bg-form-panel text-form-panel-foreground p-6 sm:p-8 lg:p-10">
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
              Bonjour ! Estimons la valeur de votre bien immobilier
            </h1>
            <p className="text-sm text-form-panel-foreground/70 mt-1">
              Remplissez les informations ci-dessous pour obtenir votre estimation.
            </p>
          </div>

          <Tabs defaultValue="vente" className="w-full">
            <TabsList className="bg-white/60 rounded-full p-1 h-11 mb-5 grid grid-cols-2 w-full sm:w-auto sm:inline-grid">
              <TabsTrigger
                value="vente"
                className="rounded-full text-xs font-semibold gap-1.5 data-[state=active]:bg-side-panel data-[state=active]:text-side-panel-foreground px-5"
              >
                <Key className="h-3.5 w-3.5" /> Vente
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="rounded-full text-xs font-semibold gap-1.5 data-[state=active]:bg-side-panel data-[state=active]:text-side-panel-foreground px-5"
              >
                <HandCoins className="h-3.5 w-3.5" /> Location
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vente" className="mt-0"><PredictionForm type="vente" /></TabsContent>
            <TabsContent value="location" className="mt-0"><PredictionForm type="location" /></TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default Index;

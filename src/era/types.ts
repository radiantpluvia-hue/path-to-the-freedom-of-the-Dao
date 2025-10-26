export type EraTemplate = {
  id: string;
  name: string;
  index: number;
  description: string;
  seedHint?: string;
  modifiers: {
    qiDensity: number;
    demonicQi: number;
    holyQi: number;
    sectCorruptionRate: number;
    eventBias: { dark: number; neutral: number; light: number };
    tribulationSeverity: number;
    artifactDensity: number;
  };
  startingFactions: Array<{ id: string; type: string; influence: number }>;
  uniqueEvents: string[];
  availableMentors: string[];
};

export type Era = EraTemplate & { generatedSeed: string; generatedAt: number };

export type EraNormalized = {
  qiDensityNorm: number;
  artifactDensityNorm: number;
};

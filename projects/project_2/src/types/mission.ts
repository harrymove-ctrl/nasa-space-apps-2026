export type OutpostId = "lunar-south" | "mars-jezero";

export type MissionGrade = "S" | "A" | "B" | "C" | "FAIL";

export type SpaceWeatherCategory = "SEP" | "CME" | "GST" | "FLR";

export interface OutpostProfile {
  readonly id: OutpostId;
  readonly name: string;
  readonly code: string;
  readonly locationLabel: string;
  readonly gravityG: number;
  readonly atmosphericShieldingGcm2: number;
  readonly solarPeakKw: number;
  readonly baseO2UsePerHour: number;
  readonly baseWaterUsePerHour: number;
  readonly basePowerDemandKw: number;
  readonly dustAttenuationBaseline: number;
  readonly description: string;
}

export interface DonkiStormEvent {
  readonly id: string;
  readonly category: SpaceWeatherCategory;
  readonly title: string;
  readonly startTime: string;
  readonly peakTime: string;
  readonly speedKmS: number;
  readonly kpIndex: number;
  readonly protonFluxPfu: number;
  readonly xrayClass: string;
  readonly doseRateMsvHr: number;
  readonly linkedInstruments: readonly string[];
  readonly summary: string;
  readonly sourceUrl: string;
  readonly verifiedLive?: boolean;
}

export interface OsdrStudyRecord {
  readonly osdId: string;
  readonly title: string;
  readonly organism: string;
  readonly tissueOrCell: string;
  readonly radiationType: "PROTON_1H" | "HZE_56FE" | "GAMMA" | "LUNAR_CENTRIFUGE";
  readonly doseDescription: string;
  readonly stressMultiplier: number;
  readonly bioHalfLifeHours: number;
  readonly keyPathways: readonly string[];
  readonly countermeasureHint: string;
  readonly summary: string;
  readonly osdrUrl: string;
}

export interface MissionDrill {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly defaultOutpost: OutpostId;
  readonly durationHours: number;
  readonly maxSafeDoseMsv: number;
  readonly minSafeO2Pct: number;
  readonly minSafeWaterPct: number;
  readonly minSafeHydroPct?: number;
  readonly gustPeakPfu?: number;
  readonly gustDoseRateMsvHr?: number;
  readonly linkedStormId: string;
  readonly linkedOsdId: string;
  readonly timelineCurve: readonly number[];
  readonly juniorBriefing: string;
  readonly recommendedWiringHint: string;
}

export interface TelemetryProvenance {
  readonly source:
    | "LIVE_NOAA_OSDR"
    | "LIVE_NOAA_SWPC"
    | "LIVE_NASA_DONKI"
    | "VERIFIED_SNAPSHOT";
  readonly lastSyncUtc: string;
  readonly goesProton10Mev: number;
  readonly goesProton100Mev: number;
  readonly goesXrayClass: string;
  readonly swpcKp: number;
  readonly donkiEventCount: number;
  readonly osdrStudyCount: number;
  readonly note: string;
}

export interface HabitatState {
  readonly elapsedHours: number;
  readonly durationHours: number;
  readonly outpostId: OutpostId;
  readonly drillId: string;
  readonly running: boolean;
  readonly finished: boolean;
  readonly o2Pct: number;
  readonly waterPct: number;
  readonly batteryPct: number;
  readonly powerSupplyKw: number;
  readonly powerDemandKw: number;
  readonly powerNetKw: number;
  readonly shieldingGcm2: number;
  readonly stormShelterSealed: boolean;
  readonly scrubberBoostActive: boolean;
  readonly hydroponicsMode: "OPTIMAL" | "CONSERVE" | "OFFLINE";
  readonly hydroponicsYieldPct: number;
  readonly bioCountermeasureActive: boolean;
  readonly waterShieldingActive: boolean;
  readonly protonFluxPfu: number;
  readonly kpIndex: number;
  readonly solarFlareScale: number;
  readonly externalDoseRateMsvHr: number;
  readonly internalDoseRateMsvHr: number;
  readonly cumulativeDoseMsv: number;
  readonly bioStressIndex: number;
  readonly alerts: readonly string[];
  readonly actionLog: readonly string[];
  readonly missionScore: number;
  readonly grade: MissionGrade;
  readonly failureReason: string | null;
}

export interface ActiveActuatorCommands {
  readonly sealStormShelter: boolean;
  readonly divertPowerToShielding: boolean;
  readonly shedHydroponicsLoad: boolean;
  readonly boostO2Scrubber: boolean;
  readonly activateBioCountermeasure: boolean;
  readonly flushWaterShieldWall: boolean;
  readonly telemetryTag: string | null;
}

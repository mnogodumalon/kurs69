// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Dozenten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    email?: string;
    telefon?: string;
    fachgebiet?: string;
  };
}

export interface Raeume {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    raumname?: string;
    gebaeude?: string;
    kapazitaet?: number;
  };
}

export interface Teilnehmer {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    email?: string;
    telefon?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Kurse {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    max_teilnehmer?: number;
    preis?: number;
    dozent?: string; // applookup -> URL zu 'Dozenten' Record
    raum?: string; // applookup -> URL zu 'Raeume' Record
  };
}

export interface Anmeldungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer?: string; // applookup -> URL zu 'Teilnehmer' Record
    kurs?: string; // applookup -> URL zu 'Kurse' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    bezahlt?: boolean;
  };
}

export const APP_IDS = {
  DOZENTEN: '6996f9c887279d4c14d6ae4f',
  RAEUME: '6996f9c93ab43348433b11df',
  TEILNEHMER: '6996f9c988d9c5249630dd20',
  KURSE: '6996f9c9d74b194b1621f6ab',
  ANMELDUNGEN: '6996f9ca3fb06a614d4ebf94',
} as const;

// Helper Types for creating new records
export type CreateDozenten = Dozenten['fields'];
export type CreateRaeume = Raeume['fields'];
export type CreateTeilnehmer = Teilnehmer['fields'];
export type CreateKurse = Kurse['fields'];
export type CreateAnmeldungen = Anmeldungen['fields'];
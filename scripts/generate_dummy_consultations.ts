import { writeFileSync } from "fs";
import { MGF_ICPC2_CODES } from "../src/icpc2-codes.ts";

const YEAR = Number(process.argv[2]);
const SPECIALTY_YEAR = Number(process.argv[3]);
if (
  isNaN(YEAR) ||
  isNaN(SPECIALTY_YEAR) ||
  SPECIALTY_YEAR < 1 ||
  SPECIALTY_YEAR > 4 ||
  YEAR < 2000
)
  throw new Error("Invalid year or specialty year");

const LOCATIONS = [
  "unidade",
  "urgência",
  "complementar",
  "form_curta",
] as const;
const AUTONOMY = ["total", "parcial", "observada", "ombro-a-ombro"] as const;
const TYPES = [
  null,
  "SA",
  "SIJ",
  "PF",
  "SM",
  "DM",
  "HTA",
  "DA",
  "AM",
  "Domicílio",
] as const;
const INTERNSHIPS = [
  null,
  "cardio",
  "endocrino",
  "gastro",
  "geriatria",
  "hemato",
  "neuro",
  "nefro",
  "onco",
  "otorrino",
  "pediatria",
  "psiquiatria",
  "reumato",
  "urologia",
  "gineco",
  "obstetricia",
  "orto",
  "neurocir",
  "pedopsiquiatria",
  "dermato",
  "paliativos",
  "pneumo",
  "cir vascular",
  "cir toracica",
  "cir geral",
  "cir plastica",
  "med interna",
  "form_curta",
] as const;
const SEX = ["m", "f", "other"] as const;
const SMOKER = ["sim", "nao", "ex fumador"] as const;
const FAMILY_TYPES = [null, "tipo1"] as const;
const SCHOOL_LEVELS = [
  null,
  "< 4 anos",
  "4 anos",
  "6 anos",
  "9 anos",
  "11 anos",
  "12 anos",
  "mestrado",
  "bacharelato",
  "licenciatura",
  "doutoramento",
  "curso_tecnologico",
  "pos_graduacao",
  "curso_esp_tecnologica",
] as const;
const PROFESSIONAL_AREAS = [null, "health"] as const;
const PROFESSIONS = [null, "medicine", "nursing", "pharmacy", "other"] as const;
const CONTRACEPTIVES = [
  null,
  "coc",
  "cop",
  "siu",
  "preserv",
  "implante",
  "anel",
  "adesivo",
  "laqueacao",
  "natural",
  "menopausa",
] as const;

function random<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBoolOrNull(): boolean | null {
  const r = Math.random();
  if (r < 0.33) return true;
  if (r < 0.66) return false;
  return null;
}

function randomProcessNumber(): number {
  return Math.floor(100_000_000 + Math.random() * 900_000_000);
}

function randomICPC2Codes(count: number = 1): string[] {
  const codes = [...MGF_ICPC2_CODES];
  const selected: string[] = [];
  for (let i = 0; i < count && codes.length > 0; i++) {
    const index = Math.floor(Math.random() * codes.length);
    const code = codes.splice(index, 1)[0];
    selected.push(`${code.code} - ${code.description}`);
  }
  return selected;
}

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

const values: string[] = [];

const date = new Date(`${YEAR}-01-01`);
while (date.getFullYear() === YEAR) {
  if (isWeekday(date)) {
    const location =
      SPECIALTY_YEAR === 4
        ? random(LOCATIONS.filter((l) => l === "unidade"))
        : random(LOCATIONS);
    const autonomy = random(AUTONOMY);
    const type = location === "unidade" ? random(TYPES) : null;
    const internship = location !== "unidade" ? random(INTERNSHIPS) : null;
    const family_type = location === "unidade" ? random(FAMILY_TYPES) : null;
    const school_level = location === "unidade" ? random(SCHOOL_LEVELS) : null;
    const professional_area =
      location === "unidade" ? random(PROFESSIONAL_AREAS) : null;
    const profession = location === "unidade" ? random(PROFESSIONS) : null;
    const referrence = location === "unidade" ? random(INTERNSHIPS) : null;

    const sex = random(SEX);
    const age = 18 + Math.floor(Math.random() * 70);

    const details = {
      location,
      autonomy,
      type,
      presential: Math.random() < 0.8 ? true : false,
      internship,
      family_type,
      school_level,
      professional_area,
      profession,
      smoker: random(SMOKER),
      vaccination_plan: randomBoolOrNull(),
      chronic_diseases: [],
      problems: randomICPC2Codes(1),
      diagnosis: randomICPC2Codes(1),
      new_diagnosis: Math.random() < 0.3 ? randomICPC2Codes(1) : null,
      referrence,
      referrence_motive: referrence ? randomICPC2Codes(1) : null,
      contraceptive:
        location === "unidade" && sex !== "m" ? random(CONTRACEPTIVES) : null,
      new_contraceptive:
        location === "unidade" && sex !== "m" ? random(CONTRACEPTIVES) : null,
      procedure: ["Observação clínica"],
      notes: ["Gerado automaticamente"],
    };

    values.push(`
(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  ${SPECIALTY_YEAR},'${date
      .toISOString()
      .slice(0, 10)}','${sex}',${age},'years',
  ${randomProcessNumber()},'${location}','${autonomy}',
  '${JSON.stringify(details)}'::jsonb,
  false,NOW(),NOW()
)`);
  }

  date.setDate(date.getDate() + 1);
}

const sql = `
INSERT INTO consultations (
  user_id,
  specialty_id,
  specialty_year,
  date,
  sex,
  age,
  age_unit,
  process_number,
  location,
  autonomy,
  details,
  favorite,
  created_at,
  updated_at
) VALUES
${values.join(",\n")};
`;

writeFileSync(`consultations_${YEAR}_${SPECIALTY_YEAR}.sql`, sql.trim());
console.log(
  `Generated ${values.length} consultations for ${YEAR} ${SPECIALTY_YEAR}`
);

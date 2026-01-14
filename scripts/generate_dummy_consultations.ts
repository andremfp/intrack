import { writeFileSync } from "fs";
import { MGF_ICPC2_CODES } from "../src/icpc2-codes.ts";
import { PROFESSIONS } from "../src/professions.ts";
import {
  MGF_FIELDS,
  COMMON_CONSULTATION_FIELDS,
  type SpecialtyField,
} from "../src/constants.ts";

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

// Helper function to extract option values from a field by key
function getFieldValues(
  fields: SpecialtyField[],
  key: string,
  includeNull: boolean = false
): (string | null)[] {
  const field = fields.find((f) => f.key === key);
  if (!field?.options) {
    return includeNull ? [null] : [];
  }
  const values = field.options
    .filter((opt) => "value" in opt)
    .map((opt) => (opt as { value: string }).value);
  return includeNull ? [null, ...values] : values;
}

// Extract values from constants
const LOCATIONS = getFieldValues(MGF_FIELDS, "location");
const AUTONOMY = getFieldValues(MGF_FIELDS, "autonomy");
const TYPES = getFieldValues(MGF_FIELDS, "type", true);
const INTERNSHIPS = getFieldValues(MGF_FIELDS, "internship", true);
const SEX = getFieldValues(COMMON_CONSULTATION_FIELDS, "sex");
const SMOKER = getFieldValues(MGF_FIELDS, "smoker");
const FAMILY_TYPES = getFieldValues(MGF_FIELDS, "family_type", true);
const SCHOOL_LEVELS = getFieldValues(MGF_FIELDS, "school_level", true);
const PROFESSIONAL_SITUATIONS = getFieldValues(
  MGF_FIELDS,
  "professional_situation",
  true
);
const CONTRACEPTIVES = getFieldValues(MGF_FIELDS, "contraceptive", true);

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

function randomProfession(): string {
  const selected = random(PROFESSIONS);
  return selected.code ?? "";
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
    const professional_situation =
      location === "unidade" ? random(PROFESSIONAL_SITUATIONS) : null;
    const profession = location === "unidade" ? randomProfession() : null;
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
      profession,
      professional_situation,
      smoker: random(SMOKER),
      alcohol: randomBoolOrNull(),
      drugs: randomBoolOrNull(),
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

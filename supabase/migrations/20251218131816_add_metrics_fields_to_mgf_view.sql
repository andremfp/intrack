-- Update consultations_mgf view to include vaccination_plan, family_type, and school_level fields
CREATE OR REPLACE VIEW "public"."consultations_mgf" AS
 SELECT "c"."id",
    "c"."user_id",
    "c"."specialty_year",
    "c"."age",
    "c"."age_unit",
    "c"."date",
    "c"."sex",
    "c"."process_number",
    "c"."autonomy",
    "c"."location",
    "c"."favorite",
    ("c"."details" ->> 'type'::"text") AS "type",
    (("c"."details" ->> 'presential'::"text"))::boolean AS "presential",
    ("c"."details" ->> 'smoker'::"text") AS "smoker",
    ("c"."details" ->> 'vaccination_plan'::"text") AS "vaccination_plan",
    ("c"."details" ->> 'family_type'::"text") AS "family_type",
    ("c"."details" ->> 'school_level'::"text") AS "school_level",
    "c"."details",
    "c"."created_at",
    "c"."updated_at"
   FROM ("public"."consultations" "c"
     JOIN "public"."specialties" "s" ON (("s"."id" = "c"."specialty_id")))
  WHERE ("s"."code" = 'mgf'::"text");

ALTER VIEW "public"."consultations_mgf" OWNER TO "postgres";
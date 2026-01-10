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

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-01','other',22,'years',
  826604378,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"neurocir","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["P20 - Alteração da memória"],"diagnosis":["W96 - Complicação do puerpério, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-02','f',20,'years',
  986665559,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":false,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["X09 - Sinal / sintoma pré-menstrual"],"diagnosis":["A07 - Coma"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-03','f',45,'years',
  754094469,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"psiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["N26 - Medo de cancro do sistema neurológico"],"diagnosis":["P22 - Sinais / sintomas do comportamento da criança"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-04','f',20,'years',
  368585350,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"HTA","presential":true,"internship":null,"family_type":"tipo1","school_level":"primario","professional_area":null,"profession":"medicine","smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["H80 - Malformação congénita do ouvido"],"diagnosis":["R99 - Doença respiratória, outra"],"new_diagnosis":["P99 - Perturbação psicológica, outra"],"referrence":"onco","referrence_motive":["T11 - Desidratação"],"contraceptive":"implante","new_contraceptive":"natural","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-05','f',74,'years',
  569027620,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["U90 - Albuminúria / proteinúria ortostática"],"diagnosis":["S79 - Neoplasia cutânea benigna / incerta"],"new_diagnosis":["Y82 - Hipospádias"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-08','other',42,'years',
  290690856,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"HTA","presential":true,"internship":null,"family_type":null,"school_level":"superior","professional_area":"health","profession":"nursing","smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["W80 - Gravidez ectópica"],"diagnosis":["A87 - Complicações do tratamento"],"new_diagnosis":["S74 - Dermatofitose"],"referrence":"cir toracica","referrence_motive":["P22 - Sinais / sintomas do comportamento da criança"],"contraceptive":"implante","new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-09','m',30,'years',
  787029980,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"SA","presential":true,"internship":null,"family_type":"tipo1","school_level":"mestrado","professional_area":null,"profession":"medicine","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["P23 - Sinais / sintomas do comportamento do adolescente"],"diagnosis":["S92 - Doença das glândulas sudoríparas"],"new_diagnosis":null,"referrence":"neurocir","referrence_motive":["S24 - Sinal / sintoma do cabelo / couro cabeludo"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-10','other',85,'years',
  585096436,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"cardio","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["X87 - Prolapso útero-vaginal"],"diagnosis":["N08 - Movimentos involuntários anormais"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-11','other',57,'years',
  956664021,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["P02 - Reacção aguda ao stress"],"diagnosis":["Y78 - Neoplasia maligna genital maculino, outra"],"new_diagnosis":["S08 - Alteração da cor da pele"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-12','other',43,'years',
  176525348,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["S78 - Lipoma"],"diagnosis":["D78 - Neoplasia do aparelho digestivo benigna / incerta"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-15','f',57,'years',
  157506520,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"DA","presential":false,"internship":null,"family_type":null,"school_level":"superior","professional_area":null,"profession":"pharmacy","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["K06 - Veias proeminentes"],"diagnosis":["Y78 - Neoplasia maligna genital maculino, outra"],"new_diagnosis":null,"referrence":"gastro","referrence_motive":["T81 - Bócio"],"contraceptive":"cop","new_contraceptive":"laqueacao","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-16','m',65,'years',
  663693110,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"PF","presential":true,"internship":null,"family_type":null,"school_level":"secundario","professional_area":null,"profession":"medicine","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["H15 - Preocupação com a aparência das orelhas"],"diagnosis":["W05 - Vómitos / náuseas durante a gravidez"],"new_diagnosis":null,"referrence":"psiquiatria","referrence_motive":["P99 - Perturbação psicológica, outra"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-17','f',33,'years',
  715513532,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["R78 - Bronquite / bronquiolite aguda"],"diagnosis":["T03 - Perda de apetite"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-18','f',60,'years',
  743019229,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"dermato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["A25 - Medo de morrer / da morte"],"diagnosis":["P27 - Medo de perturbação mental"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-19','f',44,'years',
  639612165,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["D97 - Doença de fígado, outra"],"diagnosis":["W13 - Esterilização"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-22','other',64,'years',
  483600828,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":false,"internship":"orto","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["R25 - Expectoração / mucosidade anormal"],"diagnosis":["S71 - Herpes simples"],"new_diagnosis":["Y77 - Neoplasia maligna da próstata"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-23','f',42,'years',
  378528602,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["B71 - Linfadenite crónica / não específica"],"diagnosis":["D98 - Colecistite, colelitíase"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-24','m',81,'years',
  414709957,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["A82 - Efeito secundário de uma lesão traumática"],"diagnosis":["F02 - Olho vermelho"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-25','other',22,'years',
  145164878,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"orto","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["W83 - Aborto provocado"],"diagnosis":["Y27 - Medo de outra doença genital masculina"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-26','m',60,'years',
  396363252,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"DA","presential":true,"internship":null,"family_type":"tipo1","school_level":"9ano","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["L13 - Sinal / sintoma da anca"],"diagnosis":["L79 - Entorse / distensão de articulação ne"],"new_diagnosis":null,"referrence":"orto","referrence_motive":["H73 - Infecção da trompa de eustáquio"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-29','f',72,'years',
  366412801,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":false,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["X16 - Sinal / sintoma da vulva"],"diagnosis":["U80 - Lesão traumática do aparelho urinário"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-30','m',82,'years',
  374230936,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SIJ","presential":true,"internship":null,"family_type":null,"school_level":"primario","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["D18 - Alteração nas fezes / movimentos intestinais"],"diagnosis":["R08 - Sinal / sintoma nasal, outro"],"new_diagnosis":null,"referrence":"endocrino","referrence_motive":["A91 - Investigação com resultados anormais NE"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-01-31','m',80,'years',
  729890916,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["D82 - Doença dos dentes / gengivas"],"diagnosis":["R26 - Medo de cancro do aparelho respiratório"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-01','m',41,'years',
  728574879,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["K96 - Hemorróidas"],"diagnosis":["L90 - Osteoartrose do joelho"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-02','other',29,'years',
  371146663,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SA","presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":"health","profession":"medicine","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["F72 - Blefarite / hordeólo / calázio"],"diagnosis":["X85 - Doença do colo ne"],"new_diagnosis":null,"referrence":"gineco","referrence_motive":["B25 - Medo de SIDA/VIH"],"contraceptive":"natural","new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-05','m',78,'years',
  331822020,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["L73 - Fractura: tíbia / peróneo"],"diagnosis":["H78 - Traumatismo superficial do ouvido"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-06','m',74,'years',
  777504731,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"Domicílio","presential":false,"internship":null,"family_type":null,"school_level":"mestrado","professional_area":null,"profession":"pharmacy","smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["P71 - Psicose orgânica, outra / ne"],"diagnosis":["R87 - Corpo estranho no nariz / laringe / brônquios"],"new_diagnosis":["U13 - Sinal / sintoma da bexiga, outro"],"referrence":"gastro","referrence_motive":["T72 - Neoplasia benigna da tiróide"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-07','other',80,'years',
  345226604,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["U29 - Sinal / sintoma do aparelho urinário, outro"],"diagnosis":["X73 - Tricomoníase genital na mulher"],"new_diagnosis":["X91 - Condiloma acuminado feminino"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-08','other',59,'years',
  559249790,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cardio","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["Z07 - Problema relacionado com a educação"],"diagnosis":["Z18 - Problema com uma criança doente"],"new_diagnosis":["X80 - Neoplasia benigna genital feminina"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-09','m',28,'years',
  883863834,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["Y07 - Impotência ne"],"diagnosis":["P15 - Abuso crónico do álcool"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-12','other',19,'years',
  780838447,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"SA","presential":true,"internship":null,"family_type":"tipo1","school_level":null,"professional_area":null,"profession":"medicine","smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["H73 - Infecção da trompa de eustáquio"],"diagnosis":["Z05 - Problema com as condições de trabalho"],"new_diagnosis":null,"referrence":"form_curta","referrence_motive":["K81 - Sopro cardíaco / arterial ne"],"contraceptive":null,"new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-13','m',76,'years',
  988335423,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"PF","presential":true,"internship":null,"family_type":"tipo1","school_level":"superior","professional_area":null,"profession":"pharmacy","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["H78 - Traumatismo superficial do ouvido"],"diagnosis":["X03 - Dor intermenstrual"],"new_diagnosis":["L12 - Sinal / sintoma da mão / dedo"],"referrence":"hemato","referrence_motive":["X79 - Neoplasia benigna da mama feminina"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-14','m',60,'years',
  101478379,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"cardio","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["S90 - Pitiríase rosada"],"diagnosis":["A79 - Carcinomatose (localização primária desconhecida) NE"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-15','other',62,'years',
  960403903,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":false,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["Y24 - Medo de disfunção sexual no homem"],"diagnosis":["Y04 - Sinal / sintoma do pénis, outro"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-16','m',73,'years',
  290510171,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":null,"presential":false,"internship":null,"family_type":"tipo1","school_level":"mestrado","professional_area":null,"profession":"pharmacy","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["X90 - Herpes genital feminino"],"diagnosis":["W83 - Aborto provocado"],"new_diagnosis":null,"referrence":"onco","referrence_motive":["T04 - Problema alimentar do lactente / criança"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-19','m',67,'years',
  860903593,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"SIJ","presential":true,"internship":null,"family_type":null,"school_level":"secundario","professional_area":"health","profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["W92 - Parto com complicações de nado vivo"],"diagnosis":["U77 - Neoplasia maligna do aparelho urinário, outra"],"new_diagnosis":null,"referrence":"pedopsiquiatria","referrence_motive":["A21 - Factor de risco de malignidade"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-20','m',68,'years',
  259716889,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"neuro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["F85 - Úlcera da córnea"],"diagnosis":["S89 - Eritema das fraldas"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-21','other',64,'years',
  515404719,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["W17 - Hemorragia pós-parto"],"diagnosis":["S04 - Tumor / massa localizada da pele"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-22','other',61,'years',
  333544129,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["P73 - Psicose afectiva"],"diagnosis":["T87 - Hipoglicémia"],"new_diagnosis":["L81 - Traumatismo do aparelho músculo-esquelético ne"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-23','f',40,'years',
  189162713,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["S83 - Lesão congénita da pele"],"diagnosis":["S71 - Herpes simples"],"new_diagnosis":["X89 - Síndrome de tensão pré-menstrual"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-26','other',65,'years',
  752947151,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":false,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["U02 - Micção frequente / urgente"],"diagnosis":["Z10 - Problema relacionado com o sistema de saúde"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-27','other',87,'years',
  488602043,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["B83 - Púrpura/defeitos de coagulação"],"diagnosis":["L28 - Limitação funcional / incapacidade (l)"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-28','f',66,'years',
  403029986,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["L14 - Sinal / sintoma da perna / coxa"],"diagnosis":["S16 - Traumatismo / contusão"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-02-29','m',48,'years',
  563708332,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["U95 - Cálculo urinário"],"diagnosis":["D09 - Náusea"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-01','m',79,'years',
  523990247,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"PF","presential":true,"internship":null,"family_type":"tipo1","school_level":"sem","professional_area":"health","profession":"other","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["W78 - Gravidez"],"diagnosis":["F28 - Limitação funcional / incapacidade (f)"],"new_diagnosis":null,"referrence":"pediatria","referrence_motive":["S96 - Acne"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-04','f',28,'years',
  735283918,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["N05 - Formigueiro nos dedos / mãos / pés"],"diagnosis":["N74 - Neoplasia maligna do sistema neurológico"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-05','f',59,'years',
  610975159,'urgência','ombro-a-ombro',
  '{"location":"urgência","autonomy":"ombro-a-ombro","type":null,"presential":false,"internship":"psiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["X20 - Sinal / sintoma do mamilo na mulher"],"diagnosis":["Z23 - Perda / falecimento de familiar"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-06','m',19,'years',
  940695850,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"PF","presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":"pharmacy","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["L86 - Síndrome da coluna com irradiação de dores"],"diagnosis":["Y86 - Hidrocelo"],"new_diagnosis":null,"referrence":"pneumo","referrence_motive":["A20 - Pedido / discussão da eutanásia"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-07','m',46,'years',
  548740937,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["U28 - Limitação funcional / incapacidade (u)"],"diagnosis":["B74 - Outra neoplasia maligna do sangue"],"new_diagnosis":["S05 - Tumores / inchaços generalizados"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-08','m',72,'years',
  835391292,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["S87 - Dermatite / eczema atópico"],"diagnosis":["T86 - Hipotiroidismo / mixedema"],"new_diagnosis":["K93 - Embolia pulmonar"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-11','other',23,'years',
  850101317,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"cardio","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["R05 - Tosse"],"diagnosis":["P70 - Demência"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-12','m',69,'years',
  435097783,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["D14 - Hematemese / vómito de sangue"],"diagnosis":["F29 - Sinal / sintoma ocular, outro"],"new_diagnosis":["X06 - Menstruação excessiva"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-13','m',37,'years',
  403960120,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":false,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["R89 - Malformação congénita do aparelho respiratório"],"diagnosis":["R78 - Bronquite / bronquiolite aguda"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-14','m',80,'years',
  637668357,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["W80 - Gravidez ectópica"],"diagnosis":["L92 - Síndrome do ombro doloroso"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-15','m',73,'years',
  780070027,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"DM","presential":true,"internship":null,"family_type":"tipo1","school_level":"secundario","professional_area":null,"profession":"other","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["Y84 - Malformação congénita genital no homem, outra"],"diagnosis":["U07 - Sinal / sintoma da urina, outro"],"new_diagnosis":null,"referrence":"neuro","referrence_motive":["K89 - Isquémia cerebral transitória"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-18','m',76,'years',
  241228338,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"urologia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["U06 - Hematúria"],"diagnosis":["A98 - Medicina preventiva / manutenção da saùde"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-19','m',47,'years',
  215272781,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["L83 - Síndrome da coluna cervical"],"diagnosis":["W14 - Contracepção, outros"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-20','m',37,'years',
  766832376,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":null,"presential":true,"internship":null,"family_type":"tipo1","school_level":"9ano","professional_area":null,"profession":"other","smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["H70 - Otite externa"],"diagnosis":["D20 - Sinal / sintoma da boca / língua / lábios"],"new_diagnosis":null,"referrence":"urologia","referrence_motive":["A89 - Efeitos de uma prótese"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-21','f',68,'years',
  262297629,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["R05 - Tosse"],"diagnosis":["B99 - Outra doença do sangue / linfáticos / baço"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-22','other',85,'years',
  227782992,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["X15 - Sinal / sintoma da vagina, outro"],"diagnosis":["D79 - Corpo estranho no aparelho digestivo"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-25','m',78,'years',
  807944891,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"HTA","presential":true,"internship":null,"family_type":"tipo1","school_level":"secundario","professional_area":null,"profession":"other","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["Y10 - Infertilidade / subfertilidade masculina"],"diagnosis":["X18 - Dor na mama feminina"],"new_diagnosis":null,"referrence":"urologia","referrence_motive":["W85 - Diabetes gestational"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-26','m',40,'years',
  181769732,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":false,"internship":"neuro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["S78 - Lipoma"],"diagnosis":["X83 - Malformação congénita genital"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-27','f',65,'years',
  950163652,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"paliativos","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["P07 - Diminuição do desejo sexual"],"diagnosis":["X29 - Sinal / sintoma do aparelho genital feminino, outro"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-28','f',77,'years',
  766099754,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["L03 - Sinal / sintoma da região lombar"],"diagnosis":["A85 - Efeitos secundários de um fármaco"],"new_diagnosis":["A02 - Arrepios"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-29','m',76,'years',
  784400183,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"obstetricia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["D74 - Neoplasia maligna do estômago"],"diagnosis":["A20 - Pedido / discussão da eutanásia"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-03-31','other',23,'years',
  691091010,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["S02 - Prurido"],"diagnosis":["P07 - Diminuição do desejo sexual"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-01','other',80,'years',
  233444659,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":false,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["H79 - Traumatismo do ouvido, outro"],"diagnosis":["D06 - Dor abdominal localizada, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-02','f',44,'years',
  184696535,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["D81 - Malformação congénita do aparelho digestivo"],"diagnosis":["S10 - Furúnculo / antraz"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-03','m',77,'years',
  142625500,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["W17 - Hemorragia pós-parto"],"diagnosis":["S98 - Urticária"],"new_diagnosis":["P74 - Distúrbio ansioso / estado de ansiedade"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-04','f',76,'years',
  225395792,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"neurocir","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["X25 - Medo de cancro genital na mulher"],"diagnosis":["U76 - Neoplasia maligna da bexiga"],"new_diagnosis":["S80 - Queratose solar / queimadura solar"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-07','m',42,'years',
  585359578,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":false,"internship":"obstetricia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["R28 - Limitação funcional / incapacidade (r)"],"diagnosis":["X90 - Herpes genital feminino"],"new_diagnosis":["P28 - Limitação funcional / incapacidade (p)"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-08','m',84,'years',
  287313702,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["X81 - Neoplasia genital feminina de natureza incerta / outra"],"diagnosis":["N99 - Doença do sistema neurológico, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-09','other',44,'years',
  171942187,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":null,"presential":false,"internship":null,"family_type":"tipo1","school_level":"sem","professional_area":"health","profession":"other","smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["X77 - Neoplasia maligna genital feminina, outra"],"diagnosis":["Y24 - Medo de disfunção sexual no homem"],"new_diagnosis":["F93 - Glaucoma"],"referrence":"orto","referrence_motive":["X89 - Síndrome de tensão pré-menstrual"],"contraceptive":"laqueacao","new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-10','m',78,'years',
  626335752,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SIJ","presential":true,"internship":null,"family_type":null,"school_level":"9ano","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["P07 - Diminuição do desejo sexual"],"diagnosis":["N70 - Poliomielite"],"new_diagnosis":["Y16 - Sinal / sintoma da mama masculina"],"referrence":"cir vascular","referrence_motive":["T03 - Perda de apetite"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-11','other',47,'years',
  208773373,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"otorrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["K94 - Flebite e tromboflebite"],"diagnosis":["Y27 - Medo de outra doença genital masculina"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-14','m',21,'years',
  416015359,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":false,"internship":"paliativos","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["K86 - Hipertensão sem complicações"],"diagnosis":["D89 - Hérnia inguinal"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-15','other',84,'years',
  229454951,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"AM","presential":false,"internship":null,"family_type":null,"school_level":"sem","professional_area":"health","profession":"nursing","smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["X87 - Prolapso útero-vaginal"],"diagnosis":["N81 - Lesão do sistema neurológico, outra"],"new_diagnosis":null,"referrence":"cir geral","referrence_motive":["B78 - Anemias hemolíticas hereditárias"],"contraceptive":null,"new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-16','other',26,'years',
  427361976,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"dermato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["D88 - Apendicite"],"diagnosis":["B72 - Doença de Hodgkin/linfomas"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-17','other',67,'years',
  850330122,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"urologia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["D08 - Flatulência / meteorismo / eructação"],"diagnosis":["D95 - Fissura anal / abcesso perianal"],"new_diagnosis":["L76 - Fractura, outras"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-18','other',66,'years',
  676203418,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"psiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["D80 - Lesão traumática, outra"],"diagnosis":["N74 - Neoplasia maligna do sistema neurológico"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-21','other',35,'years',
  430644571,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["P18 - Abuso de medicação"],"diagnosis":["P04 - Sentir-se / comportar-se de forma irritável / zangada"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-22','other',76,'years',
  537841963,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"HTA","presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":"nursing","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["X86 - Esfregaço de papanicolau anormal"],"diagnosis":["R01 - Dor atribuída ao aparelho respiratório"],"new_diagnosis":["D94 - Enterite crónica / colite ulcerosa"],"referrence":"paliativos","referrence_motive":["P81 - Perturbação hipercinética"],"contraceptive":"menopausa","new_contraceptive":"laqueacao","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-23','f',27,'years',
  257398245,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["A80 - Lesão traumática / acidente NE"],"diagnosis":["T01 - Sede excessiva"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-24','other',87,'years',
  692010343,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"nefro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["Y03 - Secreção uretral"],"diagnosis":["N94 - Nevrite / neuropatia periférica"],"new_diagnosis":["X16 - Sinal / sintoma da vulva"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-25','m',68,'years',
  433991666,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SM","presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":"health","profession":"nursing","smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["W18 - Sinal / sintoma do pós-parto, outro"],"diagnosis":["K95 - Veias varicosas da perna"],"new_diagnosis":["D08 - Flatulência / meteorismo / eructação"],"referrence":"orto","referrence_motive":["T78 - Quisto do canal tireoglosso"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-28','m',31,'years',
  649649248,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"DM","presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["W84 - Gravidez de alto risco"],"diagnosis":["N05 - Formigueiro nos dedos / mãos / pés"],"new_diagnosis":null,"referrence":"onco","referrence_motive":["B70 - Linfadenite aguda"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-29','f',84,'years',
  803300125,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["N26 - Medo de cancro do sistema neurológico"],"diagnosis":["X14 - Secreção vaginal"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-04-30','other',56,'years',
  707021858,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"paliativos","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["W15 - Infertilidade / subfertilidade"],"diagnosis":["T10 - Atraso de crescimento"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-01','m',85,'years',
  104981245,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"HTA","presential":true,"internship":null,"family_type":"tipo1","school_level":"sem","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["D81 - Malformação congénita do aparelho digestivo"],"diagnosis":["B87 - Esplenomegália"],"new_diagnosis":null,"referrence":"neurocir","referrence_motive":["L80 - Luxação / subluxação"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-02','other',64,'years',
  526228205,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"geriatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["U76 - Neoplasia maligna da bexiga"],"diagnosis":["U70 - Pielonefrite / pielite"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-05','other',19,'years',
  913434871,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":false,"internship":"cardio","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["P85 - Atraso mental"],"diagnosis":["L05 - Sinal / sintoma do flanco / axila"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-06','f',25,'years',
  610856631,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"urologia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["R77 - Laringite / traqueíte aguda"],"diagnosis":["U95 - Cálculo urinário"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-07','m',68,'years',
  785584194,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"neuro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["D84 - Doença do esófago"],"diagnosis":["P07 - Diminuição do desejo sexual"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-08','f',42,'years',
  549537080,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["Y84 - Malformação congénita genital no homem, outra"],"diagnosis":["Z14 - Problema por doença do parceiro"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-09','f',48,'years',
  803387606,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"SM","presential":true,"internship":null,"family_type":"tipo1","school_level":"sem","professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["L14 - Sinal / sintoma da perna / coxa"],"diagnosis":["F72 - Blefarite / hordeólo / calázio"],"new_diagnosis":["T71 - Neoplasia maligna da tiróide"],"referrence":"cir geral","referrence_motive":["D04 - Dor anal / rectal"],"contraceptive":"siu","new_contraceptive":"cop","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-12','m',70,'years',
  551835694,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SA","presential":false,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":"other","smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["N03 - Dor da face"],"diagnosis":["L85 - Deformação adquirida da coluna"],"new_diagnosis":null,"referrence":"urologia","referrence_motive":["S77 - Neoplasia maligna da pele"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-13','other',52,'years',
  457927403,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SM","presential":true,"internship":null,"family_type":null,"school_level":"primario","professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["D86 - Úlcera péptica, outra"],"diagnosis":["B78 - Anemias hemolíticas hereditárias"],"new_diagnosis":["L83 - Síndrome da coluna cervical"],"referrence":"cir toracica","referrence_motive":["L83 - Síndrome da coluna cervical"],"contraceptive":"implante","new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-14','m',86,'years',
  632360407,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["X78 - Fibromioma do útero"],"diagnosis":["X81 - Neoplasia genital feminina de natureza incerta / outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-15','m',36,'years',
  469568624,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":false,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["N29 - Sinal / sintoma do sistema nervoso, outro"],"diagnosis":["X18 - Dor na mama feminina"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-16','other',20,'years',
  978720756,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SA","presential":true,"internship":null,"family_type":null,"school_level":"secundario","professional_area":"health","profession":"nursing","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["W76 - Malformação congénita que complica a gravidez"],"diagnosis":["H71 - Otite média aguda / miringite"],"new_diagnosis":["W80 - Gravidez ectópica"],"referrence":"otorrino","referrence_motive":["D98 - Colecistite, colelitíase"],"contraceptive":"implante","new_contraceptive":"anel","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-19','other',77,'years',
  687618687,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["S85 - Quisto pilonidal / fístula"],"diagnosis":["X08 - Hemorragia inter-menstrual"],"new_diagnosis":["R28 - Limitação funcional / incapacidade (r)"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-20','other',58,'years',
  397601448,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"DA","presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":"health","profession":"medicine","smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["K25 - Medo de hipertensão"],"diagnosis":["L18 - Dor muscular"],"new_diagnosis":["Z29 - Problema social ne"],"referrence":"neuro","referrence_motive":["R98 - Sindrome de hiperventilação"],"contraceptive":"menopausa","new_contraceptive":"cop","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-21','other',75,'years',
  925711531,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"AM","presential":true,"internship":null,"family_type":"tipo1","school_level":"secundario","professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["K96 - Hemorróidas"],"diagnosis":["U13 - Sinal / sintoma da bexiga, outro"],"new_diagnosis":null,"referrence":"form_curta","referrence_motive":["D77 - Neoplasia maligna do aparelho digestivo, outra / ne"],"contraceptive":"anel","new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-22','f',19,'years',
  870337400,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["X16 - Sinal / sintoma da vulva"],"diagnosis":["K99 - Doença do aparelho circulatório, outra"],"new_diagnosis":["D91 - Hérnia abdominal, outra"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-23','other',60,'years',
  740732851,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"DA","presential":true,"internship":null,"family_type":"tipo1","school_level":"doutoramento","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["F92 - Catarata"],"diagnosis":["W78 - Gravidez"],"new_diagnosis":null,"referrence":"gineco","referrence_motive":["P71 - Psicose orgânica, outra / ne"],"contraceptive":"preserv","new_contraceptive":"natural","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-26','f',76,'years',
  933158002,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SA","presential":true,"internship":null,"family_type":"tipo1","school_level":"sem","professional_area":"health","profession":"pharmacy","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["N79 - Concussão"],"diagnosis":["N16 - Alteração do olfacto / gosto"],"new_diagnosis":["U04 - Incontinência urinária"],"referrence":"reumato","referrence_motive":["T78 - Quisto do canal tireoglosso"],"contraceptive":"coc","new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-27','other',69,'years',
  911982374,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"nefro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["R25 - Expectoração / mucosidade anormal"],"diagnosis":["X21 - Sinal / sintoma da mama feminina, outro"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-28','m',64,'years',
  744969267,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["Y70 - Sífilis masculina"],"diagnosis":["B29 - Outros sinais/sintomas do sangue/linfático/baço NE"],"new_diagnosis":["U99 - Doença urinária, outra"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-29','f',68,'years',
  477285995,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":false,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["R96 - Asma"],"diagnosis":["Y76 - Condiloma acuminado"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-05-30','f',42,'years',
  856669283,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["Z15 - Perda ou falecimento do parceiro"],"diagnosis":["D83 - Doença da boca / lingua / lábios"],"new_diagnosis":["B29 - Outros sinais/sintomas do sangue/linfático/baço NE"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-02','other',24,'years',
  382555289,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["W70 - Sépsis / infecção puerperal"],"diagnosis":["W93 - Parto com complicações de nado morto"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-03','f',67,'years',
  126328816,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"pneumo","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["N26 - Medo de cancro do sistema neurológico"],"diagnosis":["R28 - Limitação funcional / incapacidade (r)"],"new_diagnosis":["L83 - Síndrome da coluna cervical"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-04','other',27,'years',
  918733113,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["T05 - Problema alimentar do adulto"],"diagnosis":["T99 - Doença endócrina / metabólica / nutricional, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-05','m',42,'years',
  453125194,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":null,"presential":true,"internship":null,"family_type":null,"school_level":"secundario","professional_area":"health","profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["H86 - Surdez"],"diagnosis":["U29 - Sinal / sintoma do aparelho urinário, outro"],"new_diagnosis":null,"referrence":"cir toracica","referrence_motive":["W91 - Parto sem complicações de nado morto"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-06','m',76,'years',
  297163997,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["S05 - Tumores / inchaços generalizados"],"diagnosis":["A75 - Mononucleose infecciosa"],"new_diagnosis":["X18 - Dor na mama feminina"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-09','other',67,'years',
  999254096,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"DA","presential":true,"internship":null,"family_type":null,"school_level":"primario","professional_area":"health","profession":"medicine","smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["Z14 - Problema por doença do parceiro"],"diagnosis":["N99 - Doença do sistema neurológico, outra"],"new_diagnosis":null,"referrence":"med interna","referrence_motive":["B82 - Outras anemias não especificadas"],"contraceptive":"anel","new_contraceptive":"laqueacao","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-10','m',77,'years',
  311543591,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":false,"internship":"psiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["H15 - Preocupação com a aparência das orelhas"],"diagnosis":["W29 - Sinal / sintoma da gravidez, outro"],"new_diagnosis":["D29 - Sinal / sintoma digestivo, outro"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-11','m',86,'years',
  310352406,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["L97 - Neoplasia benignas / incerta do aparelho músculo-esquelético"],"diagnosis":["B04 - Sinais/sintomas do sangue"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-12','other',70,'years',
  225532371,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":false,"internship":"dermato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["S04 - Tumor / massa localizada da pele"],"diagnosis":["Z09 - Problema legal"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-13','other',32,'years',
  222602901,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["N89 - Enxaqueca"],"diagnosis":["L84 - Síndrome da coluna sem irradiação de dor"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-16','f',39,'years',
  603491452,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["K27 - Medo de outra doença cardiovascular"],"diagnosis":["P02 - Reacção aguda ao stress"],"new_diagnosis":["X26 - Medo de cancro da mama na mulher"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-17','m',67,'years',
  268487694,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"SM","presential":false,"internship":null,"family_type":null,"school_level":"superior","professional_area":null,"profession":"other","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["N74 - Neoplasia maligna do sistema neurológico"],"diagnosis":["W12 - Contracepção intra-uterina"],"new_diagnosis":null,"referrence":"pneumo","referrence_motive":["S85 - Quisto pilonidal / fístula"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-18','f',79,'years',
  801354441,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":false,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["L70 - Infecção do aparelho músculo-esquelético"],"diagnosis":["P01 - Sensação de ansiedade / nervosismo / tensão"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-19','f',24,'years',
  287083580,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["D71 - Papeira / parotidite epidémica"],"diagnosis":["U26 - Medo de cancro do aparelho urinário"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-20','f',37,'years',
  391337575,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["H77 - Perfuraçâo do tímpano"],"diagnosis":["F27 - Medo de doença ocular"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-23','m',42,'years',
  373092452,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"SA","presential":false,"internship":null,"family_type":null,"school_level":"secundario","professional_area":"health","profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["A01 - Dor generalizada / múltipla"],"diagnosis":["S87 - Dermatite / eczema atópico"],"new_diagnosis":null,"referrence":"endocrino","referrence_motive":["P25 - Problema numa fase da vida de um adulto"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-24','f',37,'years',
  778345572,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["X99 - Doença genital feminino, outra"],"diagnosis":["N04 - Síndrome das pernas inquietas"],"new_diagnosis":["B78 - Anemias hemolíticas hereditárias"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-25','f',77,'years',
  657130900,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":false,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["W70 - Sépsis / infecção puerperal"],"diagnosis":["K77 - Insuficiência cardíaca"],"new_diagnosis":["Z03 - Problema de habitação / vizinhança"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-26','m',86,'years',
  638593730,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["B25 - Medo de SIDA/VIH"],"diagnosis":["U26 - Medo de cancro do aparelho urinário"],"new_diagnosis":["U85 - Malformação congénita do aparelho urinário"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-27','m',60,'years',
  240004135,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["L98 - Malformação adquirida de um membro"],"diagnosis":["S85 - Quisto pilonidal / fístula"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-06-30','other',54,'years',
  553260022,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":false,"internship":"dermato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["D05 - Irritação perianal"],"diagnosis":["X20 - Sinal / sintoma do mamilo na mulher"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-01','m',74,'years',
  290794996,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["Y02 - Dor no escroto / testículos"],"diagnosis":["Y78 - Neoplasia maligna genital maculino, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-02','m',63,'years',
  767862743,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":false,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["D25 - Distensão abdominal"],"diagnosis":["U29 - Sinal / sintoma do aparelho urinário, outro"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-03','m',41,'years',
  410357785,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["P18 - Abuso de medicação"],"diagnosis":["A06 - Desmaio / síncope"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-04','f',63,'years',
  342876191,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"HTA","presential":true,"internship":null,"family_type":null,"school_level":"primario","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["D70 - Infecção gastrointestinal"],"diagnosis":["K25 - Medo de hipertensão"],"new_diagnosis":["D86 - Úlcera péptica, outra"],"referrence":"neuro","referrence_motive":["X17 - Sinal / sintoma da pélvis feminina"],"contraceptive":null,"new_contraceptive":"preserv","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-07','other',56,'years',
  878104731,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"DA","presential":false,"internship":null,"family_type":null,"school_level":"superior","professional_area":"health","profession":"nursing","smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["N27 - Medo de outra doença neurológica"],"diagnosis":["L99 - Doença do aparelho músculo-esquelético, outra"],"new_diagnosis":["A29 - Outros sinais / sintomas gerais"],"referrence":"pedopsiquiatria","referrence_motive":["H27 - Medo de doença do ouvido"],"contraceptive":"cop","new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-08','m',48,'years',
  317304845,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"PF","presential":false,"internship":null,"family_type":null,"school_level":"superior","professional_area":"health","profession":"pharmacy","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["W29 - Sinal / sintoma da gravidez, outro"],"diagnosis":["L05 - Sinal / sintoma do flanco / axila"],"new_diagnosis":["Y85 - Hipertrofia prostática benigna"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-09','m',27,'years',
  939806737,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"endocrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["S88 - Dermatite de contacto / alérgica"],"diagnosis":["T91 - Deficiência vitamínica / nutricional"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-10','f',29,'years',
  599317370,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SIJ","presential":false,"internship":null,"family_type":"tipo1","school_level":"primario","professional_area":null,"profession":"other","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["K05 - Irregularidade do batimento cardíaco, outra"],"diagnosis":["Z21 - Problema comportamental de familiar"],"new_diagnosis":["S01 - Dor / sensibilidade dolorosa da pele"],"referrence":"onco","referrence_motive":["X14 - Secreção vaginal"],"contraceptive":"siu","new_contraceptive":"menopausa","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-11','m',62,'years',
  323178614,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["B87 - Esplenomegália"],"diagnosis":["N07 - Convulsões / ataques"],"new_diagnosis":["L11 - Sinal / sintoma do punho"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-14','other',18,'years',
  784301861,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["L98 - Malformação adquirida de um membro"],"diagnosis":["Z05 - Problema com as condições de trabalho"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-15','other',69,'years',
  981945490,'urgência','ombro-a-ombro',
  '{"location":"urgência","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["R05 - Tosse"],"diagnosis":["S74 - Dermatofitose"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-16','other',46,'years',
  763802198,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"PF","presential":false,"internship":null,"family_type":"tipo1","school_level":"doutoramento","professional_area":null,"profession":"pharmacy","smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["D03 - Azia"],"diagnosis":["X88 - Doença fibroquística da mama"],"new_diagnosis":null,"referrence":"pedopsiquiatria","referrence_motive":["F27 - Medo de doença ocular"],"contraceptive":"natural","new_contraceptive":"implante","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-17','other',63,'years',
  451543441,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["R95 - Doença pulmonar obstrutiva crónica"],"diagnosis":["K94 - Flebite e tromboflebite"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-18','f',28,'years',
  712542171,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"AM","presential":true,"internship":null,"family_type":"tipo1","school_level":"superior","professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["L76 - Fractura, outras"],"diagnosis":["L15 - Sinal / sintoma do joelho"],"new_diagnosis":["K90 - Trombose / acidente vascular cerebral"],"referrence":"neuro","referrence_motive":["S78 - Lipoma"],"contraceptive":"adesivo","new_contraceptive":"laqueacao","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-21','m',27,'years',
  914963426,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"nefro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["B79 - Outra malformação congénita do sangue/linfática"],"diagnosis":["X04 - Relação sexual dolorosa na mulher"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-22','other',71,'years',
  677851409,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["Y85 - Hipertrofia prostática benigna"],"diagnosis":["X73 - Tricomoníase genital na mulher"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-23','m',77,'years',
  373450499,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["H71 - Otite média aguda / miringite"],"diagnosis":["L10 - Sinal / sintoma do cotovelo"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-24','f',87,'years',
  305488117,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"pneumo","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["R72 - Infecção estreptocócica da orofaringe"],"diagnosis":["B80 - Anemia por deficiência de ferro"],"new_diagnosis":["L92 - Síndrome do ombro doloroso"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-25','other',66,'years',
  521954555,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":false,"internship":"neurocir","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["A89 - Efeitos de uma prótese"],"diagnosis":["K82 - Doença cardio-pulmonar"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-28','m',74,'years',
  104677485,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":false,"internship":"pneumo","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["W82 - Aborto espontâneo"],"diagnosis":["S95 - Molusco contagioso"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-29','f',74,'years',
  967554407,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":false,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["X17 - Sinal / sintoma da pélvis feminina"],"diagnosis":["T03 - Perda de apetite"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-30','other',49,'years',
  968614957,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"AM","presential":true,"internship":null,"family_type":"tipo1","school_level":"doutoramento","professional_area":null,"profession":"pharmacy","smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["T70 - Infecção endócrina"],"diagnosis":["Y77 - Neoplasia maligna da próstata"],"new_diagnosis":null,"referrence":"cir toracica","referrence_motive":["W19 - Sinal / sintoma da mama / lactação"],"contraceptive":"cop","new_contraceptive":"implante","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-07-31','m',53,'years',
  790102841,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"paliativos","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["F14 - Movimentos oculares anormais"],"diagnosis":["Y06 - Sinal / sintoma da próstata"],"new_diagnosis":["D85 - Úlcera do duodeno"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-01','other',22,'years',
  289121230,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":false,"internship":"geriatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["X08 - Hemorragia inter-menstrual"],"diagnosis":["L96 - Lesão interna aguda do joelho"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-04','f',35,'years',
  675621220,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["S99 - Doença da pele, outra"],"diagnosis":["S96 - Acne"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-05','m',36,'years',
  713258234,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"obstetricia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["P09 - Preocupação com a preferência sexual"],"diagnosis":["U95 - Cálculo urinário"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-06','other',45,'years',
  494843224,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"HTA","presential":true,"internship":null,"family_type":"tipo1","school_level":"doutoramento","professional_area":null,"profession":"pharmacy","smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["P74 - Distúrbio ansioso / estado de ansiedade"],"diagnosis":["Z25 - Acto / acontecimento violento"],"new_diagnosis":null,"referrence":"obstetricia","referrence_motive":["U02 - Micção frequente / urgente"],"contraceptive":"coc","new_contraceptive":"laqueacao","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-07','other',34,'years',
  100338574,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":false,"internship":"neurocir","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["A70 - Tuberculose"],"diagnosis":["H02 - Problema de audição"],"new_diagnosis":["P75 - Somatização"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-08','other',60,'years',
  799888539,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"nefro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["L05 - Sinal / sintoma do flanco / axila"],"diagnosis":["Y28 - Limitação funcional / incapacidade (y)"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-11','f',67,'years',
  209467619,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["T82 - Obesidade"],"diagnosis":["S15 - Corpo estranho na pele"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-12','other',67,'years',
  457831000,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"orto","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["K76 - Doença cardíaca isquémica sem angina"],"diagnosis":["B29 - Outros sinais/sintomas do sangue/linfático/baço NE"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-13','other',67,'years',
  903321394,'urgência','ombro-a-ombro',
  '{"location":"urgência","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"pneumo","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["Z03 - Problema de habitação / vizinhança"],"diagnosis":["N93 - Síndrome do canal cárpico"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-14','f',46,'years',
  167423300,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"neuro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["Y14 - Planeamento familiar no homem, outro"],"diagnosis":["X86 - Esfregaço de papanicolau anormal"],"new_diagnosis":["R79 - Bronquite crónica"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-15','f',21,'years',
  321535928,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"neurocir","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["N07 - Convulsões / ataques"],"diagnosis":["Y07 - Impotência ne"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-18','m',80,'years',
  540287219,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["A75 - Mononucleose infecciosa"],"diagnosis":["Z02 - Problema relacionado com a água / alimentação"],"new_diagnosis":["A04 - Debilidade / cansaço geral"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-19','f',42,'years',
  107847408,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["S77 - Neoplasia maligna da pele"],"diagnosis":["W21 - Preocupação com a imagem corporal durante a gravidez"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-20','f',60,'years',
  961342567,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SIJ","presential":false,"internship":null,"family_type":"tipo1","school_level":"mestrado","professional_area":null,"profession":"pharmacy","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["L70 - Infecção do aparelho músculo-esquelético"],"diagnosis":["T07 - Aumento de peso"],"new_diagnosis":null,"referrence":"hemato","referrence_motive":["U76 - Neoplasia maligna da bexiga"],"contraceptive":"natural","new_contraceptive":"implante","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-21','f',18,'years',
  483916091,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["R92 - Neoplasia respiratória de natureza incerta"],"diagnosis":["P70 - Demência"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-22','other',60,'years',
  760770056,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["R80 - Gripe"],"diagnosis":["K93 - Embolia pulmonar"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-25','m',55,'years',
  641191907,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["N01 - Cefaleia"],"diagnosis":["L15 - Sinal / sintoma do joelho"],"new_diagnosis":["Z01 - Pobreza / problema económico"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-26','f',25,'years',
  670669154,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"gineco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["A78 - Outras doenças infecciosas NE"],"diagnosis":["N85 - Malformação congénita neurológica"],"new_diagnosis":["X86 - Esfregaço de papanicolau anormal"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-27','other',65,'years',
  369359260,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":false,"internship":"geriatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["D93 - Síndrome do cólon irritável"],"diagnosis":["L11 - Sinal / sintoma do punho"],"new_diagnosis":["B27 - Medo de outras doenças do sangue/linfáticos"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-28','other',54,'years',
  852150181,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["K85 - Tensão arterial elevada"],"diagnosis":["K70 - Doença infecciosa do aparelho circulatório"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-08-29','m',49,'years',
  681536980,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["H85 - Lesão acústica"],"diagnosis":["U26 - Medo de cancro do aparelho urinário"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-01','f',46,'years',
  761533943,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["K25 - Medo de hipertensão"],"diagnosis":["R71 - Tosse convulsa"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-02','f',40,'years',
  424592187,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"geriatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["W15 - Infertilidade / subfertilidade"],"diagnosis":["T05 - Problema alimentar do adulto"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-03','other',47,'years',
  748807664,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"cardio","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["P98 - Psicose, outra / ne"],"diagnosis":["P86 - Anorexia nervosa / bulimia"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-04','other',42,'years',
  631703865,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["A18 - Preocupação com a aparência"],"diagnosis":["P04 - Sentir-se / comportar-se de forma irritável / zangada"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-05','f',25,'years',
  181103071,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["R08 - Sinal / sintoma nasal, outro"],"diagnosis":["S91 - Psoríase"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-08','f',72,'years',
  175102487,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["L03 - Sinal / sintoma da região lombar"],"diagnosis":["L71 - Neoplasia maligna"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-09','m',85,'years',
  431043351,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["N07 - Convulsões / ataques"],"diagnosis":["X12 - Hemorragia pós-menopausa"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-10','other',32,'years',
  611172408,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["K78 - Fibrilhação / flutter auricular"],"diagnosis":["X80 - Neoplasia benigna genital feminina"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-11','other',78,'years',
  299507402,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"SM","presential":false,"internship":null,"family_type":null,"school_level":"mestrado","professional_area":null,"profession":"nursing","smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["L20 - Sinal / sintoma de articulação ne"],"diagnosis":["L87 - Bursite / tendinite / sinovite ne"],"new_diagnosis":null,"referrence":"pediatria","referrence_motive":["W78 - Gravidez"],"contraceptive":"implante","new_contraceptive":"implante","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-12','m',31,'years',
  758458640,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":false,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["D93 - Síndrome do cólon irritável"],"diagnosis":["K83 - Doença valvular cardíaca ne"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-15','other',18,'years',
  347929914,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":false,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["T03 - Perda de apetite"],"diagnosis":["K86 - Hipertensão sem complicações"],"new_diagnosis":["B02 - Gânglio(s) linfático(s) aumentado(s) de volume/doloroso(s)"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-16','f',83,'years',
  482108376,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"dermato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["W73 - Neoplasia benigna / incerta relacionada com a gravidez"],"diagnosis":["Y24 - Medo de disfunção sexual no homem"],"new_diagnosis":["L11 - Sinal / sintoma do punho"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-17','f',51,'years',
  157874348,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"DA","presential":true,"internship":null,"family_type":null,"school_level":"mestrado","professional_area":null,"profession":"pharmacy","smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["L73 - Fractura: tíbia / peróneo"],"diagnosis":["W19 - Sinal / sintoma da mama / lactação"],"new_diagnosis":null,"referrence":"pediatria","referrence_motive":["N71 - Meningite / encefalite"],"contraceptive":"cop","new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-18','m',38,'years',
  910890519,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir geral","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["S15 - Corpo estranho na pele"],"diagnosis":["W03 - Hemorragia antes do parto"],"new_diagnosis":["U04 - Incontinência urinária"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-19','f',75,'years',
  601136261,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["R99 - Doença respiratória, outra"],"diagnosis":["X12 - Hemorragia pós-menopausa"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-22','f',23,'years',
  141715299,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"psiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["W70 - Sépsis / infecção puerperal"],"diagnosis":["F18 - Sinal / sintoma relacionado com as lentes de contacto"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-23','m',82,'years',
  405157221,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SIJ","presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":"health","profession":"nursing","smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["S22 - Sinal / sintoma da unha"],"diagnosis":["Y78 - Neoplasia maligna genital maculino, outra"],"new_diagnosis":null,"referrence":"gastro","referrence_motive":["N80 - Lesão craniana, outra"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-24','other',18,'years',
  783055070,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"SIJ","presential":true,"internship":null,"family_type":"tipo1","school_level":"primario","professional_area":null,"profession":"pharmacy","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["A98 - Medicina preventiva / manutenção da saùde"],"diagnosis":["U80 - Lesão traumática do aparelho urinário"],"new_diagnosis":null,"referrence":"nefro","referrence_motive":["P78 - Neurastenia / surmenage"],"contraceptive":"laqueacao","new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-25','f',65,'years',
  296151388,'urgência','ombro-a-ombro',
  '{"location":"urgência","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"geriatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["S74 - Dermatofitose"],"diagnosis":["S75 - Monilíase / candidíase da pele"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-26','m',64,'years',
  610514477,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["D17 - Incontinência intestinal"],"diagnosis":["S93 - Quisto sebáceo"],"new_diagnosis":["H05 - Hemorragia do ouvido"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-29','other',32,'years',
  356878309,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"neurocir","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["T03 - Perda de apetite"],"diagnosis":["X77 - Neoplasia maligna genital feminina, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-09-30','f',32,'years',
  966142241,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"AM","presential":true,"internship":null,"family_type":"tipo1","school_level":null,"professional_area":null,"profession":"pharmacy","smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["Z28 - Limitação funcional / incapacidade (z)"],"diagnosis":["S82 - Nevo / sinal da pele"],"new_diagnosis":null,"referrence":"nefro","referrence_motive":["F70 - Conjuntivite infecciosa"],"contraceptive":"anel","new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-01','f',59,'years',
  325813179,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["N99 - Doença do sistema neurológico, outra"],"diagnosis":["T99 - Doença endócrina / metabólica / nutricional, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-02','other',25,'years',
  344526016,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"DM","presential":true,"internship":null,"family_type":"tipo1","school_level":"primario","professional_area":null,"profession":"other","smoker":"ex fumador","vaccination_plan":null,"chronic_diseases":[],"problems":["A75 - Mononucleose infecciosa"],"diagnosis":["U70 - Pielonefrite / pielite"],"new_diagnosis":null,"referrence":"pneumo","referrence_motive":["Y76 - Condiloma acuminado"],"contraceptive":"menopausa","new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-03','other',19,'years',
  625254597,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SIJ","presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":"other","smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["N87 - Parkinsonismo"],"diagnosis":["A74 - Rubéola"],"new_diagnosis":["P19 - Abuso de drogas"],"referrence":"pedopsiquiatria","referrence_motive":["D72 - Hepatite viral"],"contraceptive":null,"new_contraceptive":"coc","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-06','other',33,'years',
  473624339,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["P18 - Abuso de medicação"],"diagnosis":["Y25 - Medo de doença sexualmente transmissível no homem"],"new_diagnosis":["P01 - Sensação de ansiedade / nervosismo / tensão"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-07','m',75,'years',
  333936489,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"obstetricia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["X04 - Relação sexual dolorosa na mulher"],"diagnosis":["P13 - Encoprese / outro problema de incontinência fecal"],"new_diagnosis":["P05 - Sensação / comportamento senil"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-08','m',31,'years',
  264343731,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":false,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["X82 - Lesão traumática genital feminino"],"diagnosis":["D06 - Dor abdominal localizada, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-09','other',66,'years',
  352234347,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["P13 - Encoprese / outro problema de incontinência fecal"],"diagnosis":["R86 - Neoplasia benigna respiratória"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-10','m',31,'years',
  723187946,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"cir plastica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["P11 - Problema de alimentação da criança"],"diagnosis":["W73 - Neoplasia benigna / incerta relacionada com a gravidez"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-13','other',19,'years',
  556274652,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"SA","presential":true,"internship":null,"family_type":"tipo1","school_level":"9ano","professional_area":null,"profession":"other","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["N06 - Alteração da sensibilidade, outra"],"diagnosis":["D27 - Medo de outra doença do aparelho digestivo"],"new_diagnosis":["N86 - Esclerose múltipla"],"referrence":"cir plastica","referrence_motive":["W27 - Medo de complicação da gravidez"],"contraceptive":"laqueacao","new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-14','m',57,'years',
  668346797,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"DA","presential":true,"internship":null,"family_type":"tipo1","school_level":null,"professional_area":null,"profession":"pharmacy","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["L17 - Sinal / sintoma do pé / dedo do pé"],"diagnosis":["N04 - Síndrome das pernas inquietas"],"new_diagnosis":["Y71 - Gonorreia masculina"],"referrence":"cir vascular","referrence_motive":["K87 - Hipertensão com complicações"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-15','m',35,'years',
  562613322,'urgência','ombro-a-ombro',
  '{"location":"urgência","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"psiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["F95 - Estrabismo"],"diagnosis":["Z16 - Problema relacional com uma criança"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-16','other',56,'years',
  551408499,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":false,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["R27 - Medo de outra doença respiratória"],"diagnosis":["B81 - Anemia por deficiência de vitamina B12 / folatos"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-17','f',58,'years',
  461262315,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"DA","presential":true,"internship":null,"family_type":null,"school_level":"primario","professional_area":"health","profession":"pharmacy","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["S83 - Lesão congénita da pele"],"diagnosis":["W93 - Parto com complicações de nado morto"],"new_diagnosis":null,"referrence":"cir toracica","referrence_motive":["S75 - Monilíase / candidíase da pele"],"contraceptive":"laqueacao","new_contraceptive":"implante","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-20','f',69,'years',
  499573875,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"Domicílio","presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["N04 - Síndrome das pernas inquietas"],"diagnosis":["P10 - Gaguejar, balbuciar, tiques"],"new_diagnosis":null,"referrence":"obstetricia","referrence_motive":["L11 - Sinal / sintoma do punho"],"contraceptive":"cop","new_contraceptive":"cop","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-21','m',36,'years',
  211784658,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":"SM","presential":true,"internship":null,"family_type":"tipo1","school_level":null,"professional_area":"health","profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["S88 - Dermatite de contacto / alérgica"],"diagnosis":["T08 - Perda de peso"],"new_diagnosis":null,"referrence":"pediatria","referrence_motive":["D84 - Doença do esófago"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-22','other',27,'years',
  744302089,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"neuro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["W27 - Medo de complicação da gravidez"],"diagnosis":["F74 - Neoplasia do olho / anexos"],"new_diagnosis":["B99 - Outra doença do sangue / linfáticos / baço"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-23','f',32,'years',
  437855225,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"DA","presential":false,"internship":null,"family_type":"tipo1","school_level":"9ano","professional_area":null,"profession":"medicine","smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["D89 - Hérnia inguinal"],"diagnosis":["S20 - Calos / calosidades"],"new_diagnosis":["W17 - Hemorragia pós-parto"],"referrence":"endocrino","referrence_motive":["X01 - Dor genital"],"contraceptive":"laqueacao","new_contraceptive":"siu","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-24','other',58,'years',
  739469353,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"endocrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["B70 - Linfadenite aguda"],"diagnosis":["L83 - Síndrome da coluna cervical"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-28','f',59,'years',
  518802124,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SM","presential":true,"internship":null,"family_type":"tipo1","school_level":"primario","professional_area":"health","profession":"other","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["K92 - Aterosclerose / doença vascular periférica"],"diagnosis":["D87 - Alteração funcional do estômago"],"new_diagnosis":null,"referrence":"nefro","referrence_motive":["A98 - Medicina preventiva / manutenção da saùde"],"contraceptive":null,"new_contraceptive":"natural","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-29','other',30,'years',
  299559382,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":null,"presential":false,"internship":null,"family_type":"tipo1","school_level":"secundario","professional_area":"health","profession":"other","smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["X16 - Sinal / sintoma da vulva"],"diagnosis":["A92 - Alergia / reacção alérgica NE"],"new_diagnosis":null,"referrence":"neuro","referrence_motive":["D27 - Medo de outra doença do aparelho digestivo"],"contraceptive":"adesivo","new_contraceptive":"natural","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-30','m',48,'years',
  171380221,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"endocrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["T86 - Hipotiroidismo / mixedema"],"diagnosis":["R76 - Amigdalite aguda"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-10-31','f',62,'years',
  217836701,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"urologia","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["X89 - Síndrome de tensão pré-menstrual"],"diagnosis":["N92 - Nevralgia do trigémio"],"new_diagnosis":["R75 - Sinusite crónica / aguda"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-01','m',55,'years',
  945793469,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["N80 - Lesão craniana, outra"],"diagnosis":["Z15 - Perda ou falecimento do parceiro"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-04','m',81,'years',
  738272421,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["A26 - Medo de cancro NE"],"diagnosis":["A85 - Efeitos secundários de um fármaco"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-05','f',87,'years',
  834505787,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["B77 - Outras lesões traumáticas do sangue/linfa/baço"],"diagnosis":["K02 - Sensação de pressão / aperto atribuído ao coração"],"new_diagnosis":["W95 - Problema da mama durante a gravidez / puerpério, outro"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-06','other',29,'years',
  923744268,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":false,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["X06 - Menstruação excessiva"],"diagnosis":["H71 - Otite média aguda / miringite"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-07','other',33,'years',
  332332645,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":null,"presential":true,"internship":null,"family_type":null,"school_level":"sem","professional_area":null,"profession":"medicine","smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["T02 - Apetite excessivo"],"diagnosis":["N86 - Esclerose múltipla"],"new_diagnosis":["L16 - Sinal / sintoma do tornozelo"],"referrence":"geriatria","referrence_motive":["A29 - Outros sinais / sintomas gerais"],"contraceptive":"cop","new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-08','f',43,'years',
  497821246,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["W19 - Sinal / sintoma da mama / lactação"],"diagnosis":["X20 - Sinal / sintoma do mamilo na mulher"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-11','m',21,'years',
  937608433,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"otorrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["L09 - Sinal / sintoma do braço"],"diagnosis":["Y28 - Limitação funcional / incapacidade (y)"],"new_diagnosis":["R98 - Sindrome de hiperventilação"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-12','other',51,'years',
  563242464,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"endocrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["U08 - Retenção urinária"],"diagnosis":["U29 - Sinal / sintoma do aparelho urinário, outro"],"new_diagnosis":["D96 - Lombrigas / outros parasitas"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-13','f',19,'years',
  813184041,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"pneumo","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["X18 - Dor na mama feminina"],"diagnosis":["S23 - Queda de cabelo / calvície"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-14','f',67,'years',
  427928525,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["F79 - Lesão traumática ocular, outra"],"diagnosis":["X89 - Síndrome de tensão pré-menstrual"],"new_diagnosis":["F03 - Secreção ocular"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-15','m',70,'years',
  924311794,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["K92 - Aterosclerose / doença vascular periférica"],"diagnosis":["K78 - Fibrilhação / flutter auricular"],"new_diagnosis":["D20 - Sinal / sintoma da boca / língua / lábios"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-18','f',48,'years',
  996838929,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"DA","presential":true,"internship":null,"family_type":null,"school_level":"secundario","professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["R02 - Dificuldade respiratória / dispneia"],"diagnosis":["K03 - Dor atribuída ao aparelho circulatório, outra"],"new_diagnosis":null,"referrence":"cir toracica","referrence_motive":["P18 - Abuso de medicação"],"contraceptive":"implante","new_contraceptive":"natural","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-19','f',51,'years',
  507315386,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"orto","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":true,"chronic_diseases":[],"problems":["D23 - Hepatomegália"],"diagnosis":["Z12 - Problema relacional com o parceiro"],"new_diagnosis":["X05 - Menstruação escassa / ausente"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-20','other',60,'years',
  489232492,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["W29 - Sinal / sintoma da gravidez, outro"],"diagnosis":["L03 - Sinal / sintoma da região lombar"],"new_diagnosis":["S27 - Medo de outra doença da pele"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-21','f',84,'years',
  905097846,'form_curta','total',
  '{"location":"form_curta","autonomy":"total","type":null,"presential":true,"internship":"geriatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["D15 - Melena"],"diagnosis":["L87 - Bursite / tendinite / sinovite ne"],"new_diagnosis":["D76 - Neoplasia maligna do pâncreas"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-22','m',74,'years',
  286163809,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["S27 - Medo de outra doença da pele"],"diagnosis":["S26 - Medo de cancro da pele"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-25','m',41,'years',
  252486432,'unidade','parcial',
  '{"location":"unidade","autonomy":"parcial","type":"SIJ","presential":true,"internship":null,"family_type":null,"school_level":null,"professional_area":null,"profession":"other","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["K22 - Factor de risco de doença cardiovascular"],"diagnosis":["K07 - Tornozelos inchados / edema"],"new_diagnosis":["R85 - Neoplasia respiratória maligna, outra"],"referrence":"obstetricia","referrence_motive":["F02 - Olho vermelho"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-26','m',70,'years',
  341298362,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"pedopsiquiatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["Y02 - Dor no escroto / testículos"],"diagnosis":["S13 - Mordedura animal / humana"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-27','other',30,'years',
  112281204,'urgência','total',
  '{"location":"urgência","autonomy":"total","type":null,"presential":true,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["L91 - Osteoartrose, outra"],"diagnosis":["Z10 - Problema relacionado com o sistema de saúde"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-28','other',34,'years',
  317349546,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir toracica","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["L19 - Sinal / sintoma muscular ne"],"diagnosis":["D95 - Fissura anal / abcesso perianal"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-11-29','other',71,'years',
  234171787,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"hemato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["T03 - Perda de apetite"],"diagnosis":["Z24 - Problema relacional com amigos"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-02','f',75,'years',
  974498381,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"gastro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["K28 - Limitação funcional / incapacidade (k)"],"diagnosis":["X87 - Prolapso útero-vaginal"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-03','other',59,'years',
  534032945,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":true,"internship":"reumato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["U77 - Neoplasia maligna do aparelho urinário, outra"],"diagnosis":["S18 - Laceração / corte"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-04','other',79,'years',
  628207921,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["B83 - Púrpura/defeitos de coagulação"],"diagnosis":["Y06 - Sinal / sintoma da próstata"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-05','m',37,'years',
  704266032,'complementar','ombro-a-ombro',
  '{"location":"complementar","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["S14 - Queimadura / escaldão"],"diagnosis":["X86 - Esfregaço de papanicolau anormal"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-06','other',56,'years',
  388600938,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":false,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["K03 - Dor atribuída ao aparelho circulatório, outra"],"diagnosis":["Y78 - Neoplasia maligna genital maculino, outra"],"new_diagnosis":["W90 - Parto sem complicações de nado vivo"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-09','m',34,'years',
  830224769,'form_curta','parcial',
  '{"location":"form_curta","autonomy":"parcial","type":null,"presential":false,"internship":"endocrino","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["P70 - Demência"],"diagnosis":["D82 - Doença dos dentes / gengivas"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-10','other',87,'years',
  670339837,'complementar','observada',
  '{"location":"complementar","autonomy":"observada","type":null,"presential":true,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["K81 - Sopro cardíaco / arterial ne"],"diagnosis":["X89 - Síndrome de tensão pré-menstrual"],"new_diagnosis":["A82 - Efeito secundário de uma lesão traumática"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-11','other',29,'years',
  319983587,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"AM","presential":true,"internship":null,"family_type":null,"school_level":"superior","professional_area":null,"profession":"other","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["W75 - Lesão traumática que complica a gravidez"],"diagnosis":["L27 - Medo de doença do aparelho músculo-esquelético, outra"],"new_diagnosis":null,"referrence":"orto","referrence_motive":["D96 - Lombrigas / outros parasitas"],"contraceptive":"laqueacao","new_contraceptive":"natural","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-12','f',46,'years',
  824921555,'form_curta','ombro-a-ombro',
  '{"location":"form_curta","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"nefro","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["Y01 - Dor no pénis"],"diagnosis":["Z23 - Perda / falecimento de familiar"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-13','other',72,'years',
  724059442,'unidade','observada',
  '{"location":"unidade","autonomy":"observada","type":null,"presential":true,"internship":null,"family_type":"tipo1","school_level":"superior","professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["X71 - Gonorreia feminina"],"diagnosis":["T04 - Problema alimentar do lactente / criança"],"new_diagnosis":null,"referrence":"reumato","referrence_motive":["K01 - Dor atribuída ao coração"],"contraceptive":"natural","new_contraceptive":"menopausa","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-16','m',72,'years',
  438266320,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"SM","presential":true,"internship":null,"family_type":"tipo1","school_level":"mestrado","professional_area":null,"profession":"other","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["B77 - Outras lesões traumáticas do sangue/linfa/baço"],"diagnosis":["L72 - Fractura: rádio / cúbito"],"new_diagnosis":["R79 - Bronquite crónica"],"referrence":"nefro","referrence_motive":["L98 - Malformação adquirida de um membro"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-17','other',74,'years',
  230295197,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"Domicílio","presential":true,"internship":null,"family_type":"tipo1","school_level":"doutoramento","professional_area":"health","profession":"other","smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["X16 - Sinal / sintoma da vulva"],"diagnosis":["P98 - Psicose, outra / ne"],"new_diagnosis":["L89 - Osteoartrose da anca"],"referrence":"urologia","referrence_motive":["R71 - Tosse convulsa"],"contraceptive":"natural","new_contraceptive":"implante","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-18','f',39,'years',
  496576189,'urgência','ombro-a-ombro',
  '{"location":"urgência","autonomy":"ombro-a-ombro","type":null,"presential":true,"internship":"cir vascular","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":null,"chronic_diseases":[],"problems":["N70 - Poliomielite"],"diagnosis":["Y05 - Sinal / sintoma do escroto / testículos, outro"],"new_diagnosis":["S89 - Eritema das fraldas"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-19','other',40,'years',
  353122115,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"SM","presential":true,"internship":null,"family_type":null,"school_level":"superior","professional_area":"health","profession":"medicine","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["S89 - Eritema das fraldas"],"diagnosis":["S73 - Pediculose / outra infestação da pele"],"new_diagnosis":null,"referrence":"cir vascular","referrence_motive":["T29 - Sinal / sintoma endócrino, metabólico ou nutricional, outros"],"contraceptive":"menopausa","new_contraceptive":"adesivo","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-20','m',60,'years',
  742287568,'complementar','total',
  '{"location":"complementar","autonomy":"total","type":null,"presential":true,"internship":"onco","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":true,"chronic_diseases":[],"problems":["Y13 - Esterilização masculina"],"diagnosis":["T03 - Perda de apetite"],"new_diagnosis":["R92 - Neoplasia respiratória de natureza incerta"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-23','other',27,'years',
  234840554,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"pediatria","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":false,"chronic_diseases":[],"problems":["F95 - Estrabismo"],"diagnosis":["S76 - Infecção da pele, outra"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-24','f',39,'years',
  270985307,'urgência','observada',
  '{"location":"urgência","autonomy":"observada","type":null,"presential":true,"internship":"med interna","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":false,"chronic_diseases":[],"problems":["Y14 - Planeamento familiar no homem, outro"],"diagnosis":["R04 - Problema respiratório, outro"],"new_diagnosis":["S81 - Hemangioma / linfangioma"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-25','other',31,'years',
  905046916,'complementar','parcial',
  '{"location":"complementar","autonomy":"parcial","type":null,"presential":true,"internship":"paliativos","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["B79 - Outra malformação congénita do sangue/linfática"],"diagnosis":["Z13 - Problema comportamental do parceiro"],"new_diagnosis":["W94 - Mastite puerperal"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-26','other',80,'years',
  681782368,'form_curta','observada',
  '{"location":"form_curta","autonomy":"observada","type":null,"presential":true,"internship":"dermato","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"nao","vaccination_plan":null,"chronic_diseases":[],"problems":["F27 - Medo de doença ocular"],"diagnosis":["A98 - Medicina preventiva / manutenção da saùde"],"new_diagnosis":["K86 - Hipertensão sem complicações"],"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-27','other',25,'years',
  769328478,'unidade','total',
  '{"location":"unidade","autonomy":"total","type":"HTA","presential":true,"internship":null,"family_type":"tipo1","school_level":"9ano","professional_area":"health","profession":null,"smoker":"ex fumador","vaccination_plan":false,"chronic_diseases":[],"problems":["X70 - Sífilis feminina"],"diagnosis":["A77 - Outras doenças virais NE"],"new_diagnosis":null,"referrence":"onco","referrence_motive":["S06 - Erupção cutânea localizada"],"contraceptive":"anel","new_contraceptive":"laqueacao","procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-30','other',36,'years',
  681843701,'urgência','parcial',
  '{"location":"urgência","autonomy":"parcial","type":null,"presential":false,"internship":"form_curta","family_type":null,"school_level":null,"professional_area":null,"profession":null,"smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["S85 - Quisto pilonidal / fístula"],"diagnosis":["F95 - Estrabismo"],"new_diagnosis":null,"referrence":null,"referrence_motive":null,"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
),

(
  (SELECT user_id FROM users LIMIT 1),
  (SELECT id FROM specialties WHERE code = 'mgf' LIMIT 1),
  1,'2024-12-31','m',21,'years',
  336947956,'unidade','ombro-a-ombro',
  '{"location":"unidade","autonomy":"ombro-a-ombro","type":"PF","presential":true,"internship":null,"family_type":"tipo1","school_level":null,"professional_area":null,"profession":"medicine","smoker":"sim","vaccination_plan":true,"chronic_diseases":[],"problems":["L71 - Neoplasia maligna"],"diagnosis":["D81 - Malformação congénita do aparelho digestivo"],"new_diagnosis":null,"referrence":"cir toracica","referrence_motive":["R97 - Rinite alérgica"],"contraceptive":null,"new_contraceptive":null,"procedure":["Observação clínica"],"notes":["Gerado automaticamente"]}'::jsonb,
  false,NOW(),NOW()
);
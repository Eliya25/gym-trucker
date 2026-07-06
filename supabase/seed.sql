-- Global exercise starter list (user_id = null → visible to everyone).
-- Safe to run more than once: skips exercises that already exist.
insert into exercises (user_id, name, muscle_group)
select null, v.name, v.muscle_group
from (values
  -- חזה
  ('לחיצת חזה (Bench Press)', 'חזה'),
  ('לחיצת חזה בשיפוע (Incline Press)', 'חזה'),
  ('לחיצת חזה במכונה (Chest Press Machine)', 'חזה'),
  ('לחיצת חזה עם משקולות יד (Dumbbell Bench Press)', 'חזה'),
  ('לחיצת חזה בשיפוע עם משקולות יד (Incline Dumbbell Press)', 'חזה'),
  ('פרפר (Chest Fly)', 'חזה'),
  ('פרפר במכונה (Pec Deck)', 'חזה'),
  ('קרוסאובר בכבלים (Cable Crossover)', 'חזה'),
  ('שכיבות סמיכה (Push-up)', 'חזה'),
  -- רגליים
  ('סקוואט (Squat)', 'רגליים'),
  ('לחיצת רגליים (Leg Press)', 'רגליים'),
  ('פשיטת ברך (Leg Extension)', 'רגליים'),
  ('כפיפת ברך (Leg Curl)', 'רגליים'),
  ('מכרעים / לאנג''ים (Lunges)', 'רגליים'),
  ('סקוואט בולגרי (Bulgarian Split Squat)', 'רגליים'),
  ('האק סקוואט (Hack Squat)', 'רגליים'),
  ('דדליפט רומני (Romanian Deadlift)', 'רגליים'),
  ('היפ תראסט (Hip Thrust)', 'רגליים'),
  ('הרמות עקבים (Calf Raise)', 'תאומים'),
  ('קירוב ירכיים במכונה (Hip Adduction)', 'רגליים'),
  ('הרחקת ירכיים במכונה (Hip Abduction)', 'רגליים'),
  -- גב
  ('דדליפט (Deadlift)', 'גב'),
  ('חתירה במוט (Barbell Row)', 'גב'),
  ('חתירה במכונה (Machine Row)', 'גב'),
  ('חתירת פולי יושב (Seated Cable Row)', 'גב'),
  ('חתירת T (T-Bar Row)', 'גב'),
  ('חתירה עם משקולת יד (Dumbbell Row)', 'גב'),
  ('משיכת פולי עליון (Lat Pulldown)', 'גב'),
  ('מתח (Pull-up)', 'גב'),
  ('פול אובר בכבל (Cable Pullover)', 'גב'),
  ('היפר-אקסטנשן (Back Extension)', 'גב תחתון'),
  -- כתפיים
  ('לחיצת כתפיים (Overhead Press)', 'כתפיים'),
  ('לחיצת כתפיים עם משקולות יד (Dumbbell Shoulder Press)', 'כתפיים'),
  ('לחיצת כתפיים במכונה (Machine Shoulder Press)', 'כתפיים'),
  ('הרחקת כתפיים (Lateral Raise)', 'כתפיים'),
  ('הרמות קדמיות (Front Raise)', 'כתפיים'),
  ('פרפר הפוך (Reverse Fly)', 'כתפיים'),
  ('פייס פול (Face Pull)', 'כתפיים'),
  ('שראגס (Shrugs)', 'טרפזים'),
  -- יד קדמית
  ('כפיפת מרפק (Biceps Curl)', 'יד קדמית'),
  ('כפיפת פטיש (Hammer Curl)', 'יד קדמית'),
  ('כפיפת מרפק בכבל (Cable Curl)', 'יד קדמית'),
  ('כפיפת מרפק בספסל פריצ''ר (Preacher Curl)', 'יד קדמית'),
  -- יד אחורית
  ('פשיטת מרפק בפולי (Triceps Pushdown)', 'יד אחורית'),
  ('פשיטת מרפק בחבל (Rope Pushdown)', 'יד אחורית'),
  ('פשיטת מרפק מעל הראש (Overhead Triceps Extension)', 'יד אחורית'),
  ('לחיצה צרפתית (Skull Crusher)', 'יד אחורית'),
  ('מקבילים (Dips)', 'יד אחורית'),
  -- בטן
  ('כפיפות בטן (Crunches)', 'בטן'),
  ('כפיפות בטן במכונה (Crunch Machine)', 'בטן'),
  ('כפיפות בטן בכבל (Cable Crunch)', 'בטן'),
  ('כפיפות בטן אופניים (Bicycle Crunch)', 'בטן'),
  ('הרמות רגליים בתלייה (Hanging Leg Raise)', 'בטן'),
  ('הרמות רגליים בשכיבה (Lying Leg Raise)', 'בטן'),
  ('רוסיאן טוויסט (Russian Twist)', 'בטן'),
  ('גלגלת בטן (Ab Wheel Rollout)', 'בטן'),
  ('פלאנק (Plank)', 'בטן'),
  ('פלאנק צידי (Side Plank)', 'בטן')
) as v(name, muscle_group)
where not exists (
  select 1 from exercises e
  where e.name = v.name and e.user_id is null
);

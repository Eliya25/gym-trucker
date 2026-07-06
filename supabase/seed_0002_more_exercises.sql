-- More global exercises (run this in the Supabase SQL Editor).
-- Safe to run more than once: skips exercises that already exist.
insert into exercises (user_id, name, muscle_group)
select null, v.name, v.muscle_group
from (values
  -- גב
  ('חתירה במכונה (Machine Row)', 'גב'),
  ('חתירת פולי יושב (Seated Cable Row)', 'גב'),
  ('חתירת T (T-Bar Row)', 'גב'),
  ('חתירה עם משקולת יד (Dumbbell Row)', 'גב'),
  ('פול אובר בכבל (Cable Pullover)', 'גב'),
  ('היפר-אקסטנשן (Back Extension)', 'גב תחתון'),
  -- בטן
  ('כפיפות בטן במכונה (Crunch Machine)', 'בטן'),
  ('כפיפות בטן בכבל (Cable Crunch)', 'בטן'),
  ('הרמות רגליים בתלייה (Hanging Leg Raise)', 'בטן'),
  ('הרמות רגליים בשכיבה (Lying Leg Raise)', 'בטן'),
  ('כפיפות בטן אופניים (Bicycle Crunch)', 'בטן'),
  ('רוסיאן טוויסט (Russian Twist)', 'בטן'),
  ('גלגלת בטן (Ab Wheel Rollout)', 'בטן'),
  ('פלאנק צידי (Side Plank)', 'בטן'),
  -- חזה
  ('לחיצת חזה במכונה (Chest Press Machine)', 'חזה'),
  ('לחיצת חזה עם משקולות יד (Dumbbell Bench Press)', 'חזה'),
  ('לחיצת חזה בשיפוע עם משקולות יד (Incline Dumbbell Press)', 'חזה'),
  ('פרפר במכונה (Pec Deck)', 'חזה'),
  ('קרוסאובר בכבלים (Cable Crossover)', 'חזה'),
  ('שכיבות סמיכה (Push-up)', 'חזה'),
  -- רגליים
  ('מכרעים / לאנג''ים (Lunges)', 'רגליים'),
  ('סקוואט בולגרי (Bulgarian Split Squat)', 'רגליים'),
  ('האק סקוואט (Hack Squat)', 'רגליים'),
  ('דדליפט רומני (Romanian Deadlift)', 'רגליים'),
  ('היפ תראסט (Hip Thrust)', 'רגליים'),
  ('הרמות עקבים (Calf Raise)', 'תאומים'),
  ('קירוב ירכיים במכונה (Hip Adduction)', 'רגליים'),
  ('הרחקת ירכיים במכונה (Hip Abduction)', 'רגליים'),
  -- כתפיים
  ('לחיצת כתפיים עם משקולות יד (Dumbbell Shoulder Press)', 'כתפיים'),
  ('לחיצת כתפיים במכונה (Machine Shoulder Press)', 'כתפיים'),
  ('פרפר הפוך (Reverse Fly)', 'כתפיים'),
  ('הרמות קדמיות (Front Raise)', 'כתפיים'),
  ('פייס פול (Face Pull)', 'כתפיים'),
  ('שראגס (Shrugs)', 'טרפזים'),
  -- יד קדמית
  ('כפיפת פטיש (Hammer Curl)', 'יד קדמית'),
  ('כפיפת מרפק בכבל (Cable Curl)', 'יד קדמית'),
  ('כפיפת מרפק בספסל פריצ''ר (Preacher Curl)', 'יד קדמית'),
  -- יד אחורית
  ('לחיצה צרפתית (Skull Crusher)', 'יד אחורית'),
  ('פשיטת מרפק מעל הראש (Overhead Triceps Extension)', 'יד אחורית'),
  ('פשיטת מרפק בחבל (Rope Pushdown)', 'יד אחורית')
) as v(name, muscle_group)
where not exists (
  select 1 from exercises e
  where e.name = v.name and e.user_id is null
);

-- Superset support: exercises in the same session sharing a superset_group
-- (non-null) are performed together as a superset.
alter table session_exercises add column superset_group smallint;

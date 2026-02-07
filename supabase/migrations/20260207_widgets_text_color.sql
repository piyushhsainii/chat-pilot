-- Add configurable text/icon color for the widget launcher button.
-- This is used by the embeddable `public/widget.js`.

alter table if exists public.widgets
add column if not exists text_color text;

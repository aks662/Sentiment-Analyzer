CREATE TABLE IF NOT EXISTS calls (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transcript text NOT NULL,
  source text NOT NULL CHECK (source IN ('microphone', 'manual')),
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  score integer NOT NULL,
  matched_terms text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

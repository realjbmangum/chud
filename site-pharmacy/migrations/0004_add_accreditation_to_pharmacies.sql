-- Add accreditation column to pharmacies table
ALTER TABLE pharmacies ADD COLUMN accreditation TEXT;

-- Index for filtering by accreditation
CREATE INDEX idx_pharmacies_accreditation ON pharmacies(accreditation);

-- Independent Pharmacy Directory - D1 Schema
-- SQLite syntax (not PostgreSQL)

-- Main pharmacies table
CREATE TABLE pharmacies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Basic Info
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    npi TEXT,
    ncpdp_id TEXT,

    -- Location
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    county TEXT,
    latitude REAL,
    longitude REAL,

    -- Contact
    phone TEXT,
    website TEXT,
    email TEXT,

    -- Independence Verification
    ownership_type TEXT CHECK(ownership_type IN ('independent', 'small_chain', 'franchise', 'corporate')) DEFAULT 'independent',
    ownership_verified INTEGER DEFAULT 0, -- 0 = false, 1 = true (SQLite boolean)
    chain_affiliation TEXT,

    -- Services (stored as JSON string)
    services_offered TEXT, -- JSON array: ["compounding", "24-hour", "delivery"]
    specialties TEXT, -- JSON array: ["pediatric", "fertility"]
    accepts_goodrx INTEGER DEFAULT 0,

    -- Business Details (stored as JSON)
    hours TEXT, -- JSON object: {"Monday":"9AM-6PM", ...}
    parking_available INTEGER,
    wheelchair_accessible INTEGER,
    languages_spoken TEXT, -- JSON array: ["Spanish", "Mandarin"]

    -- Content
    description TEXT,
    ai_description TEXT,
    photo_url TEXT,

    -- Metadata
    source TEXT CHECK(source IN ('npi_registry', 'state_board', 'outscraper', 'manual', 'submission')) DEFAULT 'npi_registry',
    verified INTEGER DEFAULT 0,
    verified_at TEXT, -- ISO 8601 datetime string
    featured INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX idx_pharmacies_state_city ON pharmacies(state, city);
CREATE INDEX idx_pharmacies_ownership ON pharmacies(ownership_type);
CREATE INDEX idx_pharmacies_verified ON pharmacies(verified);
CREATE INDEX idx_pharmacies_featured ON pharmacies(featured);

-- Pharmacy submissions table
CREATE TABLE pharmacy_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Basic Info
    business_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT NOT NULL,
    phone TEXT,
    website TEXT,

    -- Location
    street_address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,

    -- Ownership Info
    ownership_type TEXT,
    chain_name TEXT,

    -- Services
    services_offered TEXT, -- JSON array
    description TEXT,

    -- Status
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_submissions_status ON pharmacy_submissions(status);

-- Contact messages table
CREATE TABLE contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- States reference table (for state pages)
CREATE TABLE states (
    code TEXT PRIMARY KEY, -- "CA", "TX", etc.
    name TEXT NOT NULL, -- "California", "Texas"
    pharmacy_count INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Seed states
INSERT INTO states (code, name) VALUES
('AL', 'Alabama'), ('AK', 'Alaska'), ('AZ', 'Arizona'), ('AR', 'Arkansas'),
('CA', 'California'), ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'),
('FL', 'Florida'), ('GA', 'Georgia'), ('HI', 'Hawaii'), ('ID', 'Idaho'),
('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'),
('KY', 'Kentucky'), ('LA', 'Louisiana'), ('ME', 'Maine'), ('MD', 'Maryland'),
('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'),
('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'),
('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'),
('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'),
('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'),
('SD', 'South Dakota'), ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'),
('VT', 'Vermont'), ('VA', 'Virginia'), ('WA', 'Washington'), ('WV', 'West Virginia'),
('WI', 'Wisconsin'), ('WY', 'Wyoming');

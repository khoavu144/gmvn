-- Log ingest Google Form → user profile. Khớp GoogleFormImportLog1742900000000.
CREATE TABLE IF NOT EXISTS google_form_import_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    response_id character varying(255) NOT NULL,
    schema_version character varying(32) NOT NULL,
    flow character varying(64) NOT NULL,
    email character varying(255) NOT NULL,
    user_id uuid,
    status character varying(32) NOT NULL,
    outcome_detail text,
    payload jsonb NOT NULL,
    payload_hash character varying(64) NOT NULL,
    error_message text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "PK_google_form_import_logs" PRIMARY KEY (id),
    CONSTRAINT "UQ_google_form_import_logs_response_id" UNIQUE (response_id),
    CONSTRAINT "FK_gfil_user" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IDX_gfil_email" ON google_form_import_logs (email);

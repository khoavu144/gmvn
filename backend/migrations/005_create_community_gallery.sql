CREATE TABLE "community_gallery" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "image_url" varchar(500) NOT NULL,
    "caption" varchar(300),
    "category" varchar(50) NOT NULL DEFAULT 'workout',
    "source" varchar(50) NOT NULL DEFAULT 'admin_upload',
    "linked_user_id" uuid,
    "source_image_id" uuid,
    "uploaded_by" uuid NOT NULL,
    "is_featured" boolean NOT NULL DEFAULT true,
    "order_number" integer NOT NULL DEFAULT 0,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_community_gallery" PRIMARY KEY ("id"),
    CONSTRAINT "FK_community_gallery_linked_user" FOREIGN KEY ("linked_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "FK_community_gallery_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION
);

CREATE INDEX "IDX_community_gallery_active_order" ON "community_gallery" ("is_active", "order_number", "created_at" DESC);
CREATE INDEX "IDX_community_gallery_category" ON "community_gallery" ("category");
CREATE INDEX "IDX_community_gallery_linked_user" ON "community_gallery" ("linked_user_id");

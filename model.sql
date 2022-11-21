DROP TABLE IF EXISTS "beep";
CREATE TABLE "beep" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "author_id" text NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "like_count" integer DEFAULT '0' NOT NULL,
    CONSTRAINT "beep_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE INDEX "beep_author_idx" ON "beep" ("author_id");


DROP TABLE IF EXISTS "follow";
CREATE TABLE "follow" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "follower" text NOT NULL,
    "followee" text NOT NULL,
    CONSTRAINT "follow_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_follow_followee" UNIQUE ("follower", "followee")
) WITH (oids = false);

CREATE INDEX "follow_followee" ON "follow" ("followee");

CREATE INDEX "follow_follower" ON "follow" ("follower");


DROP TABLE IF EXISTS "liked";
CREATE TABLE "liked" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "liker_id" text NOT NULL,
    "beep_id" uuid NOT NULL,
    CONSTRAINT "liked_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "liker_beep_unique" UNIQUE ("liker_id", "beep_id")
) WITH (oids = false);


ALTER TABLE "liked" ADD CONSTRAINT "liked_beep_id_fkey" FOREIGN KEY (beep_id) REFERENCES beep(id) ON DELETE CASCADE;

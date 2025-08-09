CREATE TABLE "matchmaking_queue" (
	"version" text NOT NULL,
	"address" text NOT NULL,
	"family" text NOT NULL,
	"port" integer NOT NULL,
	"region" text NOT NULL,
	"expires_in" timestamp DEFAULT now() + interval '15 seconds' NOT NULL,
	CONSTRAINT "matchmaking_queue_version_address_family_port_pk" PRIMARY KEY("version","address","family","port")
);

MIGRATION_NAME=init
GET_D1_LIST_JSON := wrangler d1 list --json
JQ_FILTER := jq -r '.[] | select(.name == "d1-example") | .uuid'
D1_UUID := $(shell $(GET_D1_LIST_JSON) | $(JQ_FILTER))
GOBIN ?= $(shell go env GOPATH)/bin

echo: 
	@echo ${D1_UUID}

.PHONY: compile
compile: $(GOBIN)/sqlc
	sqlc compile

.PHONY: generate
generate: $(GOBIN)/sqlc
	sqlc generate

$(GOBIN)/sqlc:
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

.PHONY: init
local-init:
	wrangler d1 migrations apply --local d1-example

.PHONY: local-migration-list
local-migration-list: 
	wrangler d1 migrations list --local d1-example

.PHONY: local-migration
local-migration: $(GOBIN)/sqlite3def
	sqlite3def --dry-run .wrangler/state/v3/d1/${D1_UUID}/db.sqlite < ./db/schema.sql > ./migrations/`date +%Y%m%d%H%M%S`.sql
	wrangler d1 migrations apply --local d1-example

.PHONY: migration
migration: $(GOBIN)/sqlite3def
	wrangler d1 migrations apply d1-example

$(GOBIN)/sqlite3def:
	go install github.com/k0kubun/sqldef/cmd/sqlite3def@latest
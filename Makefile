# Our Journey — developer entrypoints. Run `make help` for the list.
#
#   make setup   first run: deps
#   make dev     Vite dev server on :3000
#
# The site is entirely static: no API, no database, no environment variables.
# Targets are thin wrappers over package.json scripts; that file stays the
# source of truth.

SHELL := /bin/bash
.DEFAULT_GOAL := help

NPM          := npm
ENV_FILE     := .env
ENV_EXAMPLE  := .env.example
BUILD_CONFIG := docker/build.config

# Image-build settings (IMAGE, PLATFORMS, versions, …) live in $(BUILD_CONFIG)
# so they can be edited without touching this file. Soft `-include`: a missing
# file only breaks the docker-* targets (which guard for it), not `make dev` etc.
# `make docker-build` also writes the version you pick back into this file.
-include $(BUILD_CONFIG)

.PHONY: help setup install env dev build preview typecheck lint lint-fix \
        format format-check test test-watch test-cov i18n e2e e2e-install \
        check clean docker-build docker-builder docker-config

##@ Setup

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage: make \033[36m<target>\033[0m\n"} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-13s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo

setup: install env ## First-time setup: install deps and create .env
	@echo ""
	@echo "  Setup complete. Next: make dev  → http://localhost:3000"

install: ## Install npm dependencies
	$(NPM) install

# Every VITE_* var has a default in src/config/env.ts, so .env is a convenience,
# not a requirement. Note that MSW mocks default ON in dev: to talk to the real
# API on :8080, add VITE_ENABLE_MOCKS=false to .env (it is not in .env.example).
env: ## Create .env from .env.example (never clobbers)
	@if [ ! -f $(ENV_FILE) ]; then \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
		echo "  created $(ENV_FILE) from $(ENV_EXAMPLE)"; \
	else \
		echo "  $(ENV_FILE) exists — keeping your values"; \
	fi

##@ Develop

dev: ## Vite dev server on :3000 (MSW mocks on unless VITE_ENABLE_MOCKS=false)
	$(NPM) run dev

build: ## Type-check and build for production
	$(NPM) run build

preview: ## Serve the production build on :3000
	$(NPM) run preview

##@ Docker image

# Multi-arch build & push of the static runtime image. Settings come from
# $(BUILD_CONFIG); the version is asked for on each run (default DEFAULT_VERSION)
# unless you pass VERSION=, and the version you pick is written back to that
# file. The API base URL is baked into the bundle at build time from .env.prod.
#   make docker-build                 # prompts: Docker image version [0.0.2]:
#   make docker-build VERSION=0.0.3   # non-interactive
# Recipe lines are joined with `\` so they share one shell — the version read
# from the prompt has to survive into the buildx command.
docker-build: docker-builder ## Build & push the multi-arch image (asks a version, saves it to docker/build.config)
	@test -n "$(IMAGE)" || { echo "✗ IMAGE is empty — is $(BUILD_CONFIG) present?"; exit 1; }
	@v="$(VERSION)"; \
	if [ -z "$$v" ]; then \
		read -r -p "Docker image version [$(DEFAULT_VERSION)]: " v; \
		v="$${v:-$(DEFAULT_VERSION)}"; \
	fi; \
	if [ "$$v" != "$(DEFAULT_VERSION)" ]; then \
		tmp=$(BUILD_CONFIG).tmp; \
		sed 's|^DEFAULT_VERSION[[:space:]]*:=.*|DEFAULT_VERSION := '"$$v"'|' $(BUILD_CONFIG) > $$tmp && mv $$tmp $(BUILD_CONFIG); \
		echo "  DEFAULT_VERSION := $$v  (saved to $(BUILD_CONFIG), was $(DEFAULT_VERSION))"; \
	fi; \
	tag="$(IMAGE):$(TAG_PREFIX)$$v"; \
	echo "→ docker buildx build [$(PLATFORMS)] → $$tag  (API base baked from .env.prod)"; \
	docker buildx build \
		--builder $(BUILDER) \
		--network=$(NETWORK) --allow network.$(NETWORK) \
		--platform=$(PLATFORMS) \
		-t "$$tag" \
		-f $(DOCKERFILE) $(CONTEXT) \
		$(NO_CACHE) $(PUSH)

docker-builder: ## Create the dedicated buildx builder (docker-container) if it's missing
	@test -n "$(BUILDER)" || { echo "✗ BUILDER is empty — is $(BUILD_CONFIG) present?"; exit 1; }
	@docker buildx inspect $(BUILDER) >/dev/null 2>&1 || { \
		echo "→ creating buildx builder '$(BUILDER)' (docker-container driver)"; \
		docker buildx create --name $(BUILDER) --driver docker-container \
			--buildkitd-flags '--allow-insecure-entitlement network.$(NETWORK)' >/dev/null; \
	}

docker-config: ## Print the resolved image/build settings from docker/build.config
	@printf '  %-18s %s\n' \
		IMAGE             "$(IMAGE)" \
		TAG_PREFIX        "$(TAG_PREFIX)" \
		DEFAULT_VERSION   "$(DEFAULT_VERSION)" \
		PLATFORMS         "$(PLATFORMS)" \
		DOCKERFILE        "$(DOCKERFILE)" \
		CONTEXT           "$(CONTEXT)" \
		BUILDER           "$(BUILDER)" \
		NETWORK           "$(NETWORK)" \
		NO_CACHE          "$(NO_CACHE)" \
		PUSH              "$(PUSH)" \
		"example tag"     "$(IMAGE):$(TAG_PREFIX)$(DEFAULT_VERSION)"

##@ Verify

typecheck: ## tsc -b (includes tests)
	$(NPM) run typecheck

lint: ## ESLint
	$(NPM) run lint

lint-fix: ## ESLint --fix (also auto-sorts imports)
	$(NPM) run lint:fix

format: ## Prettier --write
	$(NPM) run format

format-check: ## Prettier --check
	$(NPM) run format:check

test: ## Vitest (MSW-backed; unhandled requests fail the test)
	$(NPM) test

test-watch: ## Vitest in watch mode
	$(NPM) run test:watch

test-cov: ## Vitest with coverage
	$(NPM) run test:coverage

i18n: ## Locale parity guard (en/lo key trees and placeholders must match)
	$(NPM) run check:i18n

e2e: ## Playwright e2e (auto-starts the dev server)
	$(NPM) run e2e

e2e-install: ## Download the Playwright browser binaries (once per machine)
	npx playwright install

check: lint typecheck test i18n ## lint + typecheck + test + i18n parity

##@ Housekeeping

clean: ## Remove build output, coverage and test reports
	rm -rf dist coverage playwright-report test-results blob-report *.tsbuildinfo

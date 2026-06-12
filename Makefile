COMPOSE := docker compose

.PHONY: help build up down restart ps logs test shell api-shell web-shell signaling-shell worker-shell clean

help:
	@printf "Signal Room Docker commands:\n"
	@printf "  make build            Build Docker images\n"
	@printf "  make up               Build and start the stack\n"
	@printf "  make down             Stop the stack\n"
	@printf "  make restart          Restart the stack\n"
	@printf "  make ps               Show container status\n"
	@printf "  make logs             Follow stack logs\n"
	@printf "  make test             Run tests in Docker\n"
	@printf "  make shell            Open a shell in a one-off app container\n"
	@printf "  make api-shell        Open a shell in the API container\n"
	@printf "  make web-shell        Open a shell in the web container\n"
	@printf "  make signaling-shell  Open a shell in the signaling container\n"
	@printf "  make worker-shell     Open a shell in the worker container\n"
	@printf "  make clean            Stop stack and remove Docker volumes\n"

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down --remove-orphans

restart: down up

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

test:
	$(COMPOSE) run --build --rm test

shell:
	$(COMPOSE) run --build --rm test sh

api-shell:
	$(COMPOSE) exec api sh

web-shell:
	$(COMPOSE) exec web sh

signaling-shell:
	$(COMPOSE) exec signaling sh

worker-shell:
	$(COMPOSE) exec worker sh

clean:
	$(COMPOSE) down --volumes --remove-orphans
	$(COMPOSE) rm --force --stop

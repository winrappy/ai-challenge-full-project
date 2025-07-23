
# Default target
.PHONY: help
help:
	@echo "ArisePreQ Loan Pre-Qualification System"
	@echo "Available commands:"
	@grep -E '^.PHONY:\s+[^#]*(##.*)?' $(MAKEFILE_LIST) | sort | cut -d ':' -f 2 | awk 'BEGIN {FS = "#"}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


# Start the complete system
.PHONY: start
start:
	@echo "Starting ArisePreQ system..."
	@./scripts/start-system.sh

# Start local development
.PHONY: start-local
start-local:
	@echo "Starting local development environment..."
	@docker-compose up -d
	@echo "Docker containers are up and running."

# Stop local development
.PHONY: stop-local
stop-local:
	@echo "Stopping and removing local development containers..."
	@docker-compose down
	@echo "Containers stopped and removed."

# Build all components
.PHONY: build
build:
	@echo "Building backend..."
	@cd backend && echo "TODO: fix me - build backend app"
	@echo "Building frontend..."
	@cd frontend && echo "TODO: fix me - build frontend app"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning Kubernetes resources..."
	@kubectl delete -k ./deploy --ignore-not-found
	@echo "Cleaning build artifacts..."
	@echo "- Removing Docker images..."
	@docker rmi -f team036-backend team036-frontend || true
	@echo "- Stopping docker containers and removing volumes..."
	@docker-compose down -v || true

# Build Docker images
.PHONY: docker-build
docker-build:
	@echo "Building Docker images..."
	@echo "Build backend image team036-backend"
	@cd backend && docker build -t team036-backend .
	@echo "Build backend image team036-frontend"
	@cd frontend && docker build -t team036-frontend .

# Deploy to Kubernetes
.PHONY: k8s-deploy
k8s-deploy:
	@$(MAKE) docker-build
	@echo "Deploying to Kubernetes..."
	@echo "Applying Kubernetes manifests..."
	kubectl apply -k deploy/
	@echo "Waiting for deployments..."
	kubectl wait --for=condition=available --timeout=60s deployment/backend -n team036
	kubectl wait --for=condition=available --timeout=60s deployment/frontend -n team036
	@$(MAKE) port-forward-start
	@echo "Backend is running on http://localhost:30090"
	@echo "Frontend is running on http://localhost:30080"

# Clean Kubernetes resources
.PHONY: k8s-clean
k8s-clean:
	@echo "Cleaning Kubernetes resources..."
	@kubectl delete -k deploy/ --ignore-not-found=true
	@$(MAKE) port-forward-stop
	@echo "Kubernetes resources cleaned successfully!"

# Run backend tests
.PHONY: bed-test
bed-test:
	@echo "Running backend tests..."
	@cd backend && echo "TODO: fix me"

# Frontend commands
.PHONY: fed-test-cov
fed-test-cov:
	@echo "Running frontend coverage tests..."
	cd frontend && npm install && npm run test -- --coverage

# Run frontend tests
.PHONY: fed-test
fed-test:
	@echo "Running frontend coverage tests..."
	cd frontend && npm install && npm run test

# Run all tests (k6 + e2e)
.PHONY: test-all
test-all:
	@echo "Running all tests..."
	@$(MAKE) smoke-test
	@$(MAKE) load-test
	@$(MAKE) validate-payload-test
	@$(MAKE) e2e
	@echo "All tests completed!"

# Run all k6 tests
.PHONY: k6-all
k6-all: port-forward-start
	@echo "Running all k6 tests..."
	@$(MAKE) smoke-test
	@$(MAKE) load-test
	@$(MAKE) stress-test
	@$(MAKE) spike-test
	@$(MAKE) load-web-test
	@$(MAKE) validate-payload-test
	@echo "All k6 tests completed!"
	@$(MAKE) port-forward-stop

.PHONY: port-forward-start 
port-forward-start:
	@echo "Starting port-forward..."
	@kubectl port-forward svc/backend-service 30090:30090 -n team036 > /dev/null 2>&1 & echo $$! > .pf_pid
	@sleep 3

.PHONY: port-forward-stop
port-forward-stop:
	@echo "Stopping port-forward..."
	-@kill `cat .pf_pid` 2>/dev/null || true
	-@rm -f .pf_pid

# Run e2e
.PHONY: e2e
e2e:
	@echo "Running e2e tests..."
	@echo "Start docker compose"
	@docker-compose up -d
	@$(MAKE) wait-for-backend
	@cd e2e && npm install && npm run test:e2e
	@echo "Stop docker compose"
	@docker-compose down

.PHONY: wait-for-backend
wait-for-backend:
	@echo "Waiting for backend..."
	@until curl -s http://localhost:30090 > /dev/null; do \
		echo "Still waiting..."; \
		sleep 2; \
	done
	@echo "Backend is ready."

# Run k6 load tests
.PHONY: smoke-test
smoke-test:
	@echo "Running smoke tests..."
	@k6 run k6/01-api-apply-loans.smoke.test.js --env BASE_URL=http://localhost:30090 --vus 1 --iterations 1

.PHONY: load-test
load-test:
	@echo "Running load average tests..."
	@k6 run k6/02-api-apply-loans.average.test.js --env BASE_URL=http://localhost:30090

.PHONY: stress-test
stress-test:
	@echo "Running stress tests..."
	@k6 run k6/03-api-apply-loans.stress.test.js --env BASE_URL=http://localhost:30090

.PHONY: spike-test
spike-test:
	@echo "Running spike tests..."
	@k6 run k6/04-api-apply-loans.spike.test.js --env BASE_URL=http://localhost:30090

.PHONY: load-web-test
load-web-test:
	@echo "Running load web tests..."
	@k6 run k6/06-frontend-web.average.test.js --env FRONTEND_URL=http://localhost:30080

.PHONY: validate-payload-test
validate-payload-test:
	@echo "Running test validate payload..."
	@k6 run k6/05-api-apply-loans.validation.test.js --env BASE_URL=http://localhost:30090  --vus 1 --iterations 1

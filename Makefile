# Makefile for phrase-driver project

.PHONY: backend frontend dev

backend:
	cd backend && node index.js

frontend:
	cd frontend && npm run dev -- --host 0.0.0.0

dev:
	# Run both backend and frontend in parallel
	$(MAKE) -j2 backend frontend

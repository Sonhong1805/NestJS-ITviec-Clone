migration-create:
	@read -p "Enter migration name: " name; npm run typeorm:create -- ./src/databases/migrations/$$name

migration-generate:
	@read -p "Enter migration name: " name; npm run typeorm:generate -- ./src/databases/migrations/$$name

migration-run:
	npm run typeorm:run





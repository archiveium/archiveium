.DEFAULT_GOAL := help

help:
	@echo "Choose a target action:"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | \
		awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | \
		sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\nMost used actions:"
	@echo " - schedule:work"
	@echo " - queue:work --queue=default"
	@echo " - queue:work --queue=listeners"

docker-artisan:
	docker exec -it archiveium php artisan $(CMD)

tail-app-logs:
	tail -f storage/logs/laravel.log

generate-ide-helper:
	docker exec -it archiveium php artisan ide-helper:eloquent
	docker exec -it archiveium php artisan ide-helper:generate
	docker exec -it archiveium php artisan ide-helper:meta
	docker exec -it archiveium php artisan ide-helper:models

test-coverage-report:
	docker exec -it archiveium XDEBUG_MODE=coverage php artisan test --coverage

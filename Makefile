help:
	@echo "The following make targets are available:"
	@echo "run-web	run a simple web server to serve the files"

run-web:
	python -m http.server 8000

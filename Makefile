WEBPACK := ./node_modules/.bin/webpack

build:
	$(WEBPACK)

start:
	heroku local

watch:
	$(WEBPACK) --progress --watch

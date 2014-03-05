BIN = node_modules/.bin
PATH := $(BIN):$(PATH)

build: index.js

test:
	@mocha --compilers coffee:coffee-script -R spec specs/*.coffee

link install:
	@npm $@

clean:
	rm -f *.js *.map

%.js: %.coffee
	coffee -c $<

example::
	./example/app.coffee

release-patch: build test
	@$(call release,patch)

release-minor: build test
	@$(call release,minor)

release-major: build test
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1)
endef

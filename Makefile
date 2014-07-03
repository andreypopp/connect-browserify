BIN = node_modules/.bin
PATH := $(BIN):$(PATH)

test:
	@mocha -R spec specs/*.js

link install:
	@npm $@

lint:
	@eslint index.js specs/*.js

clean:
	rm -f *.js *.map

%.js: %.coffee
	coffee -c $<

example::
	./example/app.coffee

release-patch: test
	@$(call release,patch)

release-minor: test
	@$(call release,minor)

release-major: test
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1)
endef

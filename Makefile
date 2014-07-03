BIN = node_modules/.bin
PATH := $(BIN):$(PATH)

test:
	@mocha -R spec specs/*.js

lint:
	@eslint index.js specs/*.js

link install:
	@npm $@

clean:
	rm -f *.js *.map

example::
	./example/app.js

release-patch: lint test
	@$(call release,patch)

release-minor: lint test
	@$(call release,minor)

release-major: lint test
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1)
endef

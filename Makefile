BIN = node_modules/.bin
PATH := $(BIN):$(PATH)

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

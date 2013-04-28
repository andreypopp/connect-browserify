build: index.js

publish:
	git push
	git push --tags
	npm publish

%.js: %.coffee
	coffee --map -c $<

example:
	./example/app.coffee

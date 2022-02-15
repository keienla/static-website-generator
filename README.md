# Static Website Generator

## TODO

### Website

- [ ] Create a folder "content" at "./" with inside
    - a folder "pages" with all pages by folder. The page will be a JSON file and for each entry the translation for the languages
    - a folder "articles", same than pages but for blog. Will have a structure != than page. Still header, translation... but the content will just be some paragraph
- [ ] Create a folder "assets" with all the images inside
- [ ] Create types for "Pages" and "Articles"
- [x] System for .pug generate with json file
- [ ] Set all header/manifest/robots/sitemap with a config json file

----

### Admin (if have time)

- [ ] Create some page to not have to create/edit the jsons file in folder "content". Pages must be static if possible

----

### Production

- [ ] Create a script that will automaticaly commit and push
- [ ] Git -> when get a push, construct the dist and upload it

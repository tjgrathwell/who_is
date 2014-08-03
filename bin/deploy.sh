git branch -D gh-pages

git checkout -b gh-pages

git filter-branch -f --env-filter "
    GIT_AUTHOR_NAME='nobody'
    GIT_AUTHOR_EMAIL='nobody-gh-pages@example.com'
    GIT_COMMITTER_NAME='nobody'
    GIT_COMMITTER_EMAIL='nobody-gh-pages@example.com'
  " HEAD

git push -f origin gh-pages

git checkout master

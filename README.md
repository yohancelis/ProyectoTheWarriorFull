Proyecto The Warrior Barber Shop

*** COMANDOS ***
git config --global alias.quick '!f() { git add . && git commit -m "$1" && git push -u origin Lizcano; }; f'
git quick "Mensaje"

git config --global --get-regexp alias
git config --global --unset alias.quick
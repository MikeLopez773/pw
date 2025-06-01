#!/bin/bash
git add .
if ! git diff --cached --quiet; then
    git commit -m "Atualização automática"
    git push origin main
else
    echo "Nenhuma alteração para commit."
fi


# git add .
# git commit -m "Alterações locais antes do rebase"
# git pull origin main --rebase
# git push origin main 
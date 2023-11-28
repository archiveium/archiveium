#!/bin/bash

# Fail if no argument is supplied
if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
    exit 1
fi

while getopts :j:a: flag
do
    case "${flag}" in
        j) jobber=${OPTARG};;
        a) app=${OPTARG};;
    esac
done

if [[ -n "$app" ]]; then
    echo 'Replacing frontend version'
    sed -i "s/archiveium\/frontend.*/archiveium\/frontend:$app/g" docker-compose.yml
fi

# if [[ -n "$jobber" ]]; then
#     echo 'Replacing jobber version'
#     sed -i "s/archiveium\/jobber.*/archiveium\/jobber:$jobber/g" docker-compose.yml
# fi

echo 'Setting up github user for auto-commit'
git config user.name github-actions
git config user.email github-actions@github.com

echo 'Commit docker-compose.yml'
git add docker-compose.yml
git commit -m "chore: Bump version" docker-compose.yml
git push
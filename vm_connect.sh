#! /bin/sh

CONN='52.156.82.201'
PEM=$(find . -regex ".*\.pem")

read -p $'\e[31mVM Username (default: \'azureuser\'): \e[0m' username
username=${username:-azureuser}

ssh -tt -i $PEM $username@$CONN
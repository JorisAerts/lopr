#!/bin/bash

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 3650 -nodes -subj '/CN=localhost' \

# openssl genrsa -out key.pem 2048
# openssl req -new -key key.pem -out cert.csr
# openssl x509 -req -in cert.csr -signkey key.pem -out cert.pem

#!/bin/bash

API="http://localhost:4741"
URL_PATH="/lists"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "example": {
      "title": "'"${TITLE}"'"
      "text": "'"${TEXT}"'",
    }
  }'

echo

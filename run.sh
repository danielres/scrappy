#!/bin/bash
echo "==================================="

echo "in: $XLSX_IN"
echo "out: $XLSX_OUT"

echo "==================================="

cp ./organizations_unprocessed.xlsx ./organizations.xlsx
echo "organizations.xlsx has been reset to unprocessed state"

echo "==================================="

node ./extractor.js

echo "==================================="

echo "result: $XLSX_OUT"

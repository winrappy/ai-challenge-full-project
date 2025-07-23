#!/bin/bash

set -euo pipefail

echo "🚀 Starting ArisePreQ Loan Pre-Qualification System"

make docker-build

make k8s-deploy

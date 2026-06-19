Helm chart for NAGP26 API and in-cluster SQL Server.

Usage:
  helm upgrade --install nagp26 ./helm/nagp26-api \
    --namespace nagp26 --create-namespace \
    --wait --timeout 10m \
    --set image.repository=aadil77/nagp26-app \
    --set image.tag=<GIT_SHA_OR_TAG> \
    --set sql.saUser='sa' \
    --set sql.saPassword='<SA_PASSWORD>' \
    --set sql.appUser='<DB_USER>' \
    --set sql.appPassword='<DB_PASSWORD>'

Security note: in production, do not pass passwords on the CLI. Prefer External Secrets / Secret Manager + Workload Identity.

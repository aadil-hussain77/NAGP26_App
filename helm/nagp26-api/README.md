Helm chart for NAGP26 API and in-cluster SQL Server.

Usage:
  helm upgrade --install nagp26 ./helm/nagp26-api --namespace nagp26 --create-namespace --set sql.saPassword="REPLACE_ME"

Security note: set `sql.saPassword` via a sealed secret or external secrets in production.

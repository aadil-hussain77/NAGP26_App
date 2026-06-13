This folder contains plain Kubernetes YAML manifests for deploying the API and in-cluster SQL Server StatefulSet.
Files:
- namespace.yaml
- sql-secret.yaml (example) - contains placeholders
- db-config.yaml
- api-deployment.yaml
- api-service.yaml
- api-ingress.yaml
- sql-statefulset.yaml
- sql-service.yaml
- db-init-configmap.yaml
- db-init-job.yaml
- networkpolicy.yaml
- pdb-api.yaml
- hpa-api.yaml
- cronjob-backup.yaml (optional)

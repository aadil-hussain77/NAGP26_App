# GKE deployment notes (current implementation)

This repo already contains working deployment artifacts for GKE:

- **Helm**: `helm/nagp26-api/`
- **Raw Kubernetes**: `k8s/`
- **GitHub Actions**: `.github/workflows/deploy.yaml`

Key points of the current implementation:

- **Ingress**: GCE Ingress (`ingressClassName: gce`). Load balancer provisioning can take a few minutes.
- **API tier**: `Deployment` with **4 replicas**, readiness/liveness on `/healthz`, HPA enabled.
- **DB tier**: SQL Server `StatefulSet` (1 replica) with PVC for `/var/opt/mssql`, `updateStrategy: OnDelete`.
- **DB init**: `Job` runs `sqlcmd` against SQL Server and executes an `init.sql` from ConfigMap (idempotent).
- **Secrets**:
  - Kubernetes Secret name: `sql-credentials`
  - Keys: `DB_USER`, `DB_PASSWORD`, `SA_PASSWORD`

For step-by-step setup on GKE and GitHub Actions secrets, see `MANUAL-STEPS.md`.

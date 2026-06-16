# NAGP26_App

This is a Razor Pages single-page application that lists employees and supports CRUD via a minimal API.

## Assignment deliverables
- **Code repository URL**: <ADD_REPO_URL>
- **Docker Hub image URL**: <ADD_DOCKER_HUB_URL>
- **Service API URL (Ingress)**: <ADD_INGRESS_URL>
- **Screen recording URL** (objects + API call + self-heal + persistence): <ADD_VIDEO_URL>

## Requirement understanding (from the assignment PDF)
- **Service/API tier**: externally exposed via **Ingress**, **4 pods**, rolling updates, self-healing, HPA, CPU/memory requests+limits.
- **Database tier**: **1 pod**, internal-only (ClusterIP), persistent storage, recovers after pod deletion.
- **Config & secrets**: DB host/name/user via **ConfigMap**; DB password via **Secret** and **not clearly visible in any Kubernetes YAML**.
- **Connectivity**: communicate via **Service DNS**, not Pod IPs.

## Assumptions
- You have an Ingress Controller installed in your cluster (e.g., nginx).
- A default StorageClass exists for PVC provisioning.

## Solution overview
- **API**: .NET (Razor Pages + Minimal APIs) with EF Core DbContext pooling and readiness/liveness probes.
- **DB**: SQL Server container with PVC-backed `/var/opt/mssql` storage.
- **Kubernetes**: raw manifests in `k8s/` (Deployment, Service, Ingress, HPA, ConfigMap, PVC).

Run locally:
- Set connection string in `appsettings.Development.json` or user secrets named `DefaultConnection`.
- dotnet run

Container & Kubernetes:
- Build image: `docker build -t nagp26_app:latest .`
- Create the DB password secret (do not commit the real password in YAML):
  - `kubectl create secret generic sql-credentials --from-literal=sa-password='<YOUR_STRONG_PASSWORD>' --dry-run=client -o yaml | kubectl apply -f -`
- Apply k8s manifests: `kubectl apply -f k8s/`

Design notes:
- EF Core with DbContext pooling
- Minimal APIs for the service layer
- SQL Server (mssql) for data tier with PVC for persistence
- Service is exposed externally via Ingress
- Database is ClusterIP only
- HPA configured for the deployment
- Liveness and readiness probes added

## FinOps (cost optimization opportunities)
- **Right-size resources**: start with low requests/limits on API, then adjust using observed CPU/memory metrics.
- **Autoscaling**: keep HPA enabled to avoid over-provisioning during low traffic.
- **Reduce database cost**: use the smallest viable storage size and avoid over-allocating CPU/memory to the DB pod.

## Demo checklist (for the screen recording)
- `kubectl get all,ingress,hpa,configmap,secret,pvc`
- API call returns DB records: `GET /api/employees`
- Delete one API pod → shows it regenerates (self-healing)
- Delete DB pod → shows it regenerates and old data remains (PVC persistence)

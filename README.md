# NAGP26_App

This is a Razor Pages single-page application that lists employees and supports CRUD via a minimal API.

## Assignment deliverables
- **Code repository URL**: <ADD_REPO_URL>
- **Docker Hub image URL**: <ADD_DOCKER_HUB_URL>
- **Service API URL (Ingress)**: <ADD_INGRESS_URL>
- **Screen recording URL** (objects + API call + self-heal + persistence): <ADD_VIDEO_URL>

## Requirement understanding
- **Service/API tier**: externally exposed via **Ingress**, **4 pods**, rolling updates, self-healing, HPA, CPU/memory requests+limits.
- **Database tier**: **1 pod**, internal-only (ClusterIP), persistent storage, recovers after pod deletion.
- **Config & secrets**: DB host/name/user via **ConfigMap**; DB password via **Secret** and **not clearly visible in any Kubernetes YAML**.
- **Connectivity**: communicate via **Service DNS**, not Pod IPs.

## Assumptions
- You are deploying to **GKE** and using **GCE Ingress** (`ingressClassName: gce`).
- A default `StorageClass` exists for PVC provisioning.

## Solution overview
- **API**: .NET (Razor Pages + Minimal APIs) with EF Core DbContext pooling and readiness/liveness probes.
- **DB**: SQL Server container with PVC-backed `/var/opt/mssql` storage.
- **Kubernetes**:
  - **Helm chart** in `helm/nagp26-api/`
  - **Raw manifests** in `k8s/`

Run locally:
- Set connection string in `appsettings.Development.json` or user secrets named `DefaultConnection`.
- dotnet run

## Deploy (raw Kubernetes manifests)

```bash
kubectl create namespace nagp26 --dry-run=client -o yaml | kubectl apply -f -

kubectl -n nagp26 create secret generic sql-credentials \
  --from-literal=DB_USER='<DB_USER>' \
  --from-literal=DB_PASSWORD='<DB_PASSWORD>' \
  --from-literal=SA_PASSWORD='<SA_PASSWORD>' \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f k8s/
```

Access:
- UI: `http://<INGRESS_IP>/Employees`
- API: `http://<INGRESS_IP>/api/employees`

Design notes:
- EF Core with DbContext pooling
- Minimal APIs for the service layer
- SQL Server (mssql) for data tier with PVC for persistence
- Service is exposed externally via Ingress
- Database is ClusterIP only
- HPA configured for the deployment
- Liveness and readiness probes added

## Demo checklist (for the screen recording)
- `kubectl get all,ingress,hpa,configmap,secret,pvc`
- API call returns DB records: `GET /api/employees`
- Delete one API pod → shows it regenerates (self-healing)
- Delete DB pod → shows it regenerates and old data remains (PVC persistence)

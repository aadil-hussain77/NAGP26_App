# NAGP26_App

This is a Razor Pages single-page application that lists employees and supports CRUD via a minimal API.

## Assignment deliverables
- **Code repository URL**: https://github.com/aadil-hussain77/NAGP26_App.git
- **Docker Hub image URL**: https://hub.docker.com/repository/docker/aadil77/nagp26-app
- **Service API URL (Ingress)**: - UI: `http://<INGRESS_IP>/Employees`
                                 - API: `http://<INGRESS_IP>/api/employees`
                                 - health: `http://<INGRESS_IP>/healthz`
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

## FinOps (cost optimization)

### CPU & memory requests/limits (implemented)
- API tier requests/limits are defined in Kubernetes manifests and Helm values.

### Opportunities to optimize Kubernetes cost
- **Right-size requests/limits**: reduce over-provisioning by tuning API CPU/memory requests based on observed usage (and keep sensible limits to avoid noisy-neighbor issues).
- **Autoscaling strategy**: keep HPA enabled and set `maxReplicas` to a value that matches expected peak; avoid permanently running more than the baseline 4 pods if load is low.
- **Database sizing**: “This solution uses StatefulSet+PVC to meet the assignment. 
                      -In a production-equivalent FinOps approach, we’d typically move the DB to a managed service and keep GKE for the stateless API.
- **Image + rollout efficiency**: deploy immutable tags (commit SHA) to avoid re-pulling `latest` and reduce churn/time-to-ready during deployments.

### Implement resource optimization using observed metrics (how to demonstrate)
1) Observe live usage:

```bash
kubectl -n nagp26 top pods
kubectl -n nagp26 top nodes
kubectl -n nagp26 describe hpa nagp26-app-hpa
```

2) Tune API tier requests/limits using what you saw:
- Set **CPU request** close to typical steady-state usage per pod (with headroom).
- Set **memory request** close to steady-state usage (with headroom).
- Keep **limits** high enough to handle spikes but low enough to protect the node.

In the demo video, capture the `kubectl top` output and show the chosen requests/limits in the Deployment YAML to prove the optimization is based on observed metrics.

## Demo checklist (for the screen recording)
- `kubectl get all,ingress,hpa,configmap,secret,pvc`
- API call returns DB records: `GET /api/employees`
- Delete one API pod → shows it regenerates (self-healing)
- Delete DB pod → shows it regenerates and old data remains (PVC persistence)

# Manual deployment prerequisites & steps (GCP/GKE + GitHub Actions)

This file lists the **manual steps required in correct sequence** to deploy the application to **GKE** and access it, using either:

- **Helm chart** (`helm/nagp26-api/`) via the GitHub Actions pipeline, or
- **Raw Kubernetes YAML** (`k8s/`) via `kubectl apply`.

## 0) One-time: GCP project setup

- Create/select a **GCP Project**.
- Enable required APIs:
  - **Kubernetes Engine API**
  - **IAM API**
  - **Cloud Resource Manager API**

## 1) One-time: Create a GKE cluster

- Create a **GKE cluster** (Standard or Autopilot).
- Note the values you will need later:
  - **Cluster name**
  - **Location** (zone or region)

## 2) One-time: Configure GitHub → GCP authentication (OIDC)

The workflow uses **Workload Identity Federation (OIDC)** (no JSON key).

- Create a **Workload Identity Pool** and **Provider** in GCP.
- Create a **GCP Service Account** for GitHub Actions.
- Allow the GitHub repo (OIDC principal) to **impersonate** the Service Account.
- Grant the Service Account permissions required to deploy to GKE (typical minimum):
  - Get cluster credentials
  - Apply/upgrade resources in the target namespace

## 3) One-time: Configure GitHub repository secrets

In GitHub: **Repo → Settings → Secrets and variables → Actions → New repository secret**

Required by `.github/workflows/deploy.yaml`:

- **DOCKERHUB_USERNAME**
- **DOCKERHUB_PASSWORD**
- **GCP_WORKLOAD_IDENTITY_PROVIDER**
- **GCP_SA_EMAIL**
- **GCP_PROJECT**
- **GKE_CLUSTER** (nagp-cluster)
- **GKE_ZONE** () (or region; must match your cluster location value)

Required (for DB credentials; used to create the Kubernetes Secret automatically in the pipeline):

- **SQL_DB_USER** (example: `nagpUser`)
- **SQL_DB_PASSWORD** (example: `Password@12345`)

## 4) One-time: Decide the exposure URL and DNS

You are using **GCE/GKE Ingress** class.

- Helm Ingress host default: `employees-api.nagap26.com` (from `helm/nagp26-api/values.yaml`)
- Raw k8s Ingress host default: `nagp26.local` (from `k8s/ingress.yaml`)

For the cleanest demo on GKE, prefer using a real DNS host (example: `employees-api.<your-domain>`):

- After the first deploy, get the Ingress external IP:
  - `kubectl -n <namespace> get ingress`
- Create a DNS **A record** pointing the host to that external IP.

## 5) Secrets handling (no manual cluster step)

The pipeline automatically creates/updates the Kubernetes Secret named **`sql-credentials`** in namespace `nagp26` using GitHub Secrets:
- `SQL_DB_USER` → `DB_USER`
- `SQL_DB_PASSWORD` → `DB_PASSWORD`

Notes:
- You do **not** need to manually apply a Secret manifest or run `kubectl create secret` from your laptop.
- Do **NOT** commit real passwords in any YAML in the repository.

## 6A) Deploy using GitHub Actions (Helm path)

The workflow file is `.github/workflows/deploy.yaml`.

**Sequence:**

- Ensure steps 0–5 are done.
- Push/merge code to the `master` branch (the workflow triggers on push to `master`).
- Confirm the pipeline succeeded:
  - Docker image built and pushed to Docker Hub
  - Helm upgrade/install completed

Notes:
- The pipeline also tags the image with the commit SHA and deploys that tag, which avoids the common `latest` + `IfNotPresent` caching issue.

### DB credentials in Helm

The workflow passes `SQL_DB_USER` and `SQL_DB_PASSWORD` into Helm using `--set`, so the Helm-managed Secret matches the same values.

## 6B) Deploy using raw Kubernetes YAML (`k8s/` path)

**Sequence:**

- Ensure steps 0–5 are done.
- Apply manifests:

```bash
kubectl apply -f k8s/
```

Tip:
- To deploy raw YAML via GitHub Actions (so secrets are also handled automatically), run the workflow manually and choose input `deploy_method = k8s`.

## 7) Verify deployment health (both paths)

```bash
kubectl -n <namespace> get pods,svc,ingress,hpa,configmap,secret,pvc
```

Expected:
- API Deployment has **4 pods** (or HPA min 4)
- DB has **1 pod** and a bound PVC
- Ingress has an external IP

## 8) Access the application

- Open the host you configured:
  - `http://<your-host>/` (Employees page)
  - `http://<your-host>/api/employees` (API)

## 9) Demo checklist (assignment recording)

- Show objects:
  - `kubectl get all -n <namespace>`
  - `kubectl get ingress,hpa,configmap,secret,pvc -n <namespace>`
- API call returns records:
  - `GET /api/employees`
- Self-healing:
  - Delete an API pod → it is recreated
- Persistence:
  - Delete DB pod → it is recreated and data remains (PVC)


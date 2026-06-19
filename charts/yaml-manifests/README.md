This folder contains an alternate set of plain Kubernetes YAML manifests.

Source of truth for raw Kubernetes deployment in this repo is `k8s/`.

If you use these manifests:
- Ensure namespaces match (`nagp26`)
- Do not apply placeholder Secret YAML (create `sql-credentials` at deploy time)

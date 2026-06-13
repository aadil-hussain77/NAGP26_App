# NAGP26_App

This is a Razor Pages single-page application that lists employees and supports CRUD via a minimal API.

Run locally:
- Set connection string in `appsettings.Development.json` or user secrets named `DefaultConnection`.
- dotnet run

Container & Kubernetes:
- Build image: `docker build -t nagp26_app:latest .`
- Apply k8s manifests: `kubectl apply -f k8s/` (ensure you update secrets.yaml with a strong SA password)

Design notes:
- EF Core with DbContext pooling
- Minimal APIs for the service layer
- SQL Server (mssql) for data tier with PVC for persistence
- Service is exposed via a LoadBalancer service
- Database is ClusterIP only
- HPA configured for the deployment
- Liveness and readiness probes added

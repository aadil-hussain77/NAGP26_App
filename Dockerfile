# Multi-stage Dockerfile for NAGP26_App (production, .NET 8)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY NAGP26_App/*.csproj ./NAGP26_App/
RUN dotnet restore ./NAGP26_App/NAGP26_App.csproj

# copy everything else and build
COPY . .
WORKDIR /src/NAGP26_App
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
ENV ASPNETCORE_URLS="http://+:80"
EXPOSE 80

# Copy published app
COPY --from=build /app/publish ./

# Use a non-root user
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "NAGP26_App.dll"]
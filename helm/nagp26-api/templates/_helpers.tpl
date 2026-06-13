{{- define "nagp26-api.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "nagp26-api.fullname" -}}
{{- printf "%s" (include "nagp26-api.name" .) -}}
{{- end -}}

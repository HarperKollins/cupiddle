# ==========================================
# CUPIDDLE PRODUCTION MULTI-STAGE DOCKERFILE
# Builds React PWA Frontend + High-Performance Go Server
# Into a lightweight, secure production container
# ==========================================

# Stage 1: Build Web Frontend (PWA)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 2: Build Go Server
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/server
RUN apk add --no-cache git
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server/cupiddle ./cmd/server

# Stage 3: Minimal Production Runtime
FROM alpine:3.20 AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Africa/Lagos

# Create non-root user for security
RUN addgroup -S cupiddle && adduser -S cupiddle -G cupiddle

# Copy Go binary and web static bundle
COPY --from=backend-builder /app/server/cupiddle /app/cupiddle
COPY --from=frontend-builder /app/web/dist /app/web/dist

# Set storage and static paths
RUN mkdir -p /app/uploads/photos /app/uploads/audio && chown -R cupiddle:cupiddle /app
USER cupiddle

ENV PORT=8080
ENV ENVIRONMENT=production
ENV WEB_DIST_PATH=/app/web/dist
ENV STORAGE_PATH=/app/uploads

EXPOSE 8080

CMD ["/app/cupiddle"]

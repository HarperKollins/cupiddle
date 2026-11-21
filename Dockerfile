# ==========================================
# CUPIDDLE PRODUCTION DOCKERFILE
# Pure Go Backend + 100% Native Flutter Web
# Zero Node.js. Zero React.
# ==========================================

# Stage 1: Build Go Server
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/server
ENV GOTOOLCHAIN=auto
RUN apk add --no-cache git
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server/cupiddle ./cmd/server

# Stage 2: Minimal Production Runtime
FROM alpine:3.20 AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Africa/Lagos

# Create non-root user for security
RUN addgroup -S cupiddle && adduser -S cupiddle -G cupiddle

# Copy Go binary and Flutter Web static bundle
COPY --from=backend-builder /app/server/cupiddle /app/cupiddle
COPY flutter_dist /app/web/dist

# Set storage and static paths
RUN mkdir -p /app/uploads/photos /app/uploads/audio && chown -R cupiddle:cupiddle /app
USER cupiddle

ENV PORT=8080
ENV ENVIRONMENT=production
ENV WEB_DIST_PATH=/app/web/dist
ENV STORAGE_PATH=/app/uploads

EXPOSE 8080

CMD ["/app/cupiddle"]

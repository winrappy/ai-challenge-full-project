# Stage 1: Build the Go binary
FROM golang:alpine AS build

WORKDIR /app

# ติดตั้ง bash และ git เผื่อจำเป็น (ถ้าจำเป็น)
RUN apk add --no-cache git bash

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o backend-server ./cmd/main.go

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /app

# ติดตั้ง ca-certificates เผื่อ HTTPS ต้องใช้
RUN apk add --no-cache ca-certificates

COPY --from=build /app/backend-server .
COPY configs ./configs

EXPOSE 30090

CMD ["./backend-server"]

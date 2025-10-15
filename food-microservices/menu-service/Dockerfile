# ใช้ official Go image
FROM golang:1.19-alpine

# ติดตั้ง git สำหรับ go mod
RUN apk add --no-cache git

# สร้างโฟลเดอร์ /app
WORKDIR /app

# copy go.mod + go.sum ก่อน (เพื่อ caching)
COPY go.mod go.sum ./

# โหลด dependency
RUN go mod download

# copy โค้ดทั้งหมด
COPY . .

# default command (dev mode) ใช้ go run
CMD ["go", "run", "main.go"]

# 🐢 Tho-ret-Ci-ty

> A modern, high-performance Full-stack social network platform built for the SuperIdols community.

![Go Version](https://img.shields.io/badge/Go-1.22-00ADD8?style=for-the-badge&logo=go)
![React Version](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger)

## Introduction

**Tho-ret-Ci-ty** is my first majored project simulating the core features of a social network (get ideas from Threads developed by Meta). The project is designed with a Layered Architecture, focusing on performmance, scalability and simplicity. It demonstrates modern Backend techniques such as Database Transactions, Caching, Rate Limiting, and Asynchronous Processing.

## Features

* ** Authentication & Authorization:**
    * Registration/Login with JWT (JSON Web Token).
    * Role-based Access Control (User, Moderator, Admin).
    * Account activation via Email(Mailtrap/SendGrid integration).
* ** Post Management:**
    * CRUD operations for posts (text-like posts sopprted).
    * Supports Optimistic Locking (Versioning) on updates to prevent data conflicts.
* ** Social Interaction:**
    * Comment system.
    * Follow and Unfollow users.
    * *(Coming Soon)* Like posts.
* ** News Feed:**
    * Aggregated feed of posts from followed users.
    * Supports Pagination, Search, and Filtering by Tags.
* ** Security & Performance:**
    * Rate Limiting to prevent abuse/spam.
    * Redis Caching for user information to reduce Database load.
    * Graceful Shutdown.

##  Tech Stack

### Backend (API)
* **Language:** Go 1.22+
* **Framework:** [chi](https://github.com/go-chi/chi) (Lightweight, fast router).
* **Database:** PostgreSQL (`lib/pq` driver).
* **Cache:** Redis (`go-redis` library).
* **Migration:** `golang-migrate`.
* **Docs:** Swagger (Swaggo).
* **Utilities:** `zap` (Logging), `validator` (Input Validation).

### Frontend (Web)
* **Framework:** React 18.
* **Language:** TypeScript.
* **Build Tool:** Vite.
* **Routing:** React Router DOM.

### DevOps
* **Containerization:** Docker & Docker Compose.
* **CI/CD:** GitHub Actions (Audit code, release version).
* **Live Reload:** Air (for Backend development).

---

##  Installation & Setup Guide

### 1. Prerequisites
Ensure your machine has the following installed:
* [Go](https://go.dev/) (v1.22 or higher)
* [Docker & Docker Compose](https://www.docker.com/)
* [Node.js & npm](https://nodejs.org/) (for Frontend)
* [Make](https://www.gnu.org/software/make/) (Optional, but recommended)

### 2. Environment Setup (Backend)

Create an `.envrc` file in the root directory and fill in the configuration (Use a Mailtrap Sandbox account for email testing):

```bash
# Create .envrc file
export ADDR=:8080
export DB_ADDR=postgres://admin:adminpassword@localhost:5432/socialnetwork?sslmode=disable
export REDIS_ADDR=localhost:6379
export REDIS_ENABLED=true

# Email Configuration (Get from Mailtrap.io -> Email Testing -> Inboxes)
export FROM_EMAIL=test@Tho-ret-Ci-ty.com
export MAILTRAP_USER=your_mailtrap_username
export MAILTRAP_PASS=your_mailtrap_password

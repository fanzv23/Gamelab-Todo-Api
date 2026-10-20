# Rancangan Endpoint API Todo List

## 1. Auth (Autentikasi)
- **POST** `/api/auth/register` : Mendaftar user baru (Akses: Publik)
- **POST** `/api/auth/login` : Login dan mendapatkan token JWT (Akses: Publik)

## 2. Todo (Tugas)
- **POST** `/api/todos` : Membuat todo baru (Akses: User Login)
- **GET** `/api/todos` : Melihat daftar todo milik sendiri (Akses: User Login)
- **GET** `/api/todos/:id` : Melihat detail 1 todo (Akses: User Login)
- **PUT** `/api/todos/:id` : Mengedit todo (Akses: User Login)
- **DELETE** `/api/todos/:id` : Menghapus todo (Akses: User Login)

## 3. Category (Kategori)
- **POST** `/api/categories` : Membuat kategori baru (Akses: User Login)
- **GET** `/api/categories` : Melihat daftar kategori (Akses: User Login)
- **PUT** `/api/categories/:id` : Mengedit nama kategori (Akses: User Login)
- **DELETE** `/api/categories/:id` : Menghapus kategori (Akses: User Login)

## 4. Activity Log & Stats
- **GET** `/api/logs` : Melihat catatan aktivitas user (Akses: Admin / API Key)
- **GET** `/api/stats` : Melihat statistik jumlah todo/user (Akses: API Key)
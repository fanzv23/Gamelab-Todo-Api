// ====== Pembantu kecil supaya penulisan tidak berulang ======
const bearer = [{ bearerAuth: [] }];

const idParam = {
  name: "id",
  in: "path",
  required: true,
  description: "ID dokumen (ObjectId MongoDB, 24 karakter)",
  schema: { type: "string", example: "6ae976284ed88a7073550e1d" },
};

const jsonBody = (schema) => ({
  required: true,
  content: { "application/json": { schema } },
});

const jsonResponse = (description, schema) => ({
  description,
  content: { "application/json": { schema } },
});

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const resp = (name) => ({ $ref: `#/components/responses/${name}` });

const listQuery = [
  { name: "page", in: "query", description: "Nomor halaman", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", description: "Jumlah data per halaman (maksimal 50)", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
];

// ====== Spesifikasi API ======
module.exports = {
  openapi: "3.0.3",
  info: {
    title: "API Todos List Management",
    version: "1.0.0",
    description:
      "API manajemen todo (Node.js, Express, MongoDB) dengan autentikasi JWT, otorisasi role admin/user, dan API Key untuk akses mesin ke mesin.",
  },
  servers: [{ url: "http://localhost:3000", description: "Server lokal" }],
  tags: [
    { name: "Auth", description: "Registrasi dan login" },
    { name: "Todos", description: "Kelola todo milik pengguna" },
    { name: "Categories", description: "Kelola kategori milik pengguna" },
    { name: "Users", description: "Khusus admin" },
    { name: "Activity Logs", description: "Riwayat aktivitas todo" },
    { name: "Stats", description: "Statistik, dilindungi API Key" },
  ],

  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Daftar akun baru",
        description: "Role selalu 'user'. Field role dari body diabaikan.",
        requestBody: jsonBody({
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Tyo" },
            email: { type: "string", format: "email", example: "tyo@example.com" },
            password: { type: "string", minLength: 6, example: "rahasia123" },
          },
        }),
        responses: {
          201: jsonResponse("Registrasi berhasil", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              token: { type: "string" },
              data: { type: "object", properties: { user: ref("User") } },
            },
          }),
          400: resp("BadRequest"),
          409: jsonResponse("Email sudah terdaftar", ref("Error")),
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login dan dapatkan token JWT",
        requestBody: jsonBody({
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "tyo@example.com" },
            password: { type: "string", example: "rahasia123" },
          },
        }),
        responses: {
          200: jsonResponse("Login berhasil", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              token: { type: "string" },
            },
          }),
          400: resp("BadRequest"),
          401: jsonResponse("Email atau password salah", ref("Error")),
        },
      },
    },

    "/api/todos": {
      get: {
        tags: ["Todos"],
        summary: "Daftar todo milik pengguna (pagination, filter, sorting, search)",
        security: bearer,
        parameters: [
          ...listQuery,
          { name: "completed", in: "query", description: "Filter status selesai", schema: { type: "string", enum: ["true", "false"] } },
          { name: "category", in: "query", description: "Filter berdasarkan ID kategori", schema: { type: "string" } },
          { name: "search", in: "query", description: "Cari di judul dan deskripsi (tidak membedakan huruf besar dan kecil)", schema: { type: "string", maxLength: 100 } },
          { name: "sort", in: "query", description: "Urutan: created_at, updated_at, title, completed. Awali dengan - untuk terbalik.", schema: { type: "string", example: "-title" } },
        ],
        responses: {
          200: jsonResponse("Daftar todo", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              results: { type: "integer", example: 2 },
              pagination: ref("Pagination"),
              data: { type: "object", properties: { todos: { type: "array", items: ref("Todo") } } },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
        },
      },
      post: {
        tags: ["Todos"],
        summary: "Buat todo baru",
        security: bearer,
        requestBody: jsonBody({
          type: "object",
          required: ["title", "category"],
          properties: {
            title: { type: "string", maxLength: 100, example: "Belajar Swagger" },
            description: { type: "string", example: "Menulis dokumentasi API" },
            category: { type: "string", description: "ID kategori", example: "6ae974bc4ed88a7073550e1c" },
          },
        }),
        responses: {
          201: jsonResponse("Todo berhasil dibuat", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", properties: { todo: ref("Todo") } },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
        },
      },
    },

    "/api/todos/{id}": {
      patch: {
        tags: ["Todos"],
        summary: "Ubah todo milik sendiri",
        security: bearer,
        parameters: [idParam],
        requestBody: jsonBody({
          type: "object",
          properties: {
            title: { type: "string", example: "Judul baru" },
            description: { type: "string" },
            completed: { type: "boolean", example: true },
            category: { type: "string", description: "ID kategori" },
          },
        }),
        responses: {
          200: jsonResponse("Todo berhasil diubah", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", properties: { todo: ref("Todo") } },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
          404: resp("NotFound"),
        },
      },
      delete: {
        tags: ["Todos"],
        summary: "Hapus todo milik sendiri",
        security: bearer,
        parameters: [idParam],
        responses: {
          200: jsonResponse("Todo berhasil dihapus", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Todo berhasil dihapus" },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
          404: resp("NotFound"),
        },
      },
    },

    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Daftar kategori milik pengguna",
        security: bearer,
        responses: {
          200: jsonResponse("Daftar kategori", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              results: { type: "integer", example: 2 },
              data: { type: "object", properties: { categories: { type: "array", items: ref("Category") } } },
            },
          }),
          401: resp("Unauthorized"),
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Buat kategori baru",
        security: bearer,
        requestBody: jsonBody({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Kuliah" },
            description: { type: "string", example: "Tugas kuliah" },
          },
        }),
        responses: {
          201: jsonResponse("Kategori berhasil dibuat", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", properties: { category: ref("Category") } },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
        },
      },
    },

    "/api/categories/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Ubah kategori milik sendiri",
        security: bearer,
        parameters: [idParam],
        requestBody: jsonBody({
          type: "object",
          properties: {
            name: { type: "string", example: "Kuliah Semester 5" },
            description: { type: "string" },
          },
        }),
        responses: {
          200: jsonResponse("Kategori berhasil diubah", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", properties: { category: ref("Category") } },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
          404: resp("NotFound"),
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Hapus kategori milik sendiri (soft delete)",
        security: bearer,
        parameters: [idParam],
        responses: {
          200: jsonResponse("Kategori berhasil dihapus", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Kategori berhasil dihapus" },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
          404: resp("NotFound"),
        },
      },
    },

    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Daftar semua pengguna (hanya admin)",
        security: bearer,
        responses: {
          200: jsonResponse("Daftar pengguna", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              results: { type: "integer", example: 3 },
              data: { type: "object", properties: { users: { type: "array", items: ref("User") } } },
            },
          }),
          401: resp("Unauthorized"),
          403: resp("Forbidden"),
        },
      },
    },

    "/api/logs": {
      get: {
        tags: ["Activity Logs"],
        summary: "Riwayat aktivitas todo (user biasa hanya melihat miliknya, admin melihat semua)",
        security: bearer,
        parameters: [
          ...listQuery,
          { name: "action", in: "query", description: "Filter jenis aksi", schema: { type: "string", enum: ["create", "update", "delete"] } },
        ],
        responses: {
          200: jsonResponse("Daftar log aktivitas", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              results: { type: "integer", example: 2 },
              pagination: ref("Pagination"),
              data: { type: "object", properties: { logs: { type: "array", items: ref("ActivityLog") } } },
            },
          }),
          400: resp("BadRequest"),
          401: resp("Unauthorized"),
        },
      },
    },

    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Ringkasan statistik (akses mesin ke mesin dengan API Key)",
        description: "Tidak memakai token login. Kirim kunci pada header x-api-key.",
        security: [{ apiKeyAuth: [] }],
        responses: {
          200: jsonResponse("Ringkasan statistik", {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  users: { type: "integer", example: 3 },
                  categories: { type: "integer", example: 2 },
                  todos: {
                    type: "object",
                    properties: {
                      total: { type: "integer", example: 7 },
                      completed: { type: "integer", example: 1 },
                      pending: { type: "integer", example: 6 },
                      completionRate: { type: "integer", example: 14 },
                    },
                  },
                  todosPerCategory: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", example: "Kuliah" },
                        total: { type: "integer", example: 5 },
                      },
                    },
                  },
                },
              },
            },
          }),
          401: jsonResponse("API Key tidak disertakan", ref("Error")),
          403: jsonResponse("API Key tidak valid", ref("Error")),
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      apiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" },
    },
    responses: {
      BadRequest: jsonResponse("Input tidak valid", ref("Error")),
      Unauthorized: jsonResponse("Belum login atau token tidak valid", ref("Error")),
      Forbidden: jsonResponse("Role tidak memiliki izin", ref("Error")),
      NotFound: jsonResponse("Data tidak ditemukan atau bukan milik pengguna", ref("Error")),
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Pesan kesalahan" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 25 },
          totalPages: { type: "integer", example: 3 },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6ae95527db568b2cd8b41d91" },
          name: { type: "string", example: "Tyo" },
          email: { type: "string", example: "tyo@example.com" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
          archived: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6ae974bc4ed88a7073550e1c" },
          name: { type: "string", example: "Kuliah" },
          description: { type: "string", example: "Tugas kuliah" },
          created_by: { type: "string" },
          archived: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Todo: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6ae976284ed88a7073550e1d" },
          title: { type: "string", example: "Belajar Swagger" },
          description: { type: "string", example: "Menulis dokumentasi API" },
          completed: { type: "boolean", example: false },
          category: {
            description: "ID kategori (pada daftar todo berisi objek dengan _id dan name)",
            oneOf: [
              { type: "string" },
              { type: "object", properties: { _id: { type: "string" }, name: { type: "string" } } },
            ],
          },
          user: { type: "string" },
          created_by: { type: "string" },
          updated_by: { type: "string" },
          archived: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      ActivityLog: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user_id: {
            type: "object",
            properties: { _id: { type: "string" }, name: { type: "string" }, email: { type: "string" } },
          },
          action: { type: "string", enum: ["create", "update", "delete"] },
          entity: { type: "string", example: "todo" },
          entity_id: { type: "string" },
          description: { type: "string", example: "Membuat todo \"Belajar Swagger\"" },
          created_at: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
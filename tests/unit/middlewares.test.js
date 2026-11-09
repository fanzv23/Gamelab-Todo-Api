const AppError = require("../../src/utils/AppError");
const catchAsync = require("../../src/utils/catchAsync");
const restrictTo = require("../../src/middlewares/restrictTo.middleware");
const apiKey = require("../../src/middlewares/apiKey.middleware");

describe("AppError", () => {
  test("kode 4xx berstatus fail dan bersifat operasional", () => {
    const err = new AppError("Tidak ditemukan", 404);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Tidak ditemukan");
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe("fail");
    expect(err.isOperational).toBe(true);
  });

  test("kode 5xx berstatus error", () => {
    const err = new AppError("Server bermasalah", 500);
    expect(err.status).toBe("error");
  });
});

describe("catchAsync", () => {
  test("meneruskan error dari fungsi async ke next", async () => {
    const error = new Error("gagal");
    const handler = catchAsync(async () => {
      throw error;
    });
    const next = jest.fn();

    handler({}, {}, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });

  test("tidak memanggil next jika fungsi berhasil", async () => {
    const handler = catchAsync(async (req, res) => {
      res.sent = true;
    });
    const res = {};
    const next = jest.fn();

    handler({}, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.sent).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("restrictTo", () => {
  test("role yang diizinkan lolos", () => {
    const next = jest.fn();
    restrictTo("admin")({ user: { role: "admin" } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  test("role yang tidak diizinkan ditolak dengan 403", () => {
    const next = jest.fn();
    restrictTo("admin")({ user: { role: "user" } }, {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });
});

describe("middleware API Key", () => {
  const keyAsli = process.env.API_KEY;

  beforeEach(() => {
    process.env.API_KEY = "kunci-uji-123";
  });

  afterAll(() => {
    if (keyAsli === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = keyAsli;
  });

  const jalankan = (headers) => {
    const next = jest.fn();
    apiKey({ headers }, {}, next);
    return next;
  };

  test("tanpa header: ditolak 401", () => {
    const next = jalankan({});
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test("key salah: ditolak 403", () => {
    const next = jalankan({ "x-api-key": "salah" });
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test("key benar: lolos tanpa error", () => {
    const next = jalankan({ "x-api-key": "kunci-uji-123" });
    expect(next).toHaveBeenCalledWith();
  });

  test("key belum dikonfigurasi di server: 500", () => {
    delete process.env.API_KEY;
    const next = jalankan({ "x-api-key": "apa-saja" });
    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });
});
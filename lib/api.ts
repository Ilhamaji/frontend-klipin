import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-skripsi.netlify.app/api";

function getHeaders() {
  const token = Cookies.get("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponseError(response: Response, defaultMessage: string): Promise<never> {
  const status = response.status;
  let errorData: any = null;

  try {
    const text = await response.text();
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { rawText: text };
    }
  } catch {
    errorData = null;
  }

  if (status === 401) {
    throw new Error("Sesi login Anda telah kedaluwarsa. Silakan masuk kembali.");
  }

  if (status === 403) {
    throw new Error("Akses ditolak. Anda tidak memiliki izin.");
  }

  if (status === 404) {
    throw new Error(errorData?.message || "Data atau layanan tidak ditemukan.");
  }

  if (status === 504) {
    throw new Error("Layanan backend/AI membutuhkan waktu lebih lama untuk merespons (Gateway Timeout). Silakan coba beberapa saat lagi.");
  }

  if (status >= 500) {
    if (errorData?.message && typeof errorData.message === "string") {
      if (errorData.message.includes("tenant/user") || errorData.message.includes("ENOTFOUND")) {
        throw new Error("Koneksi database backend sedang tidak aktif atau dijeda. Harap periksa status database server.");
      }
      throw new Error(`Server error: ${errorData.message}`);
    }
    throw new Error("Server backend sedang mengalami kendala internal (500). Silakan coba lagi nanti.");
  }

  if (errorData?.data && Array.isArray(errorData.data)) {
    const messages = errorData.data.map((item: any) => item.message || JSON.stringify(item)).join(", ");
    throw new Error(messages || defaultMessage);
  }

  if (errorData?.message) {
    throw new Error(errorData.message);
  }

  throw new Error(defaultMessage);
}

// Login
export async function login(username: string, password: string) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server backend. Periksa koneksi internet Anda atau status server.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal melakukan login. Periksa username dan password Anda.");
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.message || "Gagal masuk.");
  }

  return data;
}

// Register
export async function register(username: string, password: string) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server backend. Periksa koneksi internet Anda atau status server.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Pendaftaran akun gagal. Silakan periksa kembali data Anda.");
  }

  return await response.json();
}

// Get user profile
export async function getProfile() {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal terhubung ke server profil.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal memuat profil pengguna.");
  }
  return response.json();
}

export async function searchArticles(query: string) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/search`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server pencarian. Pastikan server backend & AI service aktif.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal melakukan pencarian artikel.");
  }
  return response.json();
}

// Get history pencarian
export async function articleHistory() {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/search/history`, {
      method: "GET",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal mengambil histori pencarian.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal mengambil histori pencarian.");
  }

  return response.json();
}

// Hapus history pencarian
export async function deleteSearchHistory(queryId: number) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/search/history/${queryId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal menghapus riwayat.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal menghapus histori pencarian.");
  }

  return response.json();
}

// Get Articles
export async function getArticles() {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/library`, {
      method: "GET",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal mengambil data materi.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal mengambil materi tersimpan.");
  }

  return response.json();
}

// Save article
export async function saveArticle(article_id: number) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/library/save`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ article_id }),
    });
  } catch {
    throw new Error("Gagal menyimpan artikel.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal menyimpan artikel.");
  }

  return response.json();
}

// Delete article
export async function deleteArticle(article_id: number) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/library/delete/${article_id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal menghapus artikel.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal menghapus materi.");
  }

  return response.json();
}

// Summarize
export async function summarize(data?: any) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/summarize`, {
      method: "POST",
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke AI service untuk meringkas. Silakan periksa status AI service.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal membuat ringkasan materi.");
  }
  return response.json();
}

export async function getNotes() {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/note`, {
      method: "GET",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal mengambil catatan.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal memuat catatan.");
  }
  return response.json();
}

export async function getNoteById(id: number) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/note/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal mengambil detail catatan.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal memuat catatan.");
  }
  return response.json();
}

export async function addNote(title: string, contents: string) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/note/add`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title, contents }),
    });
  } catch {
    throw new Error("Gagal terhubung untuk menambah catatan.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal menambahkan catatan baru.");
  }
  return response.json();
}

export async function editNote(id: number, title?: string, contents?: string) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/note/edit/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ title, contents }),
    });
  } catch {
    throw new Error("Gagal terhubung untuk mengubah catatan.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal memperbarui catatan.");
  }
  return response.json();
}

export async function deleteNote(id: number) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/note/delete/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  } catch {
    throw new Error("Gagal terhubung untuk menghapus catatan.");
  }

  if (!response.ok) {
    return handleResponseError(response, "Gagal menghapus catatan.");
  }
  return response.json();
}

// Aliases for compatibility
export const getAllSavedArticle = getArticles;
export const deleteSavedArticle = deleteArticle;
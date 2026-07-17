import Cookies from "js-cookie";

// BE Local
// const BASE_URL = "http://localhost:3001/api";

const BASE_URL = "https://backend-skripsi.netlify.app/api";

function getHeaders() {
  const token = Cookies.get("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}



// Login
export async function login(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  // ubah jadi json
  const data = await response.json();

  if (data.error) {
    // Kirim pesan error backend
    throw new Error(data.message);  
  }

  return data;
}

// Register
export async function register(
  username: string,
  password: string
) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

// Get user profile
export async function getProfile() {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: "GET",
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data profile");
  }
  return response.json();
}

export async function searchArticles(query: string) {
  const response = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error("Backend search error:", response.status, errText);
    throw new Error(`Search failed: ${response.status} ${errText}`);
  }
  return response.json();
}

// Get history pencarian
export async function articleHistory() {
  const response = await fetch(`${BASE_URL}/search/history`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengambil history pencarian");
  }

  return data;
}

// Get saved article
export async function getAllSavedArticle() {
  const response = await fetch(`${BASE_URL}/library/saved-articles`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengambil data artikel yang disimpan!");
  }

  return data;
}

// Add artikel ke lib
export async function saveArticle(articleId: number) {
  const response = await fetch(`${BASE_URL}/library/saved-articles`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ articleId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal menyimpan artikel!");
  }

  return data;
}

// Delete artikel dari lib
export async function deleteSavedArticle(articleId: number) {
  const response = await fetch(`${BASE_URL}/library/saved-articles/${articleId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal menghapus artikel!");
  }

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function summarize(data?: any) {
  const response = await fetch(`${BASE_URL}/summarize`, {
    method: "POST",
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const errText = await response.text();
    let errMsg = errText;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.message) errMsg = errJson.message;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Not JSON
    }
    console.error("Backend summarize error:", errMsg);
    throw new Error(errMsg);
  }
  return response.json();
}

export async function getNotes() {
  const response = await fetch(`${BASE_URL}/note`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
}

export async function getNoteById(id: number) {
  const response = await fetch(`${BASE_URL}/note/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch note");
  }
  return response.json();
}

export async function addNote(title: string, contents: string) {
  const response = await fetch(`${BASE_URL}/note/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title, contents }),
  });
  if (!response.ok) {
    throw new Error("Failed to add note");
  }
  return response.json();
}

export async function editNote(id: number, title?: string, contents?: string) {
  const response = await fetch(`${BASE_URL}/note/edit/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ title, contents }),
  });
  if (!response.ok) {
    const err = await response.text();
    console.error("Edit note failed:", err);
    throw new Error("Failed to edit note");
  }
  return response.json();
}

export async function deleteNote(id: number) {
  const response = await fetch(`${BASE_URL}/note/delete/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete note");
  }
  return response.json();
}

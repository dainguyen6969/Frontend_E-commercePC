const API_BASE = "http://localhost:8080/trongdai"; // <-- Đã sửa: THÊM CONTEXT-PATH

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    cache: "no-store", // quan trọng cho Server Component
  });

  if (!res.ok) {
    // Để dễ debug hơn, log lỗi ra console
    console.error(`API GET ${path} failed with status: ${res.status}`);
    // Trả về một đối tượng lỗi để Frontend xử lý
    throw new Error(`GET ${path} failed: ${res.statusText}`); 
  }

  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`API POST ${path} failed with status: ${res.status}`);
    throw new Error(`POST ${path} failed: ${res.statusText}`);
  }

  return res.json();
}
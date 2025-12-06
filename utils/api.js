const API_BASE = "http://localhost:8080/trongdai"; // <-- Đã sửa: THÊM CONTEXT-PATH

export async function apiGet(path) {
  // Lấy token từ localStorage (chỉ hoạt động nếu code này chạy trong Client Component)
  // Tuy nhiên, vì HomePage là Server Component, chúng ta không thể truy cập localStorage.
  // Do đó, chúng ta phải dựa vào Backend cho phép các API GET này là public.

  // NOTE: Trong môi trường Server Component (HomePage), chúng ta không thể dùng localStorage.
  // Chúng ta chỉ có thể dựa vào cookie/header hoặc API phải là public.
  // Giả định: Backend đã mở public cho GET /products và GET /categories.
  
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    cache: "no-store", // quan trọng cho Server Component
    // Không thêm Auth Header ở đây vì không có cách an toàn để lấy token JWT từ Server Component
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
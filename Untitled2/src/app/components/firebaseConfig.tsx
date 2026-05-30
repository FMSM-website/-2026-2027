// ============================================================
// firebaseConfig.tsx — الاتصال عبر Vercel لتفادي الحظر
// ============================================================

// ── حفظ بيانات تسجيل جديدة ────────────────────────────────────────
export async function pushToFirebase(path: string, data: object): Promise<string> {
  const res = await fetch(`/api/firebase?path=${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Proxy POST error: ${res.status}`);
  const result = await res.json();
  return result.name;
}

// ── جلب البيانات الحقيقية من المسار ───────────────────────────
export async function getFromFirebase(path: string): Promise<Record<string, any> | null> {
  const res = await fetch(`/api/firebase?path=${path}`);
  if (!res.ok) throw new Error(`Proxy GET error: ${res.status}`);
  return res.json();
}

// ── تحديث حالة طلب أو حقل معين ──────────────────────────────────────────
export async function updateInFirebase(path: string, data: object): Promise<void> {
  const res = await fetch(`/api/firebase?path=${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Proxy PATCH error: ${res.status}`);
}

// ── حذف عنصر ────────────────────────────────────────────────
export async function deleteFromFirebase(path: string): Promise<void> {
  const res = await fetch(`/api/firebase?path=${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Proxy DELETE error: ${res.status}`);
}

// ════════════════════════════════════════════════════════════
// دوال موحّدة — كلها تقرأ وتكتب بأمان من خلال سيرفر Vercel
// ════════════════════════════════════════════════════════════

// ── جلب جميع الطلاب المسجلين بالكامل ─────
export async function getAllApplications(): Promise<any[]> {
  try {
    const data = await getFromFirebase("applications");
    if (!data) return [];

    const allApps: any[] = [];
    for (const [deptId, deptApps] of Object.entries(data)) {
      if (deptApps && typeof deptApps === "object") {
        for (const [id, app] of Object.entries(deptApps as Record<string, any>)) {
          allApps.push({ id, departmentId: deptId, ...app });
        }
      }
    }
    return allApps.sort((a, b) => {
      const da = a.submittedAt || a.submissionDate || "";
      const db = b.submittedAt || b.submissionDate || "";
      return db.localeCompare(da);
    });
  } catch (error) {
    console.error("خطأ في جلب جميع الطلبات:", error);
    return [];
  }
}

// ── تحديث حالة الملف (مقبول / مرفوض / معلق) ──────────────────────────────
export async function updateApplicationStatus(
  departmentId: string,
  appId: string,
  status: "pending" | "accepted" | "rejected"
): Promise<void> {
  await updateInFirebase(`applications/${departmentId}/${appId}`, { status });
}

// ── حذف طلب نهائياً من النظام ─────────────────────────────────────
export async function deleteApplication(
  departmentId: string,
  appId: string
): Promise<void> {
  await deleteFromFirebase(`applications/${departmentId}/${appId}`);
}

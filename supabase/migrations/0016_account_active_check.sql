-- =====================================================================
-- เช็คว่าบัญชีของคนที่ล็อกอินอยู่ยังไม่ถูกระงับ
--
-- ทำไมต้องเป็นฟังก์ชัน: RLS ของ profiles ซ่อนแถวที่ is_deleted = true
-- ผู้ใช้ที่โดนระงับจึงอ่าน profile ตัวเองไม่ได้ แยกไม่ออกว่า "โดนระงับ" หรือ "ไม่มี profile"
-- security definer ข้าม RLS ได้ แต่คืนแค่ true/false ของคนที่ล็อกอินอยู่เท่านั้น ไม่รั่วข้อมูลคนอื่น
--
-- ไม่มี profile เลย (เช่น trigger สมัครสมาชิกพลาด) → ถือว่ายังใช้งานได้ ไม่เตะออก
-- รันซ้ำได้ (idempotent)
-- =====================================================================

create or replace function public.is_account_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select not p.is_deleted from public.profiles p where p.id = auth.uid()),
    true
  );
$$;

revoke all on function public.is_account_active() from public;
grant execute on function public.is_account_active() to anon, authenticated;

-- ตรวจผล: ล็อกอินอยู่ใน SQL Editor จะได้ true (SQL Editor ไม่มี auth.uid() → คืน true)
select public.is_account_active();

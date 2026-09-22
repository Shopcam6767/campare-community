/**
 * ข้อมูลและตัวช่วยสำหรับฟอร์มที่อยู่ไทย — ใช้ร่วมกันทั้งฝั่งฟอร์ม (client) และ server action
 */

export const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
  "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย",
  "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
  "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน",
  "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี",
  "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก",
  "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร",
  "แม่ฮ่องสอน", "ยะลา", "ยโสธร", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล",
  "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
  "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู",
  "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี",
] as const;

export type ThaiAddress = {
  firstName: string;
  lastName: string;
  country: string;
  postalCode: string;
  line1: string;
  line2: string;
  subdistrict: string;
  district: string;
  province: string;
  phone: string;
};

export const EMPTY_ADDRESS: ThaiAddress = {
  firstName: "",
  lastName: "",
  country: "ไทย",
  postalCode: "",
  line1: "",
  line2: "",
  subdistrict: "",
  district: "",
  province: "",
  phone: "",
};

export const ADDRESS_FIELDS = Object.keys(EMPTY_ADDRESS) as (keyof ThaiAddress)[];

/** อ่านที่อยู่จาก FormData ตาม prefix เช่น "ship_" / "bill_" */
export function readAddress(fd: FormData, prefix: string): ThaiAddress {
  const out = { ...EMPTY_ADDRESS };
  for (const k of ADDRESS_FIELDS) out[k] = String(fd.get(prefix + k) ?? "").trim();
  return out;
}

/** เบอร์มือถือ/บ้านไทย 9–10 หลักขึ้นต้นด้วย 0 (ยอมให้พิมพ์ขีดหรือเว้นวรรคมาได้) */
export const normalizePhone = (s: string) => s.replace(/[\s-]/g, "");

/** คืนข้อความ error แรกที่เจอ หรือ null ถ้าครบ */
export function validateAddress(a: ThaiAddress, label: string): string | null {
  const need: [keyof ThaiAddress, string][] = [
    ["firstName", "ชื่อจริง"],
    ["lastName", "นามสกุล"],
    ["postalCode", "รหัสไปรษณีย์"],
    ["line1", "ที่อยู่"],
    ["subdistrict", "ตำบล/แขวง"],
    ["district", "อำเภอ/เขต"],
    ["province", "จังหวัด"],
    ["phone", "เบอร์โทรศัพท์"],
  ];
  for (const [k, name] of need) if (!a[k]) return `${label}: กรอก${name}`;
  if (!/^\d{5}$/.test(a.postalCode)) return `${label}: รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก`;
  if (!/^0\d{8,9}$/.test(normalizePhone(a.phone)))
    return `${label}: เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก`;
  if (!(THAI_PROVINCES as readonly string[]).includes(a.province))
    return `${label}: เลือกจังหวัดจากรายการ`;
  return null;
}

/**
 * รวมเป็นข้อความเดียวเก็บลง orders.shipping_address (คอลัมน์ text เดิม ไม่ต้องแก้ schema)
 * กรุงเทพฯ ใช้ แขวง/เขต จังหวัดอื่นใช้ ต./อ./จ.
 */
export function formatAddress(a: ThaiAddress): string {
  const bkk = a.province === "กรุงเทพมหานคร";
  const area = bkk
    ? `แขวง${a.subdistrict} เขต${a.district} ${a.province}`
    : `ต.${a.subdistrict} อ.${a.district} จ.${a.province}`;
  return [
    `${a.firstName} ${a.lastName} โทร ${normalizePhone(a.phone)}`,
    [a.line1, a.line2].filter(Boolean).join(" "),
    `${area} ${a.postalCode}`,
    a.country,
  ].join("\n");
}

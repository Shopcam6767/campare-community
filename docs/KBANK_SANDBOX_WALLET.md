# KBank PromptPay Sandbox Wallet

ระบบกระเป๋าเงินอยู่ที่ `/wallet` และใช้ migration `0015_wallet_kbank_sandbox.sql`.

## การติดตั้ง

1. รัน migration ใน Supabase SQL Editor หลัง migrations เดิม
2. สมัครและสร้าง Sandbox application ใน KBank Developer Portal จากนั้นเปิด QR Simulator ของ KBank
3. สร้างรายการเติมเงินในหน้า `/wallet` แล้วใช้ `Ref` ที่หน้าแสดงเพื่อทดสอบธุรกรรมใน simulator

## ข้อควรทราบ

- ฟังก์ชัน `confirm_kbank_sandbox_topup` มีไว้เฉพาะ demo sandbox เท่านั้น และต้องถูกแทนที่ด้วย endpoint webhook ที่ตรวจสอบลายเซ็นจาก KBank ก่อนขึ้น production
- ห้ามเติมยอดหรือแก้ยอดใน `wallet_accounts` จาก browser โดยตรง ทุกยอดต้องเกิดจาก ledger/RPC ที่ตรวจสอบสิทธิ์
- เมื่อได้รับเอกสาร API และ sandbox credentials ของ KBank แล้ว ให้บันทึก response QR จริงใน `wallet_topups.qr_payload` และให้ webhook เปลี่ยนสถานะรายการเป็น `paid`.

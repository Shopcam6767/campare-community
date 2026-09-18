-- =====================================================================
-- Shopcam — อัปเดตรูปสินค้าจริงสำหรับ 14 รุ่นหลักในระบบ (seed products)
-- แทนที่ placehold.co ด้วยรูปภาพจริงที่เสิร์ฟจาก public/images/products/
-- รันซ้ำได้ (idempotent)
-- =====================================================================

update products set thumbnail_url = '/images/products/sony-a7c-ii.jpg' where slug = 'sony-a7c-ii';
update products set thumbnail_url = '/images/products/sony-a6700.jpg' where slug = 'sony-a6700';
update products set thumbnail_url = '/images/products/canon-eos-r6-ii.jpg' where slug = 'canon-eos-r6-ii';
update products set thumbnail_url = '/images/products/canon-eos-r50.jpg' where slug = 'canon-eos-r50';
update products set thumbnail_url = '/images/products/nikon-z6-iii.jpg' where slug = 'nikon-z6-iii';
update products set thumbnail_url = '/images/products/fujifilm-x-t5.jpg' where slug = 'fujifilm-x-t5';
update products set thumbnail_url = '/images/products/fujifilm-x100vi.jpg' where slug = 'fujifilm-x100vi';
update products set thumbnail_url = '/images/products/olympus-om-1.jpg' where slug = 'olympus-om-1';
update products set thumbnail_url = '/images/products/panasonic-g100.jpg' where slug = 'panasonic-g100';
update products set thumbnail_url = '/images/products/sony-fe-50mm-f18.jpg' where slug = 'sony-fe-50mm-f18';
update products set thumbnail_url = '/images/products/sigma-18-50-f28.jpg' where slug = 'sigma-18-50-f28';
update products set thumbnail_url = '/images/products/canon-rf-50mm-f18.jpg' where slug = 'canon-rf-50mm-f18';
update products set thumbnail_url = '/images/products/manfrotto-befree-3.jpg' where slug = 'manfrotto-befree-3';
update products set thumbnail_url = '/images/products/peak-design-slide.jpg' where slug = 'peak-design-slide';

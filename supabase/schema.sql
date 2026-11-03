-- =====================================================================
-- SHAQUEEN - SUPABASE POSTGRESQL SCHEMA & INITIAL SEED
-- Sistem Operasional & Retensi Pelanggan Shaqueen Food (B2C & B2B)
-- =====================================================================

-- 1. MASTER PRODUK
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Cuanki', 'Keripik', 'Pilus', 'Paket Bundle'
    b2c_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    b2b_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif', -- 'aktif', 'habis'
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PELANGGAN RETAIL (B2C LINTAS PLATFORM)
CREATE TABLE IF NOT EXISTS retail_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'WhatsApp', -- 'WhatsApp', 'Shopee', 'TikTok'
    city VARCHAR(100),
    address TEXT,
    notes TEXT,
    total_orders INT DEFAULT 0,
    total_spent NUMERIC(14, 2) DEFAULT 0,
    last_order_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSAKSI RETAIL (B2C ORDERS & KANBAN PIPELINE)
CREATE TABLE IF NOT EXISTS b2c_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES retail_customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    platform VARCHAR(50) NOT NULL DEFAULT 'WhatsApp',
    status VARCHAR(30) NOT NULL DEFAULT 'diproses', -- 'diproses', 'dikirim', 'selesai', 'dibatalkan'
    pipeline_stage VARCHAR(30) NOT NULL DEFAULT 'diproses', -- 'diproses', 'dikirim', 'h_plus_2', 'h_plus_30'
    tracking_number VARCHAR(100),
    notes TEXT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MITRA RESELLER B2B (BELI PUTUS / CASH & CARRY)
CREATE TABLE IF NOT EXISTS b2b_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    coordinates_lat NUMERIC(10, 7),
    coordinates_lng NUMERIC(10, 7),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'aktif', -- 'aktif', 'nonaktif'
    notes TEXT,
    total_purchased_cartons INT DEFAULT 0,
    total_settled_amount NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RIWAYAT TRANSAKSI GROSIR B2B (CASH & CARRY LUNAS)
CREATE TABLE IF NOT EXISTS b2b_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES b2b_partners(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity_sold INT NOT NULL DEFAULT 0, -- Satuan Karton/Dus
    quantity_sold_pcs INT NOT NULL DEFAULT 0,
    b2b_unit VARCHAR(50) DEFAULT 'Karton',
    b2b_conversion INT DEFAULT 12,
    b2b_unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_collected_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'lunas', -- 'lunas', 'pending', 'transfer'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TEMPLATE PESAN WHATSAPP OTOMATIS
CREATE TABLE IF NOT EXISTS wa_templates (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'h_plus_2', 'h_plus_30', 'custom'
    template_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOG TRIGGER WHATSAPP
CREATE TABLE IF NOT EXISTS wa_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    order_id UUID REFERENCES b2c_orders(id) ON DELETE SET NULL,
    stage VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    gateway_status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PENGATURAN UMUM SHAQUEEN
CREATE TABLE IF NOT EXISTS crm_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'shaqueen_settings',
    brand_name VARCHAR(100) NOT NULL DEFAULT 'Shaqueen Food',
    brand_tagline VARCHAR(255) NOT NULL DEFAULT 'Sistem Operasional & Retensi Pelanggan Shaqueen Food',
    brand_logo_url TEXT,
    wa_gateway_mode VARCHAR(50) DEFAULT 'simulation', -- 'direct_wa_me', 'simulation', 'third_party_api'
    auto_trigger_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH QUERY SPEED
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_b2c_orders_customer ON b2c_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_b2c_orders_stage ON b2c_orders(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_b2b_settlements_partner ON b2b_settlements(partner_id);

-- SEED DATA: MASTER PRODUK INTI SHAQUEEN FOOD
INSERT INTO products (sku, name, category, b2c_price, b2b_price, stock, status, description, image_url)
VALUES 
('SQ-CK-01', 'Cuanki Instan Super Pedas (Kemasan Pouch)', 'Cuanki', 18000, 13000, 145, 'aktif', 'Cuanki instan kuah gurih pedas khas Bandung dengan topping siomay kering, lidah tahu, bumbu rempah autentik.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60'),
('SQ-CK-02', 'Cuanki Ori Gurih Kaldu Sapi', 'Cuanki', 18000, 13000, 120, 'aktif', 'Varian original kuah kaldu sapi alami tanpa pedas berlebih, disukai anak-anak dan keluarga.', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60'),
('SQ-MR-01', 'Keripik Moringa Spicy Cheese 100g', 'Keripik', 15000, 11000, 85, 'aktif', 'Keripik daun kelor moringa berbalut bumbu keju pedas renyah, kaya antioksidan dan tanpa bahan pengawet.', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60'),
('SQ-MR-02', 'Keripik Moringa Balado Manis 100g', 'Keripik', 15000, 11000, 92, 'aktif', 'Keripik moringa balado khas dengan rasa manis pedas karamel yang gurih renyah.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60'),
('SQ-PL-01', 'Pilus Renyah Rasa Kencur Cikur 250g', 'Pilus', 12000, 8500, 210, 'aktif', 'Pilus gurih renyah aroma rempah kencur khas priangan, sangat cocok untuk teman makan kuah dan santai.', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60'),
('SQ-BD-01', 'Paket Bundling Cuanki Mantap + Keripik Moringa', 'Paket Bundle', 30000, 23000, 50, 'aktif', 'Paket combo hemat berisi 1x Cuanki Instan dan 1x Keripik Moringa 100g.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60')
ON CONFLICT (sku) DO NOTHING;

-- SEED TEMPLATE PESAN WHATSAPP
INSERT INTO wa_templates (id, title, type, template_text, is_active)
VALUES
('tpl_h2', 'Follow-up H+2: Ulasan Rasa & Kepuasan', 'h_plus_2', 
 'Halo Kak {nama}! 👋 Terima kasih sudah berbelanja di Shaqueen Food. Pesanan {produk} kemarin sudah sampai dengan selamat ya? Semoga sensasi gurih dan renyahnya bikin nagih! Kami sangat menghargai ulasan dan penilaian Kakak untuk terus menyajikan cemilan terbaik. Ada kritik atau saran untuk kami? 🙏✨', TRUE),
('tpl_h30', 'Follow-up H+30: Promo Restock & Repeat Order', 'h_plus_30',
 'Halo Kak {nama}! 👋 Wah, sudah sekitar sebulan nih sejak pesanan {produk} kemarin. Stok cemilannya di rumah masih aman atau sudah mulai kangen gurihnya Cuanki & Keripik Moringa Shaqueen? Kebetulan hari ini kami ada promo free ongkir / bonus Pilus Cikur khusus pelanggan setia. Kakak mau kami kirim varian apa hari ini? 😊🛒', TRUE)
ON CONFLICT (id) DO UPDATE SET template_text = EXCLUDED.template_text;

-- SEED PENGATURAN UMUM SHAQUEEN
INSERT INTO crm_settings (id, brand_name, brand_tagline, wa_gateway_mode, auto_trigger_enabled)
VALUES ('shaqueen_settings', 'Shaqueen Food', 'Sistem Operasional & Retensi Pelanggan Shaqueen Food', 'simulation', TRUE)
ON CONFLICT (id) DO NOTHING;

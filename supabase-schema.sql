-- ========================================================================
-- SUPABASE DATABASE SCHEMA: GAME "HÀNH TRÌNH CỦA GẤU"
-- Dành cho Sự kiện / Workshop ngắn hạn (Không cần đăng nhập Auth)
-- ========================================================================

-- ========================================================================
-- PHẦN 1: BẢNG XẾP HẠNG NGƯỜI CHƠI (LEADERBOARD)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.bear_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,             -- Định danh phiên tạm thời trên máy người chơi
    player_name TEXT NOT NULL,                   -- Tên người chơi nhập vào
    bear_type TEXT NOT NULL DEFAULT 'sunbear',   -- Loài gấu: 'sunbear' | 'blackbear'
    score INTEGER NOT NULL DEFAULT 0,            -- Điểm tích lũy (bao gồm thưởng tốc độ)
    completed_levels_count INTEGER DEFAULT 0,    -- Số trạm đã giải mã thành công (tối đa 8)
    updated_at TIMESTAMPTZ DEFAULT NOW()         -- Thời gian cập nhật điểm gần nhất
);

CREATE INDEX IF NOT EXISTS idx_bear_leaderboard_rank 
ON public.bear_leaderboard (score DESC, updated_at ASC);

ALTER TABLE public.bear_leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Leaderboard Read" ON public.bear_leaderboard;
CREATE POLICY "Public Leaderboard Read" 
ON public.bear_leaderboard FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Public Leaderboard Insert" ON public.bear_leaderboard;
CREATE POLICY "Public Leaderboard Insert" 
ON public.bear_leaderboard FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public Leaderboard Update" ON public.bear_leaderboard;
CREATE POLICY "Public Leaderboard Update" 
ON public.bear_leaderboard FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);


-- ========================================================================
-- PHẦN 2: BẢNG LƯU TOÀN BỘ CÂU HỎI & NỘI DUNG TRẠM (THAY THẾ FILE JSON)
-- Cho phép thêm, sửa câu hỏi, đáp án, kiến thức trực tiếp từ Supabase Table Editor
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.bear_levels (
    id SERIAL PRIMARY KEY,
    station_order INTEGER NOT NULL UNIQUE,       -- Thứ tự chặng (1 -> 8)
    station_title TEXT NOT NULL,                 -- Tên trạm hiển thị (ví dụ: 'Tổ Ong Rừng')
    station_subtitle TEXT,                       -- Phụ đề ngắn mô tả
    theme_icon TEXT DEFAULT '🍯',                -- Biểu tượng trạm
    badge TEXT DEFAULT 'Chặng',                  -- Nhãn huy hiệu ('Chặng 1', 'Đích Đến')
    question TEXT NOT NULL,                      -- Câu hỏi ô chữ
    answer TEXT NOT NULL,                        -- Đáp án không dấu (ví dụ: 'GAUCHO')
    display_answer TEXT NOT NULL,                -- Đáp án hiển thị có dấu (ví dụ: 'Gấu chó')
    hint TEXT NOT NULL,                          -- Gợi ý
    fact TEXT NOT NULL,                          -- Kiến thức giáo dục bảo tồn mở khóa
    source TEXT NOT NULL,                        -- Nguồn trích dẫn (IUCN, WWF...)
    distractors TEXT[] DEFAULT '{}',             -- Mảng từ gây nhiễu ô chữ
    is_active BOOLEAN DEFAULT TRUE,              -- Bật / tắt trạm này
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS) cho bảng bear_levels
ALTER TABLE public.bear_levels ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai nội dung trạm
DROP POLICY IF EXISTS "Public Read Levels" ON public.bear_levels;
CREATE POLICY "Public Read Levels" 
ON public.bear_levels FOR SELECT 
TO anon, authenticated 
USING (true);

-- Chèn sẵn dữ liệu 8 trạm bảo tồn ban đầu vào Supabase
INSERT INTO public.bear_levels 
(station_order, station_title, station_subtitle, theme_icon, badge, question, answer, display_answer, hint, fact, source, distractors)
VALUES
(
  1,
  'Tổ Ong Rừng',
  'Khám phá loài Gấu Chó nhỏ nhất thế giới',
  '🍯',
  'Chặng 1',
  'Loài gấu nhỏ nhất thế giới, sống ở rừng nhiệt đới Đông Nam Á, có chiếc lưỡi dài để lấy mật ong?',
  'GAUCHO',
  'Gấu chó',
  'Tên loài có 6 chữ cái, bắt đầu bằng G',
  'Gấu chó (Sun Bear) là loài gấu nhỏ nhất thế giới, nặng chỉ 25–65 kg. Chúng có lưỡi dài đến 25 cm để lấy mật ong và côn trùng trong các khe cây. Hiện là loài dễ bị tổn thương (Vulnerable) theo IUCN.',
  'IUCN Red List – Helarctos malayanus',
  ARRAY['GAMRUNG', 'GAUBAC', 'RUNG']
),
(
  2,
  'Rừng Khộp Núi Cao',
  'Gấu Ngựa dũng mãnh và biệt tài leo cây',
  '🌲',
  'Chặng 2',
  'Loài gấu đen châu Á, có mảng lông trắng hình chữ V hoặc chữ U đặc trưng trên ngực?',
  'GAUNGUA',
  'Gấu ngựa',
  'Tên loài có 7 chữ cái, thường thấy ở vùng núi Việt Nam',
  'Gấu ngựa (Asiatic Black Bear) có thể leo cây rất giỏi. Ở Việt Nam, chúng từng phổ biến ở nhiều vùng rừng núi, nhưng hiện đang bị đe dọa nghiêm trọng do săn bắt trái phép và khai thác mật gấu.',
  'WWF – Ursus thibetanus',
  ARRAY['DENRUNG', 'MATKONG', 'CHAU']
),
(
  3,
  'Suối Nước Tự Do',
  'Nói không với nuôi nhốt hút mật tàn nhẫn',
  '🔓',
  'Chặng 3',
  'Thứ gì được lấy từ gấu nuôi nhốt, gây đau đớn tột cùng và bị cấm theo pháp luật Việt Nam?',
  'MAT',
  'Mật',
  '3 chữ cái, là chất lỏng vàng quý giá',
  'Nuôi nhốt gấu lấy mật là hành vi bị cấm hoàn toàn tại Việt Nam theo Nghị định 06/2019/NĐ-CP. Việc chích hút mật gây đau đớn kinh khủng và nhiễm trùng mãn tính cho gấu. Tổ chức Animals Asia đang giải cứu hàng trăm cá thể gấu tại Việt Nam.',
  'Animals Asia Foundation – Việt Nam',
  ARRAY['NUOI', 'LONG', 'CAM']
),
(
  4,
  'Đồi Mầm Tái Sinh',
  'Bảo vệ mái nhà rừng xanh trước nạn chặt phá',
  '🌱',
  'Chặng 4',
  'Nguyên nhân hàng đầu khiến gấu mất nơi sinh sống ở Việt Nam là gì?',
  'PHARUNG',
  'Phá rừng',
  '7 chữ cái, hành vi tàn phá cây xanh và môi trường sống của gấu',
  'Việt Nam đã mất hơn 50% diện tích rừng tự nhiên trong nửa thế kỷ qua. Mất rừng đồng nghĩa với mất sinh cảnh của gấu và hàng nghìn loài khác. Trồng lại rừng và bảo vệ rừng nguyên sinh là chìa khóa bảo tồn.',
  'WWF Việt Nam – Báo cáo hiện trạng rừng 2023',
  ARRAY['BUON', 'BAN', 'THIEU']
),
(
  5,
  'Trạm Kiểm Lâm Rừng',
  'Gọi ngay đường dây nóng 1800 599 954',
  '📢',
  'Chặng 5',
  'Hành động đúng đắn khi bạn phát hiện hành vi buôn bán hoặc nuôi nhốt gấu trái phép?',
  'BAOCAO',
  'Báo cáo',
  '6 chữ cái, bắt đầu bằng B',
  'Khi phát hiện buôn bán động vật hoang dã, hãy gọi đường dây nóng: Kiểm lâm – 1800 599 954 (miễn phí). Bạn cũng có thể báo qua ứng dụng iNaturalist hoặc liên hệ ENV (Education for Nature Vietnam).',
  'ENV – Education for Nature Vietnam',
  ARRAY['TRON', 'LANG', 'IM']
),
(
  6,
  'Đảo Sách Đỏ',
  'Liên minh bảo tồn thiên nhiên quốc tế IUCN',
  '📜',
  'Chặng 6',
  'Tổ chức quốc tế nổi tiếng đánh giá mức độ nguy cấp của các loài động vật trên toàn thế giới?',
  'IUCN',
  'IUCN',
  '4 chữ cái viết tắt tiếng Anh',
  'IUCN (Liên minh Bảo tồn Thiên nhiên Quốc tế) duy trì Danh sách Đỏ – cơ sở dữ liệu toàn diện nhất về tình trạng bảo tồn sinh vật. Cả gấu chó và gấu ngựa đều nằm trong Danh sách Đỏ IUCN với mức độ ''Dễ bị tổn thương''.',
  'iucnredlist.org',
  ARRAY['WWF', 'CITES', 'ENV']
),
(
  7,
  'Thành Trì CITES',
  'Công ước ngăn chặn buôn bán xuyên quốc gia',
  '🛡️',
  'Chặng 7',
  'Công ước quốc tế kiểm soát buôn bán động, thực vật hoang dã nguy cấp xuyên biên giới?',
  'CITES',
  'CITES',
  '5 chữ cái viết tắt, liên quan đến thương mại quốc tế',
  'CITES (Công ước về Buôn bán Quốc tế các loài động, thực vật hoang dã nguy cấp) được 184 quốc gia ký kết. Cả hai loài gấu ở Việt Nam đều được bảo vệ theo CITES Phụ lục I – cấm buôn bán thương mại.',
  'cites.org',
  ARRAY['UNEP', 'UNESCO', 'UNODC']
),
(
  8,
  'Khu Cứu Hộ Gấu',
  'Mái nhà bình yên & tự do cho các bạn gấu',
  '🏆',
  'Đích Đến',
  'Hành vi nào sau đây giúp bảo vệ gấu trực tiếp nhất: không mua sản phẩm từ động vật hoang dã?',
  'TUCHOI',
  'Từ chối',
  '6 chữ cái, là hành động không chấp nhận điều gì đó',
  'Mỗi người tiêu dùng có sức mạnh thay đổi thị trường. Khi bạn từ chối mua mật gấu, cao hổ, sừng tê giác... bạn đang trực tiếp giảm nhu cầu và cứu động vật hoang dã. Hãy chia sẻ thông điệp này!',
  'Four Paws International',
  ARRAY['MUALAI', 'THICUNG', 'BUON']
)
ON CONFLICT (station_order) DO UPDATE SET
  station_title = EXCLUDED.station_title,
  station_subtitle = EXCLUDED.station_subtitle,
  theme_icon = EXCLUDED.theme_icon,
  badge = EXCLUDED.badge,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_answer = EXCLUDED.display_answer,
  hint = EXCLUDED.hint,
  fact = EXCLUDED.fact,
  source = EXCLUDED.source,
  distractors = EXCLUDED.distractors;

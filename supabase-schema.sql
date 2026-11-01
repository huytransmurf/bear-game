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
    completed_levels_count INTEGER DEFAULT 0,    -- Số trạm đã giải mã thành công (tối đa 13)
    is_deleted BOOLEAN DEFAULT FALSE,            -- Đánh dấu xóa mềm (soft delete)
    updated_at TIMESTAMPTZ DEFAULT NOW()         -- Thời gian cập nhật điểm gần nhất
);

-- Đảm bảo cột is_deleted tồn tại nếu bảng đã được tạo trước đó
ALTER TABLE public.bear_leaderboard ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

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
-- PHẦN 2: BẢNG LƯU TOÀN BỘ CÂU HỎI & NỘI DUNG TRẠM (13 CÂU HỎI / 13 TRẠM)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.bear_levels (
    id SERIAL PRIMARY KEY,
    station_order INTEGER NOT NULL UNIQUE,       -- Thứ tự chặng (1 -> 13)
    station_title TEXT NOT NULL,                 -- Tên trạm hiển thị (ví dụ: 'Tên Gọi Gấu Chó')
    station_subtitle TEXT,                       -- Phụ đề ngắn mô tả
    theme_icon TEXT DEFAULT '🐾',                -- Biểu tượng trạm
    badge TEXT DEFAULT 'Chặng',                  -- Nhãn huy hiệu ('Chặng 1', 'Đích Đến')
    question TEXT NOT NULL,                      -- Câu hỏi ô chữ
    answer TEXT NOT NULL,                        -- Đáp án không dấu (ví dụ: 'SUNBEAR')
    display_answer TEXT NOT NULL,                -- Đáp án hiển thị có dấu (ví dụ: 'Sun Bear')
    hint TEXT NOT NULL,                          -- Gợi ý
    fact TEXT NOT NULL,                          -- Kiến thức giáo dục bảo tồn mở khóa
    source TEXT NOT NULL,                        -- Nguồn trích dẫn
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

-- Chèn hoặc cập nhật toàn bộ 13 câu hỏi theo đúng nội dung mới nhất
INSERT INTO public.bear_levels 
(station_order, station_title, station_subtitle, theme_icon, badge, question, answer, display_answer, hint, fact, source, distractors, is_active)
VALUES
(
  1,
  'Tên Gọi Gấu Chó',
  'Loài gấu nhỏ bé của rừng nhiệt đới',
  '☀️',
  'Chặng 1',
  'Gấu chó còn có tên gọi tiếng Anh là gì?',
  'SUNBEAR',
  'Sun Bear',
  '7 chữ cái tiếng Anh, liên quan đến mặt trời',
  'Gấu chó (Helarctos malayanus) là loài gấu nhỏ nhất thế giới. Vệt lông hình móng ngựa màu cam vàng trên ngực gợi nhớ đến mặt trời mọc nên được gọi là Sun Bear.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['MOON', 'BROWN', 'POLAR'],
  true
),
(
  2,
  'Gấu Ngựa Hùng Vĩ',
  'Loài gấu mang tên loài vật dũng mãnh',
  '🌙',
  'Chặng 2',
  'Asiatic Black Bear là tên tiếng Anh của loài Gấu nào?',
  'GAUNGUA',
  'Gấu ngựa',
  'Loài gấu có vệt lông chữ V màu trắng trên ngực',
  'Gấu ngựa (Ursus thibetanus), còn gọi là Asiatic Black Bear hoặc Moon Bear, nổi bật với đôi tai tròn và mảng lông hình chữ V trắng ngà trước ngực.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['CHO', 'TRUC', 'XAM'],
  true
),
(
  3,
  'Sở Thích Của Gấu',
  'Món ngọt khoái khẩu tự nhiên',
  '🍯',
  'Chặng 3',
  'Món ăn nào gấu chó đặc biệt yêu thích: mật ong hay cỏ khô?',
  'MATONG',
  'Mật ong',
  'Món ngọt do ong rừng tạo ra',
  'Gấu chó rất thích đồ ngọt tự nhiên, đặc biệt là mật ong và ấu trùng ong. Chiếc lưỡi dài tới 25cm giúp chúng luồn sâu vào tổ ong và hốc cây.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['COKHO', 'LACHAY', 'RONG'],
  true
),
(
  4,
  'Dấu Ấn Trên Ngực',
  'Đặc điểm nhận dạng của Gấu Ngựa',
  '⭐',
  'Chặng 4',
  'Vệt lông sáng trên ngực gấu ngựa thường có hình gì?',
  'HINHCHUV',
  'Hình chữ V',
  'Chữ cái thứ 22 trong bảng chữ cái tiếng Anh',
  'Vệt lông sáng hình chữ V hoặc trăng khuyết trên ngực là đặc điểm nhận dạng rõ nét nhất của loài gấu ngựa trong tự nhiên.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['TRON', 'VUONG', 'THOI'],
  true
),
(
  5,
  'Đôi Chân Đào Bới',
  'Vũ khí tự nhiên tìm kiếm thức ăn',
  '🐾',
  'Chặng 5',
  'Gấu thường dùng bộ phận nào để đào bới đất tìm kiếm thức ăn?',
  'MONGVUOT',
  'Móng vuốt',
  'Nằm ở đầu các ngón chân, rất sắc và cong khỏe',
  'Gấu sở hữu bộ móng vuốt dài, cong và rất khỏe, giúp chúng dễ dàng đào bới nền đất, xé toạc các thân cây mục để bắt mối, kiến và tìm rễ củ giàu dinh dưỡng.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['HAMRANG', 'DUOI', 'TAI'],
  true
),
(
  6,
  'Mái Nhà Tự Nhiên',
  'Môi trường sống tự nhiên của gấu',
  '🌲',
  'Chặng 6',
  'Gấu trong tự nhiên thường sinh sống ở môi trường nào?',
  'RUNG',
  'Rừng',
  'Nơi có nhiều cây cối rậm rạp tự nhiên',
  'Gấu là loài động vật hoang dã thuộc về rừng già nhiệt đới và cận nhiệt đới. Chỉ có rừng tự nhiên mới cung cấp đủ thức ăn, không gian leo trèo và điều kiện để gấu sống hạnh phúc.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['BIEN', 'SAHO', 'NHA'],
  true
),
(
  7,
  'Giải Pháp Thay Thế',
  'Lựa chọn y học xanh bảo vệ gấu',
  '🌿',
  'Chặng 7',
  'Giải pháp thay thế có nguồn gốc tự nhiên nào giúp hạn chế việc sử dụng mật gấu?',
  'THAODUOC',
  'Thảo dược',
  'Các loại cây thuốc đông y thảo mộc tự nhiên',
  'Hội Đông y Việt Nam và các chuyên gia đã công bố nhiều bài thuốc từ thảo dược tự nhiên lành tính, có tác dụng điều trị tương đương và an toàn hơn hẳn mật gấu, giúp bảo vệ loài gấu khỏi bị nuôi nhốt.',
  'Hội Đông y Việt Nam',
  ARRAY['HOA', 'KHOANG', 'THUOC'],
  true
),
(
  8,
  'Mái Nhà Bạch Mã',
  'Trung tâm Cứu hộ Gấu Việt Nam',
  '🏞️',
  'Chặng 8',
  'Trung tâm Cứu hộ Gấu trong chiến dịch Chuyện Nhà Gấu nằm tại vườn quốc gia nào?',
  'BACHMA',
  'Bạch Mã',
  'Vườn quốc gia nổi tiếng tại Thừa Thiên Huế',
  'Trung tâm Cứu hộ Gấu tại Vườn quốc gia Bạch Mã (Thừa Thiên Huế) là mái nhà thiên đường bán tự nhiên giúp các cá thể gấu từng bị nuôi nhốt lấy lại bản năng hoang dã.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['CUC', 'BAVI', 'CATTIEN'],
  true
),
(
  9,
  'Chăm Sóc & Phúc Lạc',
  'Kích thích tập tính tự nhiên cho gấu',
  '💡',
  'Chặng 9',
  'Hoạt động kích thích gấu thể hiện các tập tính tự nhiên, giúp cải thiện sức khỏe thể chất và tinh thần được gọi là gì?',
  'LAMGIAU',
  'Làm giàu',
  'Từ có 2 tiếng, bắt đầu bằng "Làm..." (Làm giàu môi trường)',
  'Làm giàu môi trường (Environmental Enrichment) là chuỗi hoạt động kích thích gấu vận động, tò mò và bộc lộ các tập tính tự nhiên lành mạnh thay vì các hành vi rập khuôn.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['NUOI', 'DAY', 'KHAM'],
  true
),
(
  10,
  'Thử Thách Tầm Cao',
  'Kích thích vận động độ cao của gấu',
  '🧗',
  'Chặng 10',
  'Treo thức ăn lên cao giúp kích thích khả năng gì của gấu?',
  'LEOTREO',
  'Leo trèo',
  'Hành động trèo lên cành cây cao',
  'Treo thức ăn lên các cấu trúc cao hoặc cành cây giúp gấu phải đứng vươn người, sử dụng cơ bắp và móng vuốt để leo trèo, cải thiện độ dẻo dai của xương khớp.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['BOI', 'CHAY', 'NHAY'],
  true
),
(
  11,
  'Thử Thách Khúc Gỗ',
  'Rèn luyện tính tò mò và khéo léo',
  '🪵',
  'Chặng 11',
  'Giấu thức ăn trong các khúc gỗ có lỗ giúp gấu làm gì?',
  'TIMDOAN',
  'Tìm đồ ăn',
  'Hành động khám phá và lấy thức ăn ra ngoài',
  'Giấu thức ăn vào các khúc gỗ đục lỗ hoặc đồ chơi làm giàu giúp kích thích khứu giác, sự kiên nhẫn và kỹ năng dùng lưỡi, móng vuốt để giải quyết vấn đề.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['NGUDAY', 'CHOI', 'CAN'],
  true
),
(
  12,
  'Bản Năng Rải Mồi',
  'Mô phỏng hành trình kiếm ăn hoang dã',
  '🍂',
  'Chặng 12',
  'Rải thức ăn ở nhiều vị trí giúp gấu thực hiện hành vi gì?',
  'KIEMAN',
  'Kiếm ăn',
  'Hành vi tự đi tìm kiếm thức ăn khắp nơi',
  'Trong tự nhiên gấu dành phần lớn thời gian đi dạo kiếm ăn (foraging). Rải rác thức ăn ở nhiều điểm buộc gấu phải di chuyển, hít ngửi và tìm kiếm như ngoài đời thực.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['TRON', 'DANH', 'NHAU'],
  true
),
(
  13,
  'Bữa Ăn Khoa Học',
  'Cơ sở xây dựng thực đơn cho gấu',
  '🥗',
  'Đích Đến',
  'Khẩu phần ăn của gấu cần được xây dựng dựa trên yếu tố nào?',
  'DINHDUONG',
  'Dinh dưỡng',
  'Yếu tố vi chất, calo và chất lượng thức ăn',
  'Khẩu phần ăn của gấu được tính toán khoa học dựa trên nhu cầu dinh dưỡng, cân nặng và mùa trong năm (rau xanh, củ quả, hạt, trứng...) nhằm đảm bảo thể chất tối ưu nhất.',
  'Chiến dịch Chuyện Nhà Gấu',
  ARRAY['SOVI', 'MAUSAC', 'GIA'],
  true
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
  distractors = EXCLUDED.distractors,
  is_active = EXCLUDED.is_active;

const fs = require('fs');

const spiderumArticles = [
  {
    "id": "s1",
    "title": "Sự Cô Đơn Của Những Lập Trình Viên Hướng Nội",
    "date": "April 26, 2026",
    "readTime": "6 min read",
    "excerpt": "Trong một thế giới đề cao sự kết nối và những cuộc họp không dứt, những lập trình viên hướng nội tìm thấy sự bình yên ở đâu?",
    "content": "<h3>Sự ám ảnh của những cuộc họp</h3><p>Mỗi buổi sáng thứ Hai, màn hình Google Meet lại hiện lên với hàng tá khuôn mặt. Là một lập trình viên hướng nội, tôi cảm thấy năng lượng của mình bị rút cạn ngay cả trước khi viết dòng code đầu tiên. Xã hội hiện đại dường như được thiết kế cho những người hướng ngoại, nơi sự hoạt ngôn được đánh giá cao hơn sự suy ngẫm sâu sắc.</p><p>Nhưng lập trình là một công việc đòi hỏi sự tập trung cao độ. Khi bạn đang cố gắng giữ toàn bộ cấu trúc của một hệ thống phức tạp trong đầu, một câu hỏi vu vơ từ đồng nghiệp cũng đủ làm sụp đổ tòa lâu đài tư duy đó.</p><h3>Tìm kiếm 'The Zone'</h3><p>Đó là lý do vì sao nhiều người trong chúng ta thích làm việc vào ban đêm. Không có email, không có tin nhắn Slack. Chỉ có ánh sáng từ màn hình IDE và một bản nhạc lofi lặp lại vô tận. Trong khoảnh khắc đó, chúng ta không còn cô đơn. Chúng ta giao tiếp với máy móc bằng một ngôn ngữ chính xác và logic, không có sự hiểu lầm hay những cuộc hội thoại vô nghĩa.</p><p>Sự cô đơn của lập trình viên không phải là sự xa lánh xã hội, mà là một nhu cầu thiết yếu để sáng tạo. Đó là không gian thiêng liêng nơi những thuật toán được sinh ra.</p>",
    "tags": ["Lập trình", "Đời sống", "Tâm lý học"],
    "link": "#"
  },
  {
    "id": "s2",
    "title": "Trí Tuệ Nhân Tạo Có Thể Thay Thế Sự Suy Ngẫm Của Con Người?",
    "date": "April 25, 2026",
    "readTime": "8 min read",
    "excerpt": "AI có thể viết code, vẽ tranh, sáng tác nhạc. Nhưng nó có thể thay thế được những đêm trằn trọc suy nghĩ về ý nghĩa cuộc đời?",
    "content": "<h3>Khi máy móc bắt đầu sáng tạo</h3><p>Sự trỗi dậy của các mô hình ngôn ngữ lớn (LLM) đã xóa nhòa ranh giới giữa sáng tạo của con người và máy móc. Một đoạn văn do AI viết ra đôi khi còn mạch lạc và sắc sảo hơn cả một tác giả nghiệp dư. Nhưng điều gì ẩn sau những con chữ hoàn hảo đó?</p><h3>Sự vắng bóng của nỗi đau</h3><p>Văn chương của con người luôn mang theo tàn dư của nỗi đau, sự hối tiếc và những trải nghiệm cá nhân không thể sao chép. Một cỗ máy không bao giờ biết cảm giác mất đi người mình yêu thương, chưa từng nếm trải sự thất bại cay đắng, cũng không có khái niệm về cái chết.</p><p>Vì vậy, dù AI có thể tổng hợp hàng tỷ văn bản để tạo ra một câu trả lời logic, nó không bao giờ thực sự 'hiểu' những gì nó đang nói. Sự suy ngẫm của con người là một quá trình đau đớn, đầy mâu thuẫn và không hoàn hảo. Nhưng chính sự không hoàn hảo đó mới là thứ tạo nên những tác phẩm nghệ thuật rung động lòng người. AI có thể viết ra một bài thơ chuẩn niêm luật, nhưng chỉ con người mới có thể đưa linh hồn vào đó.</p>",
    "tags": ["AI", "Triết học", "Công nghệ"],
    "link": "#"
  },
  {
    "id": "s3",
    "title": "Nghệ Thuật Của Việc Không Làm Gì Cả",
    "date": "April 24, 2026",
    "readTime": "5 min read",
    "excerpt": "Giữa văn hóa 'Hustle' (luôn bận rộn), việc cho phép bản thân nghỉ ngơi đôi khi lại là hành động phản kháng mạnh mẽ nhất.",
    "content": "<h3>Văn hóa tôn vinh sự kiệt sức</h3><p>Mở mạng xã hội lên, bạn sẽ thấy ngập tràn những bài viết về việc thức dậy lúc 5 giờ sáng, làm 3 công việc một lúc, và liên tục tối ưu hóa năng suất. Chúng ta bị ám ảnh bởi việc phải luôn 'hữu ích'. Nếu bạn đang ngồi im trên ghế sofa nhìn ra cửa sổ, xã hội sẽ phán xét bạn là một kẻ lười biếng.</p><h3>Sức mạnh của sự tĩnh lặng</h3><p>Người Ý có khái niệm 'Il dolce far niente' - vẻ đẹp của việc không làm gì cả. Khi não bộ không bị nhồi nhét thông tin mới, nó mới có cơ hội xử lý những thông tin cũ và kết nối các ý tưởng lại với nhau. Những ý tưởng đột phá nhất thường đến khi chúng ta đang tắm, đang đi dạo, hoặc đang... không làm gì cả.</p><p>Hãy dừng lại. Tắt điện thoại. Nhắm mắt lại. Việc cho phép bản thân nghỉ ngơi không phải là sự phí phạm thời gian, mà là cách chúng ta bảo dưỡng cỗ máy tư duy của chính mình. Sự tĩnh lặng là nơi mọi phép màu bắt đầu.</p>",
    "tags": ["Đời sống", "Tư duy tối giản"],
    "link": "#"
  },
  {
    "id": "s4",
    "title": "Tại Sao Chúng Ta Thích Nghe Nhạc Lofi?",
    "date": "April 23, 2026",
    "readTime": "7 min read",
    "excerpt": "Âm thanh xước xát của đĩa than, nhịp beat chậm rãi và vòng lặp vô tận. Tại sao thể loại âm nhạc 'không hoàn hảo' này lại quyến rũ đến vậy?",
    "content": "<h3>Sự quyến rũ của sự không hoàn hảo</h3><p>Trong thời đại mà âm thanh kỹ thuật số có thể đạt đến độ trong trẻo tuyệt đối, con người lại tìm về những âm thanh nhiễu (noise), tiếng lạo xạo của đĩa vinyl (crackles), và sự méo mó có chủ đích (distortion). Nhạc lofi (low fidelity) là sự tôn vinh những gì chưa hoàn thiện.</p><p>Nó giống như việc nhìn vào một bức ảnh chụp bằng máy phim cũ. Sự mờ ảo đó kích thích trí tưởng tượng của não bộ, buộc chúng ta phải tự điền vào những khoảng trống.</p><h3>Chiếc khiên chống lại sự hỗn loạn</h3><p>Nhịp beat của nhạc lofi thường dao động trong khoảng 70-90 BPM (nhịp tim của con người khi nghỉ ngơi). Nó không quá kích động để làm bạn phân tâm, cũng không quá buồn tẻ để khiến bạn buồn ngủ. Nó tạo ra một 'bức tường âm thanh' êm ái, cách ly bạn khỏi tiếng còi xe ồn ào và những suy nghĩ hỗn độn trong đầu. Nghe lofi không phải là để thưởng thức âm nhạc, mà là để thiết lập một trạng thái tinh thần: sự tập trung tĩnh lặng.</p>",
    "tags": ["Âm nhạc", "Tâm lý học", "Đời sống"],
    "link": "#"
  },
  {
    "id": "s5",
    "title": "Clean Code hay Shipping Nhanh? Cuộc Chiến Muôn Thuở",
    "date": "April 22, 2026",
    "readTime": "9 min read",
    "excerpt": "Bạn chọn viết code hoàn hảo nhưng trễ deadline, hay đẩy một mớ rác lên production để làm hài lòng sếp?",
    "content": "<h3>Mộng tưởng về sự hoàn hảo</h3><p>Khi mới vào nghề, ai cũng đọc cuốn 'Clean Code' của Uncle Bob và mơ ước về những dòng mã đẹp như thơ. Mọi biến đều được đặt tên rõ ràng, mọi hàm đều tuân thủ nguyên tắc SOLID. Nhưng thực tế thường tàn nhẫn hơn nhiều.</p><p>Khi business yêu cầu phải ra mắt tính năng vào thứ Sáu, những nguyên tắc bắt đầu bị bẻ cong. Bạn viết một cái hàm 500 dòng chứa đầy if-else chỉ để 'cho nó chạy được đã'. Bạn hứa với bản thân tuần sau sẽ refactor. Nhưng tuần sau không bao giờ đến.</p><h3>Sự thỏa hiệp kỹ thuật</h3><p>Lập trình viên giỏi không phải là người viết code hoàn hảo trong môi trường vô trùng. Kỹ sư giỏi là người biết cách quản lý 'nợ kỹ thuật' (technical debt). Bạn có thể viết code xấu hôm nay để kiếm tiền cho công ty ngày mai, miễn là bạn biết mình đang nợ gì và có kế hoạch trả nó. Code chỉ thực sự có giá trị khi nó tạo ra tác động trong thế giới thực.</p>",
    "tags": ["Lập trình", "Góc nhìn", "Công nghệ"],
    "link": "#"
  },
  {
    "id": "s6",
    "title": "Triết Lý Khắc Kỷ Trong Thế Giới Số",
    "date": "April 21, 2026",
    "readTime": "6 min read",
    "excerpt": "Làm thế nào để giữ được sự bình thản khi bị bao vây bởi drama mạng xã hội và những thông báo tin nhắn không ngừng nghỉ?",
    "content": "<h3>Chấp nhận những gì không thể kiểm soát</h3><p>Marcus Aurelius, hoàng đế La Mã và một nhà triết học Khắc kỷ (Stoicism), từng viết: 'Bạn có sức mạnh đối với tâm trí của mình, không phải đối với các sự kiện bên ngoài.' Lời khuyên này chưa bao giờ đúng đắn hơn trong kỷ nguyên số.</p><p>Bạn không thể kiểm soát việc người khác đăng những dòng trạng thái tiêu cực. Bạn không thể kiểm soát việc thuật toán cố tình chọc giận bạn để tăng tương tác. Nhưng bạn có thể kiểm soát nút 'Tắt thông báo'. Bạn có thể kiểm soát việc chọn nhấp vào hay bỏ qua.</p><h3>Thực hành sự dửng dưng</h3><p>Khắc kỷ không có nghĩa là vô cảm. Nó có nghĩa là bạn không để thế giới bên ngoài thao túng cảm xúc của mình. Khi bạn thấy một cuộc cãi vã trên mạng, thay vì lao vào gõ phím đầy giận dữ, hãy dừng lại một nhịp. Tự hỏi: Điều này có thực sự quan trọng trong 5 năm nữa không? Nếu không, hãy cứ lướt qua. Hãy để sự tĩnh lặng bảo vệ năng lượng tinh thần của bạn.</p>",
    "tags": ["Triết học", "Đời sống", "Suy ngẫm"],
    "link": "#"
  },
  {
    "id": "s7",
    "title": "Tương Lai Của Công Việc Khi AI Viết Code Thay Chúng Ta",
    "date": "April 20, 2026",
    "readTime": "11 min read",
    "excerpt": "Devin, GitHub Copilot, và ChatGPT đang làm thay đổi hoàn toàn cách chúng ta phát triển phần mềm. Liệu lập trình viên có bị mất việc?",
    "content": "<h3>Lời kết thúc cho những 'thợ gõ phím'</h3><p>Sẽ là ngây thơ nếu nói rằng AI không cướp đi công việc nào. Những lập trình viên chỉ quen làm theo mẫu (boilerplate), viết những API CRUD cơ bản, hay copy-paste code từ StackOverflow sẽ sớm bị đào thải. AI làm những việc đó nhanh hơn, rẻ hơn và không bao giờ than phiền về việc phải OT.</p><h3>Từ Coder trở thành System Thinker</h3><p>Tuy nhiên, AI hiện tại giống như một người thợ xây xuất sắc nhưng không có khả năng thiết kế một tòa nhà. Tương lai của lập trình không còn nằm ở việc gõ cú pháp (syntax). Nó nằm ở việc giải quyết vấn đề (problem solving) và tư duy hệ thống (system thinking).</p><p>Công việc của chúng ta sẽ chuyển từ việc 'nói cho máy tính biết phải làm thế nào' sang 'nói cho AI biết chúng ta muốn gì'. Khả năng giao tiếp rõ ràng, hiểu về business logic và kiến trúc tổng thể sẽ trở thành những kỹ năng sống còn. Mã nguồn sẽ tự động được sinh ra, nhưng kiến trúc thì cần một khối óc con người để định hướng.</p>",
    "tags": ["AI", "Lập trình", "Tương lai"],
    "link": "#"
  },
  {
    "id": "s8",
    "title": "Chủ Nghĩa Hoàn Hảo Là Kẻ Thù Của Hành Động",
    "date": "April 19, 2026",
    "readTime": "4 min read",
    "excerpt": "Việc chờ đợi thời điểm hoàn hảo, chờ đợi bản nháp hoàn hảo thường chỉ là một hình thức ngụy trang tinh vi của sự trì hoãn.",
    "content": "<h3>Sự tê liệt vì nỗi sợ sai</h3><p>Rất nhiều ý tưởng tuyệt vời đã bị giết chết trong trứng nước chỉ vì tác giả của chúng muốn mọi thứ phải 'hoàn hảo' trước khi công bố. Một bức tranh không bao giờ được trưng bày vì người vẽ thấy nét cọ hơi mờ. Một ứng dụng không bao giờ được launch vì lập trình viên nghĩ rằng UI chưa đủ mượt.</p><h3>Vẻ đẹp của sự dang dở</h3><p>Thực tế là, không có gì là hoàn hảo cả. Việc đẩy một sản phẩm lỗi lấp lánh (nhưng hoạt động được) ra ngoài thị trường tốt hơn ngàn lần so với một kiệt tác nằm mãi trong ổ cứng. Hãy cho phép bản thân được sai. Hãy cho phép bản thân làm ra những thứ tồi tệ trong lần đầu tiên. Bạn luôn có thể chỉnh sửa một trang giấy nháp, nhưng bạn không thể chỉnh sửa một trang giấy trắng.</p>",
    "tags": ["Đời sống", "Tâm lý học", "Năng suất"],
    "link": "#"
  },
  {
    "id": "s9",
    "title": "Bản Chất Của Deep Work Trong Một Thế Giới Bị Phân Tâm",
    "date": "April 18, 2026",
    "readTime": "8 min read",
    "excerpt": "Cal Newport định nghĩa Deep Work là khả năng tập trung không phân tâm vào một nhiệm vụ đòi hỏi nhận thức cao. Làm sao để rèn luyện nó?",
    "content": "<h3>Kẻ thù mang tên 'Attention'</h3><p>Sự chú ý (attention) là nguồn tài nguyên quý giá nhất trong thế kỷ 21. Các tập đoàn công nghệ lớn nhất thế giới đang chi hàng tỷ đô la để giành giật từng giây chú ý của bạn. Khi bạn đang cố giải một bài toán khó, một tiếng 'ting' từ điện thoại sẽ làm gián đoạn dòng tư duy. Để quay trở lại trạng thái tập trung sâu, não bộ cần ít nhất 20 phút.</p><h3>Xây dựng pháo đài tĩnh lặng</h3><p>Deep work không tự nhiên mà có. Bạn phải chiến đấu để giành lấy nó. Xóa các ứng dụng gây xao nhãng khỏi điện thoại. Đeo tai nghe chống ồn. Khóa cửa phòng. Tạo ra các nghi thức (rituals) trước khi bắt tay vào làm việc nghiêm túc.</p><p>Sự tĩnh lặng không phải là sự vắng mặt của tiếng ồn, mà là sự vắng mặt của sự xao nhãng. Những người có khả năng làm việc sâu (deep work) sẽ trở thành những cá nhân không thể thay thế trong một thế giới ngày càng trở nên hời hợt.</p>",
    "tags": ["Đời sống", "Deep Work", "Tư duy"],
    "link": "#"
  },
  {
    "id": "s10",
    "title": "Bóng Đêm Của Thuật Toán: Khi AI Quyết Định Chúng Ta Thấy Gì",
    "date": "April 17, 2026",
    "readTime": "9 min read",
    "excerpt": "Feed tin tức của bạn không phải là thế giới thực. Nó là một chiếc gương cong được thiết kế riêng bởi thuật toán để giữ chân bạn càng lâu càng tốt.",
    "content": "<h3>Bong bóng lọc (Filter Bubble)</h3><p>Mỗi lượt click, mỗi giây bạn dừng lại xem một video, thuật toán đều đang học hỏi về bạn. Và nó phát hiện ra một sự thật đen tối: Con người dễ bị thu hút bởi sự giận dữ, phẫn nộ và những thuyết âm mưu hơn là những tin tức tích cực và bình yên.</p><p>Kết quả là, thuật toán sẽ liên tục bơm vào feed của bạn những nội dung gây tranh cãi. Nếu bạn hơi có xu hướng bảo thủ, thuật toán sẽ đẩy bạn trở nên cực đoan. Chúng ta bị nhốt trong những 'buồng vang âm' (echo chambers), nơi mọi người xung quanh dường như đều đồng tình với những định kiến tồi tệ nhất của chúng ta.</p><h3>Thoát khỏi ma trận</h3><p>Nhận thức được sự tồn tại của thuật toán là bước đầu tiên để thoát khỏi nó. Hãy chủ động tìm kiếm những luồng thông tin trái chiều. Đọc sách thay vì đọc status. Nghe podcast dài thay vì xem video ngắn 15 giây. Hãy giành lại quyền kiểm soát thực tại của chính mình từ tay những cỗ máy vô tri.</p>",
    "tags": ["AI", "Xã hội", "Công nghệ"],
    "link": "#"
  }
];

let existingData = [];
try {
  const fileContent = fs.readFileSync('./src/data/articles.json', 'utf8');
  existingData = JSON.parse(fileContent);
} catch(e) {
  console.log("No existing articles, starting fresh.");
}

// Prepend the new spiderum-like articles so they show up first
const newData = [...spiderumArticles, ...existingData];
fs.writeFileSync('./src/data/articles.json', JSON.stringify(newData, null, 2));
console.log("Added 10 new high-quality deep-think articles to the database!");

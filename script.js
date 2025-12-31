const app = {
    checklistData: [
        "Yêu ai đó", "Rời xa ai đó", "Chia tay ai đó", "Cười thật nhiều",
        "Tập chơi 1 nhạc cụ", "Tập chơi 1 môn thể thao mới", "Đi lên núi", "Đi xuống biển",
        "Đi chơi xa 1 mình", "Đi concert", "Đi date", "Đi bão",
        "Học 1 kỹ năng mới", "Mua món đồ mơ ước", "Đưa ra quyết định lớn", "Dành thời gian cho gia đình",
        "Dành thời gian cho bản thân", "Quen thêm bạn bè mới", "Khởi nghiệp", "Đi thiện nguyện",
        "Tiết kiệm tiền", "Bỏ 1 thói quen không lành mạnh", "Tăng cân", "Giảm cân",
        "Được khen thưởng", "Thử phong cách mới cho cá nhân", "Đi chơi overnight", "Học ngôn ngữ mới",
        "Được tỏ tình", "Đi phượt", "Khóc 1 mình", "Tự học thêm về AI",
        "Đi nước ngoài", "Biết nấu ăn", "Khám phá ra sở thích mới của bản thân", "Biết buông bỏ"
    ],

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderChecklist();
    },

    cacheDOM() {
        this.dom = {
            fullName: document.getElementById('fullName'),
            dobDay: document.getElementById('dobDay'),
            dobMonth: document.getElementById('dobMonth'),
            dobYear: document.getElementById('dobYear'),
            startBtn: document.getElementById('startBtn'),
            analyzeBtn: document.getElementById('analyzeBtn'),
            resetBtn: document.getElementById('resetBtn'),
            inputCard: document.querySelector('.input-card'),
            checklistCard: document.getElementById('checklist-section'),
            checklistGrid: document.getElementById('checklistGrid'),
            loading: document.getElementById('loading'),
            result: document.getElementById('result'),
            resName: document.getElementById('resName'),
            resZodiac: document.getElementById('resZodiac'),
            resNumber: document.getElementById('resNumber'),
            resDescription: document.getElementById('resDescription'),
            resGreeting: document.getElementById('resGreeting')
        };
    },

    bindEvents() {
        if (this.dom.startBtn) {
            this.dom.startBtn.addEventListener('click', () => this.handleStart());
        }
        if (this.dom.analyzeBtn) {
            this.dom.analyzeBtn.addEventListener('click', () => this.handleAnalysis());
        }
        if (this.dom.resetBtn) {
            this.dom.resetBtn.addEventListener('click', () => this.resetApp());
        }

        // Logo Reset
        const logo = document.querySelector('.logo-img');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                if (confirm('Bạn muốn quay lại màn hình chính?')) {
                    this.resetApp();
                }
            });
        }
    },

    renderChecklist() {
        if (!this.dom.checklistGrid) return;

        this.dom.checklistGrid.innerHTML = '';
        this.checklistData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.innerHTML = `<span class="icon">⬜</span> <span>${item}</span>`;
            div.addEventListener('click', () => {
                div.classList.toggle('active');
                const icon = div.querySelector('.icon');
                icon.textContent = div.classList.contains('active') ? '✅' : '⬜';
            });
            this.dom.checklistGrid.appendChild(div);
        });
    },

    handleStart() {
        const name = this.dom.fullName.value.trim();
        const d = this.dom.dobDay.value;
        const m = this.dom.dobMonth.value;
        const y = this.dom.dobYear.value;

        if (!name || !d || !m || !y) {
            alert('Vui lòng điền đầy đủ Họ Tên và Ngày Sinh để bắt đầu nhé! ✨');
            return;
        }

        // Basic Validation
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2026) {
            alert('Ngày sinh không hợp lệ. Vui lòng kiểm tra lại!');
            return;
        }

        this.dom.inputCard.classList.add('hidden');
        this.dom.checklistCard.classList.remove('hidden');
    },

    handleAnalysis() {
        // Collect ticked items
        const tickedItems = document.querySelectorAll('.checklist-item.active');
        const count = tickedItems.length;

        // Switch UI to Loading
        this.dom.checklistCard.classList.add('hidden');
        this.dom.loading.classList.remove('hidden');

        // Simulate Thinking Delay
        setTimeout(() => {
            const name = this.dom.fullName.value.trim();
            const day = parseInt(this.dom.dobDay.value);
            const month = parseInt(this.dom.dobMonth.value);
            const year = parseInt(this.dom.dobYear.value);

            const analysis = this.generateAnalysis(name, day, month, year, count);
            this.showResult(analysis);

            // --- SEND DATA TO GOOGLE SHEET (Fire & Forget) ---
            const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwMDvSPOP6Z3gf8fvyTF5vErMGtY1Ln8IA3qmvBHuGdclC8O36pVmzq-iCJIO9ptExr/exec';

            fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: analysis.name,
                    dob: analysis.dateStr,
                    zodiac: analysis.zodiac.name,
                    checkCount: count,
                    greeting: analysis.greeting
                })
            }).catch(err => console.error('Data Send Error:', err));

        }, 2000);
    },

    resetApp() {
        this.dom.result.classList.add('hidden');
        this.dom.inputCard.classList.remove('hidden');
        this.dom.checklistCard.classList.add('hidden');
        this.dom.fullName.value = '';
        this.dom.dobDay.value = '';
        this.dom.dobMonth.value = '';
        this.dom.dobYear.value = '';
        // Reset checklist
        const items = document.querySelectorAll('.checklist-item');
        items.forEach(item => {
            item.classList.remove('active');
            item.querySelector('.icon').textContent = '⬜';
        });
    },

    showResult(data) {
        this.dom.loading.classList.add('hidden');
        this.dom.result.classList.remove('hidden');
        this.dom.result.classList.add('fade-in');

        this.dom.resName.textContent = data.name;
        // Display Parsed Date to confirm input
        this.dom.resZodiac.innerHTML = `${data.zodiac.icon} ${data.zodiac.name} <br><span style="font-size: 0.8em; opacity: 0.8">(${data.dateStr})</span>`;
        this.dom.resNumber.textContent = 'Số chủ đạo: ' + data.numerology;
        this.dom.resDescription.innerHTML = data.description;
        this.dom.resGreeting.textContent = data.greeting;
    },

    // --- Core Logic ---

    // 1. Calculate Numerology (Life Path Number)
    calculateNumerology(day, month, year) {
        // Construct string just for the logic consistency if wanted, or sum directly
        // Life Path = sum of all digits
        const fullStr = `${day}${month}${year}`;
        const digits = fullStr.split('').map(Number);
        const sum = digits.reduce((a, b) => a + b, 0);

        const reduceToSingleDigit = (num) => {
            if (num <= 9 || num === 11 || num === 22) return num;
            const newSum = num.toString().split('').map(Number).reduce((a, b) => a + b, 0);
            return reduceToSingleDigit(newSum);
        };

        return reduceToSingleDigit(sum);
    },

    // 2. Get Zodiac Sign
    getZodiac(day, month) {
        if ((month == 1 && day <= 19) || (month == 12 && day >= 22)) return { name: "Ma Kết", icon: "♑" };
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return { name: "Bảo Bình", icon: "♒" };
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return { name: "Song Ngư", icon: "♓" };
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return { name: "Bạch Dương", icon: "♈" };
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return { name: "Kim Ngưu", icon: "♉" };
        if ((month == 5 && day >= 21) || (month == 6 && day <= 21)) return { name: "Song Tử", icon: "♊" };
        if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) return { name: "Cự Giải", icon: "♋" };
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return { name: "Sư Tử", icon: "♌" };
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return { name: "Xử Nữ", icon: "♍" };
        if ((month == 9 && day >= 23) || (month == 10 && day <= 23)) return { name: "Thiên Bình", icon: "♎" };
        if ((month == 10 && day >= 24) || (month == 11 && day <= 22)) return { name: "Thiên Yết", icon: "♏" };
        if ((month == 11 && day >= 23) || (month == 12 && day <= 21)) return { name: "Nhân Mã", icon: "♐" };

        return { name: "Không xác định", icon: "❓" };
    },

    // 3. Generators
    generateAnalysis(name, day, month, year, checkCount) {
        // Direct assignment, no parsing needed

        const number = this.calculateNumerology(day, month, year);
        const zodiac = this.getZodiac(day, month);

        // --- Data Corpus ---
        const traits = {
            1: "Bạn là người sinh ra để dẫn đầu. Mạnh mẽ, quyết đoán và độc lập.",
            2: "Bạn sở hữu trực giác tuyệt vời và trái tim nhân hậu.",
            3: "Bạn là linh hồn của những bữa tiệc! Sự sáng tạo luôn chảy trong bạn.",
            4: "Sự kiên định và thực tế là sức mạnh của bạn.",
            5: "Tự do là lẽ sống của bạn. Bạn thích phiêu lưu và ghét sự ràng buộc.",
            6: "Bạn là người của gia đình. Sự quan tâm và trách nhiệm là điểm tựa của bạn.",
            7: "Bạn mang trong mình trí tuệ sâu sắc và thích chiêm nghiệm.",
            8: "Bạn có tố chất kinh doanh và lãnh đạo tài ba.",
            9: "Bạn có tấm lòng bao dung rộng lớn và sứ mệnh cống hiến.",
            11: "Bạn có trực giác tâm linh cực kỳ nhạy bén.",
            22: "Bạn là 'Kiến trúc sư của tương lai' với tầm nhìn xa trông rộng."
        };

        // ZODIAC DATABASE (Expanded - 15+ messages per sign)
        const zodiacMessages = {
            "Bạch Dương": [
                "Lửa nhiệt huyết của Bạch Dương sẽ đốt cháy mọi rào cản năm 2026. Hãy tiên phong dẫn đầu!",
                "Đôi khi lùi một bước là để tiến ba bước. Sự kiên nhẫn sẽ là vũ khí bí mật của bạn năm tới.",
                "Tốc độ là thế mạnh, nhưng sự bền bỉ mới giúp bạn về đích. Hãy giữ vững phong độ đường dài.",
                "Một cơ hội lãnh đạo bất ngờ sẽ tìm đến. Đừng ngại ngần, bạn sinh ra để làm điều này.",
                "Năng lượng của bạn đang ở đỉnh cao. Hãy dùng nó để bứt phá trong sự nghiệp hoặc khởi nghiệp.",
                "Chuyện tình cảm cần thêm chút gia vị lãng mạn. Đừng quá cứng nhắc, hãy để cảm xúc dẫn lối.",
                "Sự thẳng thắn đáng quý, nhưng hãy khéo léo hơn trong giao tiếp để tránh thị phi không đáng có.",
                "Năm 2026, hãy thử thách bản thân ở một lĩnh vực hoàn toàn mới. Vũ trụ thấy tiềm năng vô hạn ở bạn.",
                "Đừng để những cơn nóng giận nhất thời làm hỏng việc lớn. Hít thở sâu và bình tĩnh giải quyết.",
                "Sức khỏe cần được quan tâm hơn, đặc biệt là những cơn đau đầu do căng thẳng. Thư giãn đi nào!",
                "Bạn sẽ là nguồn cảm hứng cho những người xung quanh. Hãy sống thật rực rỡ và tích cực.",
                "Tài chính có dấu hiệu khởi sắc nhờ những quyết định táo bạo. Hãy tin vào trực giác nhạy bén của mình.",
                "Một chuyến đi xa sẽ mang lại cho bạn những ý tưởng triệu đô. Xách balo lên và đi thôi!",
                "Hãy học cách lắng nghe nhiều hơn. Có những lời khuyên đắt giá đến từ những người bạn không ngờ tới.",
                "Năm của hành động! Đừng chỉ lên kế hoạch, hãy bắt tay vào làm ngay thì kết quả sẽ đến."
            ],
            "Kim Ngưu": [
                "Sự vững chãi của Kim Ngưu là điểm tựa tuyệt vời cho mọi người. 2026 sẽ đền đáp bạn bằng sự an yên.",
                "Tiền bạc phân minh, ái tình dứt khoát. Sự rạch ròi sẽ giúp bạn tránh được rắc rối tài chính.",
                "Hãy nuông chiều bản thân hơn một chút. Một món đồ xa xỉ hay một kỳ nghỉ dưỡng là phần thưởng xứng đáng.",
                "Kiên trì là chìa khóa vàng. Những gì bạn gieo trồng bấy lâu nay sắp đến ngày hái quả ngọt.",
                "Đừng ngại thay đổi khẩu vị hay phong cách. Sự mới mẻ sẽ thu hút vận may đến với bạn.",
                "Một cơ hội đầu tư bất động sản hoặc tài chính dài hạn rất hứa hẹn. Hãy cân nhắc kỹ lưỡng.",
                "Tình yêu cần sự vun đắp từ những điều nhỏ bé. Một bữa tối do chính tay bạn nấu sẽ ghi điểm tuyệt đối.",
                "Sức khỏe ổn định, nhưng đừng lơ là việc tập luyện. Sự dẻo dai sẽ giúp bạn đi xa hơn.",
                "Sự bướng bỉnh đôi khi là tốt, nhưng hãy biết lắng nghe khi cần thiết. Sự linh hoạt sẽ mở ra nhiều cửa. ",
                "Năm 2026, hãy tập trung vào chất lượng hơn số lượng. Bạn bè ít nhưng chất, công việc ít nhưng lương cao.",
                "Vũ trụ thấy bạn đang ấp ủ một dự định nghệ thuật hoặc sáng tạo. Hãy thực hiện nó ngay!",
                "Gia đình là số 1. Hãy dành nhiều thời gian hơn cho những người thân yêu, họ là nguồn động lực lớn nhất.",
                "Cẩn thận với những lời hứa hẹn hoa mỹ. Hãy tin vào những gì mắt thấy tai nghe và những con số thực tế.",
                "Sự chậm rãi của bạn không phải là chậm chạp, mà là chắc chắn. Cứ đi theo tốc độ của riêng mình.",
                "Một năm thịnh vượng về vật chất đang chờ đón. Hãy chuẩn bị ví tiền để đón lộc nhé!"
            ],
            "Song Tử": [
                "Khả năng ngoại giao tuyệt vời sẽ giúp Song Tử kết nối với những nhân vật tầm cỡ trong năm 2026.",
                "Sự tò mò sẽ dẫn bạn đến những kho báu tri thức vô giá. Đừng ngừng học hỏi và khám phá.",
                "Đa nhiệm là tốt, nhưng hãy cẩn thận kẻo phân tâm. Tập trung vào một mục tiêu lớn sẽ mang lại thành tựu lớn hơn.",
                "Mạng xã hội sẽ là sân khấu của bạn. Hãy chia sẻ câu chuyện của mình, bạn sẽ truyền cảm hứng cho rất nhiều người.",
                "Một mối quan hệ 'trên tình bạn, dưới tình yêu' có thể tiến xa hơn. Hãy lắng nghe con tim mình.",
                "Sự linh hoạt giúp bạn thích nghi với mọi biến động. Năm tới dù có thay đổi gì, bạn vẫn sẽ sống khỏe.",
                "Cẩn trọng lời nói, 'bút sa gà chết'. Hãy suy nghĩ kỹ trước khi phát ngôn những vấn đề nhạy cảm.",
                "Những chuyến đi ngắn ngày sẽ nạp lại năng lượng cho bạn cực nhanh. Đừng ru rú ở nhà quá lâu.",
                "Năm 2026 rất thuận lợi cho việc học ngôn ngữ mới hoặc kỹ năng truyền thông. Nâng cấp bản thân ngay!",
                "Đừng hứa lèo. Uy tín là thứ xây dựng cả đời nhưng có thể mất trong một giây. Giữ lời hứa là vàng.",
                "Bạn sẽ tìm thấy niềm vui trong những trang sách hoặc những khóa học thú vị. Tri thức là sức mạnh.",
                "Tài chính có nhiều nguồn thu nhỏ lẻ cộng lại thành khoản lớn. Tích tiểu thành đại là chiến lược hay.",
                "Sự hài hước của bạn là thỏi nam châm thu hút mọi người. Hãy cứ vui vẻ và yêu đời như thế.",
                "Đã đến lúc giải quyết những vấn đề cũ còn tồn đọng. Dọn dẹp quá khứ để đón tương lai rạng rỡ.",
                "Hai mặt tính cách giúp bạn nhìn nhận vấn đề đa chiều. Hãy dùng trí tuệ đó để giải quyết khó khăn."
            ],
            "Cự Giải": [
                "Trực giác của Cự Giải năm 2026 sắc bén như dao. Hãy tin vào linh tính, nó sẽ bảo vệ bạn.",
                "Gia đình sẽ đón nhận tin hỷ sự. Có thể là thành viên mới hoặc một sự kiện sum họp đầm ấm.",
                "Sự dịu dàng của bạn có sức mạnh chữa lành to lớn. Bạn là thiên thần hộ mệnh của ai đó đấy.",
                "Đừng ngại thể hiện cảm xúc. Khóc một chút cũng không sao, nước mắt sẽ rửa trôi muộn phiền.",
                "Tài chính ổn định nhờ thói quen tiết kiệm và vun vén khéo léo của bạn. Hãy tiếp tục phát huy.",
                "Một ngôi nhà mới hoặc việc sửa sang tổ ấm sẽ mang lại vượng khí cho năm tới. Hãy chăm chút không gian sống.",
                "Quá khứ đã qua, đừng ngoái lại nhìn mãi. Hãy mở lòng đón nhận những điều mới mẻ đang đến.",
                "Sự bảo vệ quá mức có thể khiến người khác ngột ngạt. Hãy cho những người thân yêu chút không gian tự do.",
                "Năm 2026, hãy học cách yêu bản thân mình trước khi yêu người khác. Bạn xứng đáng được hạnh phúc.",
                "Công việc liên quan đến chăm sóc, giáo dục hoặc thực phẩm sẽ rất thuận lợi. Tiềm năng phát triển lớn.",
                "Đừng để cảm xúc chi phối quá nhiều trong công việc. Hãy dùng cái đầu lạnh để giải quyết vấn đề.",
                "Một người bạn cũ sẽ quay lại và mang theo những cơ hội bất ngờ. Hãy đón tiếp nồng hậu.",
                "Sức khỏe dạ dày cần chú ý. Ăn uống điều độ và tránh lo âu quá mức nhé Cự Giải.",
                "Sự kiên trì thầm lặng của bạn sẽ được đền đáp xứng đáng. Không cần ồn ào, thành quả sẽ tự lên tiếng.",
                "Tình yêu sẽ đến từ sự thấu hiểu và sẻ chia sâu sắc. Một mối quan hệ bền vững đang chờ bạn."
            ],
            "Sư Tử": [
                "Sân khấu 2026 là của Sư Tử! Hãy tự tin tỏa sáng rực rỡ nhất, mọi ánh mắt đang đổ dồn về bạn.",
                "Sự hào phóng sẽ mang lại cho bạn những mối quan hệ chất lượng. Cho đi là còn mãi.",
                "Đừng để cái tôi quá lớn che mất lý trí. Lắng nghe ý kiến của người khác sẽ giúp bạn hoàn thiện hơn.",
                "Năng lượng lãnh đạo bẩm sinh sẽ giúp bạn dẫn dắt đội nhóm đi đến thắng lợi. Hãy vững tay chèo.",
                "Tình yêu sẽ rực rỡ và nồng cháy như phim. Hãy tận hưởng những khoảnh khắc lãng mạn này.",
                "Một cơ hội thăng tiến lớn đang đến gần. Hãy chuẩn bị tinh thần và kỹ năng để nắm bắt.",
                "Sáng tạo là thế mạnh của bạn. Đừng ngại thử nghiệm những ý tưởng táo bạo, độc lạ.",
                "Hãy chú ý đến sức khỏe tim mạch và cột sống. Đừng làm việc quá sức, hãy nghỉ ngơi hợp lý.",
                "Màu vàng hoặc cam sẽ mang lại may mắn cho bạn năm nay. Hãy ưu tiên những gam màu này.",
                "Đừng cố gồng gánh mọi thứ một mình. Hãy chia sẻ trách nhiệm, bạn sẽ thấy nhẹ nhõm hơn nhiều.",
                "Sự trung thành của bạn được đánh giá cao. Bạn sẽ có những người đồng đội sống chết có nhau.",
                "Tài chính rủng rỉnh, thích hợp để đầu tư vào hình ảnh bản thân hoặc thương hiệu cá nhân.",
                "Đừng ngủ quên trên chiến thắng. Hãy luôn đặt ra những mục tiêu cao hơn để chinh phục.",
                "Sự nóng nảy có thể làm hỏng việc. Hãy học cách kiểm soát cảm xúc và giữ bình tĩnh.",
                "Năm 2026, bạn là vua của rừng xanh. Hãy cai trị vương quốc của mình bằng trí tuệ và lòng nhân ái."
            ],
            "Xử Nữ": [
                "Sự tỉ mỉ của Xử Nữ sẽ tạo nên những sản phẩm hoàn hảo không tì vết. Chất lượng là thương hiệu của bạn.",
                "Đừng quá khắt khe với bản thân và người khác. Sự bao dung sẽ giúp cuộc sống nhẹ nhàng hơn.",
                "Sức khỏe là vàng. Hãy thiết lập chế độ ăn uống và tập luyện khoa học ngay từ đầu năm 2026.",
                "Công việc phân tích, số liệu hoặc nghiên cứu sẽ mang lại thành tựu lớn. Hãy tập trung chuyên môn.",
                "Sự khiêm tốn giúp bạn được lòng mọi người, nhưng đừng để người khác lợi dụng lòng tốt đó.",
                "Năm tới rất thuận lợi để học thêm kỹ năng mới hoặc lấy chứng chỉ chuyên môn. Đầu tư cho tri thức không bao giờ lỗ.",
                "Tình yêu đến từ sự quan tâm tinh tế và thiết thực. Những hành động nhỏ sẽ ghi điểm lớn.",
                "Đừng lo lắng thái quá về tương lai. Hãy sống trọn vẹn từng khoảnh khắc hiện tại.",
                "Sự ngăn nắp giúp bạn tư duy mạch lạc. Hãy giữ không gian sống và làm việc luôn gọn gàng.",
                "Một cơ hội làm việc trong môi trường y tế hoặc dịch vụ sẽ mở ra. Hãy cân nhắc.",
                "Tài chính ổn định và tăng trưởng đều đặn. Kế hoạch chi tiêu hợp lý của bạn phát huy tác dụng.",
                "Hãy học cách nói 'không' với những việc không tên. Tập trung vào mục tiêu chính của mình.",
                "Sự chỉ trích mang tính xây dựng là tốt, nhưng hãy lựa lời mà nói để không gây tổn thương.",
                "Năm 2026, hãy để sự logic dẫn đường, nhưng thỉnh thoảng hãy nghe theo tiếng gọi con tim.",
                "Bạn là mảnh ghép không thể thiếu trong mọi tập thể. Sự tận tụy của bạn được trân trọng."
            ],
            "Thiên Bình": [
                "Sự cân bằng là chìa khóa hạnh phúc của Thiên Bình năm 2026. Hãy phân bổ thời gian hợp lý cho mọi việc.",
                "Vẻ duyên dáng và gu thẩm mỹ tốt sẽ giúp bạn tỏa sáng trong các sự kiện xã hội.",
                "Đừng do dự mãi. Hãy quyết đoán hơn trong các lựa chọn quan trọng, cơ hội không chờ đợi ai.",
                "Tình yêu sẽ thăng hoa nếu bạn biết cách giữ lửa. Sự lãng mạn và tinh tế là vũ khí của bạn.",
                "Hợp tác là từ khóa của năm. Hãy tìm kiếm những đối tác tin cậy để cùng phát triển.",
                "Sự công bằng luôn được bạn đề cao. Bạn sẽ là người hòa giải tuyệt vời cho mọi xung đột.",
                "Năm tới thuận lợi cho các công việc liên quan đến nghệ thuật, thời trang hoặc luật pháp.",
                "Đừng cố làm hài lòng tất cả mọi người. Hãy sống cho bản thân mình nhiều hơn.",
                "Sức khỏe thận và lưng cần được lưu tâm. Uống nhiều nước và vận động nhẹ nhàng nhé.",
                "Tài chính có sự biến động nhẹ, hãy cân nhắc kỹ trước khi chi tiêu cho những món đồ xa xỉ.",
                "Một mối quan hệ cũ có thể quay lại. Hãy suy nghĩ kỹ xem có nên 'gương vỡ lại lành' hay không.",
                "Hãy trau dồi kỹ năng đàm phán. Nó sẽ giúp bạn mang về những hợp đồng béo bở.",
                "Sự do dự có thể khiến bạn mất đi cơ hội vàng. Hãy tin vào trực giác ban đầu của mình.",
                "Năm 2026, vẻ đẹp tâm hồn và ngoại hình của bạn đều đạt đỉnh cao. Hãy tận dụng lợi thế này.",
                "Hòa bình là tốt, nhưng đôi khi cần đấu tranh để bảo vệ quyền lợi chính đáng của mình."
            ],
            "Thiên Yết": [
                "Sự bí ẩn tạo nên sức hút khó cưỡng của Thiên Yết. Năm 2026, bạn sẽ là tâm điểm của sự chú ý.",
                "Trực giác của bạn chưa bao giờ sai. Hãy tin vào những gì bạn cảm nhận, không phải những gì bạn nghe thấy.",
                "Sự lột xác ngoạn mục đang chờ đón. Hãy rũ bỏ con người cũ để đón nhận phiên bản rực rỡ hơn.",
                "Tài chính cực thịnh, có thể nhận được khoản thừa kế hoặc trúng thưởng bất ngờ.",
                "Tình yêu của Thiên Yết luôn nồng nàn và sâu sắc. Một mối tình khắc cốt ghi tâm đang chờ bạn.",
                "Đừng giữ thù hận trong lòng. Tha thứ là cách tốt nhất để giải thoát cho chính mình.",
                "Sức mạnh nội tâm của bạn là vô tận. Không khó khăn nào có thể quật ngã được bạn năm tới.",
                "Hãy cẩn thận với những bí mật. Đừng chia sẻ quá nhiều chuyện riêng tư với người mới quen.",
                "Năm 2026 thuận lợi cho việc nghiên cứu sâu hoặc tìm hiểu về tâm linh, huyền học.",
                "Đừng quá đa nghi Tào Tháo. Hãy mở lòng tin tưởng những người thực sự yêu thương bạn.",
                "Sức khỏe sinh sản cần được quan tâm. Hãy đi khám định kỳ để yên tâm nhé.",
                "Bạn có khả năng nhìn thấu tâm can người khác. Hãy dùng nó để giúp đỡ thay vì điều khiển họ.",
                "Sự kiểm soát quá mức có thể giết chết tình yêu. Hãy thả lỏng để cả hai cùng dễ thở.",
                "Một sự thật bất ngờ sẽ được phơi bày. Hãy bình tĩnh đón nhận, nó sẽ tốt cho bạn về sau.",
                "Năm của sự tái sinh. Như phượng hoàng lửa, bạn sẽ trỗi dậy mạnh mẽ từ tro tàn."
            ],
            "Nhân Mã": [
                "Bầu trời là giới hạn của Nhân Mã. Năm 2026, hãy bay cao và bay xa hết mức có thể.",
                "Những chuyến đi sẽ mang lại cho bạn không chỉ trải nghiệm mà còn cả cơ hội đổi đời.",
                "Sự lạc quan giúp bạn vượt qua mọi bão giông. Hãy luôn giữ nụ cười trên môi nhé.",
                "Đừng hứa hẹn nếu không chắc làm được. Sự tự do đôi khi khiến bạn quên mất trách nhiệm.",
                "Tình yêu sẽ đến trên những cung đường. Một người bạn đồng hành thú vị đang chờ bạn.",
                "Học vấn và tri thức sẽ được mở rộng. Rất tốt cho việc du học hoặc nghiên cứu cao hơn.",
                "Tài chính có lúc lên voi xuống chó, hãy học cách quản lý chi tiêu chặt chẽ hơn.",
                "Sự thẳng thắn quá mức có thể gây mất lòng. Hãy khéo léo hơn trong lời ăn tiếng nói.",
                "Năm 2026, hãy thử sức với những môn thể thao mạo hiểm hoặc hoạt động ngoài trời.",
                "Đừng đứng núi này trông núi nọ. Hãy trân trọng những gì mình đang có trong tay.",
                "Bạn là người truyền cảm hứng tuyệt vời. Hãy chia sẻ câu chuyện và năng lượng tích cực của mình.",
                "May mắn luôn mỉm cười với Nhân Mã. Bạn như có quý nhân phù trợ trong mọi việc.",
                "Hãy cẩn thận với các vấn đề pháp lý hoặc giấy tờ. Đọc kỹ hướng dẫn sử dụng trước khi dùng.",
                "Mục tiêu lớn cần kế hoạch cụ thể. Đừng chỉ mơ mộng, hãy hành động thực tế.",
                "Tự do là tốt, nhưng đôi khi sự ràng buộc ngọt ngào của gia đình cũng rất đáng quý."
            ],
            "Ma Kết": [
                "Đỉnh vinh quang đang vẫy gọi Ma Kết. 2026 là năm để bạn khẳng định vị thế của mình.",
                "Sự kiên trì và kỷ luật thép sẽ giúp bạn chinh phục những mục tiêu 'bất khả thi'.",
                "Đừng làm việc bán mạng. Hãy nhớ sức khỏe mới là tài sản quý giá nhất của bạn.",
                "Một bước tiến lớn trong sự nghiệp: Thăng chức, tăng lương hoặc khởi nghiệp thành công.",
                "Tình yêu cần sự cam kết và trách nhiệm. Bạn là người đáng tin cậy để gửi gắm cả đời.",
                "Hãy học cách thư giãn. Cuộc sống không chỉ có công việc, còn nhiều niềm vui khác đang chờ.",
                "Tài chính vững chắc nhờ tích lũy lâu dài. Bạn là đại gia ngầm chính hiệu.",
                "Đừng quá lạnh lùng, khô khan. Hãy thể hiện tình cảm nhiều hơn với những người thân yêu.",
                "Năm 2026, uy tín của bạn tăng cao. Lời nói của bạn có trọng lượng như vàng.",
                "Cẩn thận các bệnh về xương khớp và da liễu. Chăm sóc bản thân kỹ hơn nhé.",
                "Sự bảo thủ có thể kìm hãm bạn. Hãy mở lòng đón nhận những phương pháp mới hiệu quả hơn.",
                "Gia đình là hậu phương vững chắc. Hãy dành thời gian vun vén cho tổ ấm của mình.",
                "Bạn xây dựng mọi thứ từ nền móng vững chắc. Thành công của bạn là bền vững, không phải chớp nhoáng.",
                "Hãy đặt ra những mục tiêu thực tế. Tham vọng quá lớn có thể khiến bạn kiệt sức.",
                "Năm của sự trưởng thành và chín muồi. Bạn sẽ là chỗ dựa tinh thần cho rất nhiều người."
            ],
            "Bảo Bình": [
                "Sự khác biệt làm nên thương hiệu Bảo Bình. Năm 2026, hãy cứ 'quái' và 'chất' theo cách riêng.",
                "Những ý tưởng đột phá sẽ mang lại thành công vang dội. Đừng ngại đi ngược lại đám đông.",
                "Tình yêu cần không gian riêng. Hãy tôn trọng sự tự do của đối phương và của chính mình.",
                "Mạng lưới bạn bè sẽ mang lại cơ hội lớn. Hãy tích cực tham gia các hoạt động cộng đồng.",
                "Công nghệ va đổi mới sáng tạo là lĩnh vực của bạn. Hãy tận dụng lợi thế này.",
                "Đừng quá xa cách, lạnh lùng. Hãy kết nối cảm xúc nhiều hơn với mọi người xung quanh.",
                "Tài chính có những khoản thu bất ngờ từ những dự án phụ hoặc đầu tư mạo hiểm.",
                "Sự nhân đạo và lòng trắc ẩn của bạn sẽ giúp ích cho đời. Hãy tham gia các hoạt động thiện nguyện.",
                "Năm 2026, hãy thay đổi môi trường sống hoặc làm việc để tìm cảm hứng mới.",
                "Cẩn thận các vấn đề về hệ thần kinh và tuần hoàn. Hãy tập thiền hoặc yoga để tĩnh tâm.",
                "Bạn là người đi trước thời đại. Đừng buồn nếu hiện tại ít người hiểu bạn, tương lai sẽ chứng minh.",
                "Sự nổi loạn cần có mục đích. Đừng phá vỡ quy tắc chỉ để cho vui, hãy phá vỡ để kiến tạo.",
                "Tình bạn đôi khi quan trọng hơn tình yêu với Bảo Bình. Hãy trân trọng những người bạn tri kỷ.",
                "Một năm đầy biến động và thú vị. Hãy thắt dây an toàn và tận hưởng chuyến tàu lượn siêu tốc này.",
                "Trí tuệ của bạn là vô giá. Hãy chia sẻ kiến thức để giúp đỡ cộng đồng cùng phát triển."
            ],
            "Song Ngư": [
                "Trực giác và sự nhạy cảm là món quà trời ban cho Song Ngư năm 2026. Hãy lắng nghe tiếng nói bên trong.",
                "Nghệ thuật và sự sáng tạo sẽ thăng hoa. Hãy vẽ, viết, hát hoặc làm bất cứ gì để thỏa mãn đam mê.",
                "Đừng quá mơ mộng, hãy giữ đôi chân chạm đất. Thực tế đôi khi phũ phàng nhưng cần thiết.",
                "Tình yêu lãng mạn như cổ tích đang chờ đón. Hãy mở lòng đón nhận hoàng tử/công chúa của mình.",
                "Sự hy sinh là đức tính tốt, nhưng đừng để người khác lợi dụng lòng tốt của bạn.",
                "Năm 2026, hãy học cách bảo vệ ranh giới cá nhân. Biết nói 'không' khi cần thiết.",
                "Tài chính cần quản lý chặt chẽ hơn. Tránh chi tiêu theo cảm hứng nhất thời.",
                "Sức khỏe tinh thần cần được chăm sóc đặc biệt. Hãy tìm đến sự bình yên trong tâm hồn.",
                "Một quý nhân sẽ xuất hiện giúp đỡ bạn vượt qua khó khăn. Hãy trân trọng mối duyên này.",
                "Công việc liên quan đến tâm linh, chữa lành hoặc phục vụ cộng đồng rất phù hợp với bạn.",
                "Đừng trốn tránh thực tại. Hãy dũng cảm đối mặt và giải quyết vấn đề tận gốc.",
                "Sự thấu cảm giúp bạn kết nối sâu sắc với mọi người. Bạn là bờ vai tin cậy để ai đó dựa vào.",
                "Nước là yếu tố may mắn của bạn. Hãy đi biển hoặc trang trí hồ cá trong nhà.",
                "Năm của sự chữa lành và tha thứ. Hãy buông bỏ những tổn thương cũ để nhẹ lòng bước tiếp.",
                "Bạn có khả năng biến giấc mơ thành hiện thực. Hãy tin tưởng vào phép màu của chính mình."
            ]
        };

        const compliments = [
            `Chà, <b>${name}</b> thân mến! Vũ trụ nhận thấy bạn có một khí chất rất đặc biệt.`,
            `Hóa ra là <b>${name}</b>! Không ngạc nhiên khi bạn luôn để lại ấn tượng mạnh mẽ.`,
            `<b>${name}</b> ơi, các vì sao đang mỉm cười khi nhìn vào vận mệnh của bạn đấy!`,
            `Tuyệt vời! Sự kết hợp giữa năng lượng của bạn và vũ trụ thật sự thú vị, <b>${name}</b> ạ.`
        ];

        // --- Greetings Corpus ---
        const greetings = [
            "Chúc năm mới không tăng cân, không tăng stress, chỉ tăng lương!",
            "Năm 2026 chúc bạn ăn Tết không lo tăng cân, đi làm không lo tăng việc, cuối tháng không lo… hết tiền!",
            "Chúc bạn deadline tự biến mất, KPI tự hoàn thành, lương thưởng tự tăng – không cần giải thích!",
            "Năm 2026 chúc bạn việc tự chạy, lương tự tăng, còn bạn… tự do tận hưởng!",
            "Chúc năm mới việc khó có người lo, việc dễ đến tay mình!",
            "Chúc năm 2026 nhiều quyết định sáng suốt, nhiều niềm vui trong công việc và nhiều kết quả tích cực.",
            "Mong rằng năm mới mở mắt ra là điều tốt, nhắm mắt lại là bình yên",
            "2026 chúc bạn luôn chill, luôn xinh, tiền vô không ngại, drama tự out",
            "Năm mới mong bạn mỗi ngày đều “healing”, mỗi tháng đều “có lương”, mỗi năm đều “lên level”",
            "2026 mong bạn deadline né bạn, KPI sợ bạn, tiền yêu bạn",
            "2026 xin vía: deadline auto né, KPI auto xong, tiền auto về ví",
            "2026: buồn thì cho out, mệt thì cho pause, vui thì cho repeat",
            "Năm 2026: việc thì vừa đủ mệt, lương thì mệt nghỉ",
            "Năm mới chúc bạn thoát kiếp FA, có người yêu xịn, yêu thương bền vững, không cần deadline",
            "Năm 2026 xin vía người yêu xuất hiện đúng lúc – đúng người – đúng vibe",
            "Chúc bạn đầu năm có crush, giữa năm thành couple, cuối năm tính chuyện lâu dài",
            "Năm mới chúc bạn xách vali nhiều hơn xách deadline, check-in nhiều hơn check mail",
            "Chúc bạn passport khỏe mạnh, visa mượt mà, lịch nghỉ luôn trùng lịch bay",
            "Năm mới: lên đường an yên, về nhà bình an, niềm vui mang theo đầy vali",
            "2026: khám phá thế giới một chút, khám phá bản thân thật nhiều",
            "Chúc bạn đi đủ xa để thấy mình mạnh mẽ, dừng đủ lâu để thấy mình bình yên",
            "2026 chúc bạn dám thử – dám fail – dám glow up, không hợp thì skip, hợp thì all-in",
            "Năm mới đi tập không lười, nghỉ tập không guilt, tiến bộ thấy rõ",
            "Chúc bạn có mục tiêu để cố gắng, có niềm vui để duy trì, có thời gian để yêu thương bản thân",
            "2026 chúc bạn sức khỏe ổn áp, tinh thần chill, công việc mượt, học tập lên trình",
            "Chúc bạn vui từ trong tâm, chill ra bên ngoài",
            "Năm mới: giữ cho mình một trái tim vui vẻ nhaaa",
            "Chúc mọi người đi làm không cáu, đi chơi không tiếc, cuối tháng không khóc",
            "Xuân sang chúc bạn an nhàn, Việc thì làm ít, tiền càng về nhanh. Sáng cà phê, tối ngủ lành, Cuối năm tổng kết: “Năm nay quá hời!”.",
            "Chúc bạn sức khỏe vô biên, kiếm được nhiều tiền, đời sướng như tiên, chẳng ai làm phiền.",
            "Bánh chưng thì màu xanh. Lẽ nào anh không biết, em vẫn thầm thích anh? Chúc mừng năm mới \"crush\" nhé!",
            "Chúc năm mới: \"Out trình\" mọi deadline, \"vibe\" luôn tích cực, nhan sắc \"keo lì tái châu\" và không còn phải \"lụy\" người yêu cũ.",
            "Chúc bạn tài khoản nhảy số nhanh hơn cách crush \"seen\" tin nhắn. Tiền đầy ví, xăng đầy bình, và quan trọng là không bị họ hàng hỏi \"Bao giờ lấy chồng/vợ?\".",
            "Năm mới chúc bạn: Được \"vũ trụ\" hồi đáp tất cả các đơn hàng, từ đơn Shopee cho đến đơn \"vận mệnh\". Chúc bạn luôn trong trạng thái \"thân tâm an lạc\" nhưng tài khoản vẫn \"nổ\" rầm rầm.",
            "Chúc bạn có một hệ miễn dịch cực tốt với deadline và một khả năng \"né\" task điêu luyện như cách bạn né thính của mấy anh/em \"trap\"."
        ];

        // 2025 Review based on Check count
        let yearReview = "";
        if (checkCount === 0) {
            yearReview = "Năm 2025 của bạn có vẻ khá bình lặng và kín tiếng nhỉ? Dường như bạn đang ấp ủ một điều gì đó rất lớn lao cho năm tới.";
        } else if (checkCount < 5) {
            yearReview = `Bạn đã trải qua một năm 2025 với ${checkCount} dấu ấn đáng nhớ. Tuy ít nhưng "chất", bạn đã chọn lọc rất kỹ những trải nghiệm cho mình.`;
        } else if (checkCount < 15) {
            yearReview = `Wow! Năm 2025 của bạn thật sôi động với ${checkCount} điều thú vị đã làm được. Bạn đã sống hết mình và tận hưởng từng khoảnh khắc!`;
        } else {
            yearReview = `Không thể tin được! Năm 2025 của bạn rực rỡ như pháo hoa với ${checkCount} trải nghiệm tuyệt vời. Bạn thực sự là một "tay chơi" của cuộc đời!`;
        }

        const intro = compliments[Math.floor(Math.random() * compliments.length)];
        const mainTrait = traits[number] || traits[9];
        // Select message from Expanded Zodiac Database
        const zodiacPool = zodiacMessages[zodiac.name] || zodiacMessages["Bạch Dương"]; // Fallback safe
        const conclusion = zodiacPool[Math.floor(Math.random() * zodiacPool.length)];

        const fullDescription = `${intro}<br><br>${yearReview}<br><br>${mainTrait}<br><br>⚡ <b>Thông điệp riêng cho ${zodiac.name}:</b><br>${conclusion}`;

        return {
            name: name,
            numerology: number,
            zodiac: zodiac,
            dateStr: `${day}/${month}/${year}`,
            description: fullDescription,
            greeting: greetings[Math.floor(Math.random() * greetings.length)]
        };
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

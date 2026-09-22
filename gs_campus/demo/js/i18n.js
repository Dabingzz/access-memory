/**
 * 多语言支持系统
 * 支持中文、英文、俄罗斯语、朝鲜语
 */

class I18n {
    constructor() {
        this.currentLanguage = 'zh'; // 默认中文
        this.translations = {
            zh: {
                // 导航系统
                'navigation.title': '导航设置',
                'navigation.start': '选择起点',
                'navigation.end': '选择终点',
                'navigation.customStart': '自定义起点',
                'navigation.startNav': '开始导航',
                'navigation.cancel': '取消',
                'navigation.selectStartEnd': '请选择起点和终点',
                'navigation.setCustomStart': '请先设置自定义起点',
                'navigation.noPath': '无法找到从起点到终点的路径',
                'navigation.sameStartEnd': '起点和终点不能相同',
                'navigation.noResults': '未找到匹配的建筑物',
                
                // 建筑物标签
                'building.clickForDetails': '点击查看详情',
                'building.importantBuilding': '南京大学重要建筑',
                
                // 建筑物信息面板
                'building.info.returnToView': '返回全景视角',
                'building.info.description': '简介',
                'building.info.introduction': '建筑简介',
                'building.info.features': '建筑特色',
                'building.info.history': '历史沿革',
                'building.info.functions': '主要功能',
                'building.info.data': '建筑数据',
                'building.info.year': '建成年份',
                'building.info.area': '建筑面积(㎡)',
                'building.info.floors': '楼层数',
                'building.info.capacity': '容纳人数',
                'building.info.defaultDescription': '这是南京大学的重要建筑之一，承载着深厚的历史文化底蕴。',
                'building.info.defaultFeatures': '现代化建筑设计,环保节能理念,智能化设施',
                
                // 费彝民楼
                'building.feiyimin.name': '费彝民楼',
                'building.feiyimin.subtitle': '传媒摇篮',
                'building.feiyimin.description': '南京大学费彝民楼是软件学院、新闻传播学院等学院的核心教学科研载体，以著名报人费彝民先生命名，集教学、实验、学术交流于一体，是培养软件人才、传媒等人才的重要基地。',
                'building.feiyimin.features': '全媒体实验室,高清演播厅,数字传播研究中心,多功能学术报告厅',
                'building.feiyimin.history': '费彝民楼于2006年建成启用，为纪念著名报人、社会活动家费彝民先生而命名，现为南京大学新闻传播学院所在地，见证了南大学传媒教育的快速发展。',
                'building.feiyimin.functions': '专业教学,传媒实验,学术研讨,校企合作交流',
                
                // 操作指引
                'guide.title': '操作指引',
                'guide.moveForward': '向前移动',
                'guide.moveBackward': '向后移动',
                'guide.moveLeft': '向左移动',
                'guide.moveRight': '向右移动',
                'guide.rotateLeft': '向左旋转视角',
                'guide.rotateRight': '向右旋转视角',
                'guide.lookUp': '向上看',
                'guide.lookDown': '向下看',
                'guide.showModel': '恢复模型显示',
                'guide.hideModel': '隐藏模型',
                
                // 天气名称
                'weather.sunny': '晴',
                'weather.cloudy': '阴',
                'weather.rainy': '雨',
                'weather.snowy': '雪',
                
                // 操作按钮提示词
                'tooltip.guide': '操作指引',
                'tooltip.labels': '建筑物标签',
                'tooltip.navigation': '导航功能',
                'tooltip.music': '背景音乐',
                'tooltip.aiAssistant': '小蓝鲸问答',
                'tooltip.weather': '天气效果',
                'tooltip.announcement': '公告栏',
                'tooltip.language': '语言切换',
                'tooltip.enableSound': '启用声音',
                'tooltip.skipVideo': '跳过视频',
                'tooltip.sunny': '晴天',
                'tooltip.cloudy': '阴天',
                'tooltip.rainy': '雨天',
                'tooltip.snowy': '雪天',
                
                // 输入框占位符
                'placeholder.searchStart': '搜索起点建筑物...',
                'placeholder.searchEnd': '搜索终点建筑物...',
                'placeholder.coordX': 'X坐标',
                'placeholder.coordY': 'Y坐标',
                'placeholder.coordZ': 'Z坐标',
                'placeholder.aiInput': '输入您关于NJU的问题...',
                
                // 通用
                'common.close': '关闭',
                'common.confirm': '确认',
                'common.cancel': '取消',
                'common.skip': '跳过视频',
            },
            en: {
                // Navigation system
                'navigation.title': 'Navigation Settings',
                'navigation.start': 'Select Start Point',
                'navigation.end': 'Select End Point',
                'navigation.customStart': 'Custom Start Point',
                'navigation.startNav': 'Start Navigation',
                'navigation.cancel': 'Cancel',
                'navigation.selectStartEnd': 'Please select start and end points',
                'navigation.setCustomStart': 'Please set custom start point first',
                'navigation.noPath': 'Unable to find path from start to end',
                'navigation.sameStartEnd': 'Start and end points cannot be the same',
                'navigation.noResults': 'No matching buildings found',
                
                // Building labels
                'building.clickForDetails': 'Click for Details',
                'building.importantBuilding': 'NJU Important Building',
                
                // Building info panel
                'building.info.returnToView': 'Return to Panoramic View',
                'building.info.description': 'Description',
                'building.info.introduction': 'Introduction',
                'building.info.features': 'Features',
                'building.info.history': 'History',
                'building.info.functions': 'Functions',
                'building.info.data': 'Building Data',
                'building.info.year': 'Year Built',
                'building.info.area': 'Floor Area (㎡)',
                'building.info.floors': 'Floors',
                'building.info.capacity': 'Capacity',
                'building.info.defaultDescription': 'This is one of the important buildings of Nanjing University, carrying profound historical and cultural heritage.',
                'building.info.defaultFeatures': 'Modern architectural design,Environmental protection and energy saving concept,Intelligent facilities',
                
                // Feiyimin Building
                'building.feiyimin.name': 'Feiyimin Building',
                'building.feiyimin.subtitle': 'Media Cradle',
                'building.feiyimin.description': 'Nanjing University\'s Feiyimin Building is a core teaching and research facility for the School of Software, School of Journalism and Communication, and other schools. Named after the renowned journalist Mr. Fei Yimin, it integrates teaching, experimentation, and academic exchange, serving as an important base for cultivating software and media talents.',
                'building.feiyimin.features': 'All-Media Laboratory,HD Studio,Digital Communication Research Center,Multifunctional Academic Lecture Hall',
                'building.feiyimin.history': 'The Feiyimin Building was completed and put into use in 2006, named in honor of the renowned journalist and social activist Mr. Fei Yimin. It is now the location of the School of Journalism and Communication at Nanjing University, witnessing the rapid development of media education at the university.',
                'building.feiyimin.functions': 'Professional Teaching,Media Experiments,Academic Seminars,University-Enterprise Cooperation and Exchange',
                
                // Operation Guide
                'guide.title': 'Operation Guide',
                'guide.moveForward': 'Move Forward',
                'guide.moveBackward': 'Move Backward',
                'guide.moveLeft': 'Move Left',
                'guide.moveRight': 'Move Right',
                'guide.rotateLeft': 'Rotate View Left',
                'guide.rotateRight': 'Rotate View Right',
                'guide.lookUp': 'Look Up',
                'guide.lookDown': 'Look Down',
                'guide.showModel': 'Show Model',
                'guide.hideModel': 'Hide Model',
                
                // Weather Names
                'weather.sunny': 'Sunny',
                'weather.cloudy': 'Cloudy',
                'weather.rainy': 'Rainy',
                'weather.snowy': 'Snowy',
                
                // Tooltips
                'tooltip.guide': 'Operation Guide',
                'tooltip.labels': 'Building Labels',
                'tooltip.navigation': 'Navigation',
                'tooltip.music': 'Background Music',
                'tooltip.aiAssistant': 'AI Assistant',
                'tooltip.weather': 'Weather Effects',
                'tooltip.announcement': 'Announcements',
                'tooltip.language': 'Language',
                'tooltip.enableSound': 'Enable Sound',
                'tooltip.skipVideo': 'Skip Video',
                'tooltip.sunny': 'Sunny',
                'tooltip.cloudy': 'Cloudy',
                'tooltip.rainy': 'Rainy',
                'tooltip.snowy': 'Snowy',
                
                // Placeholders
                'placeholder.searchStart': 'Search start building...',
                'placeholder.searchEnd': 'Search end building...',
                'placeholder.coordX': 'X Coordinate',
                'placeholder.coordY': 'Y Coordinate',
                'placeholder.coordZ': 'Z Coordinate',
                'placeholder.aiInput': 'Enter your question about NJU...',
                
                // Common
                'common.close': 'Close',
                'common.confirm': 'Confirm',
                'common.cancel': 'Cancel',
                'common.skip': 'Skip Video',
            },
            ru: {
                // Система навигации
                'navigation.title': 'Настройки навигации',
                'navigation.start': 'Выберите начальную точку',
                'navigation.end': 'Выберите конечную точку',
                'navigation.customStart': 'Пользовательская начальная точка',
                'navigation.startNav': 'Начать навигацию',
                'navigation.cancel': 'Отмена',
                'navigation.selectStartEnd': 'Пожалуйста, выберите начальную и конечную точки',
                'navigation.setCustomStart': 'Пожалуйста, сначала установите пользовательскую начальную точку',
                'navigation.noPath': 'Не удалось найти путь от начала до конца',
                'navigation.sameStartEnd': 'Начальная и конечная точки не могут быть одинаковыми',
                'navigation.noResults': 'Совпадающих зданий не найдено',
                
                // Метки зданий
                'building.clickForDetails': 'Нажмите для подробностей',
                'building.importantBuilding': 'Важное здание Нанкинского университета',
                
                // Панель информации о здании
                'building.info.returnToView': 'Вернуться к панорамному виду',
                'building.info.description': 'Описание',
                'building.info.introduction': 'Введение',
                'building.info.features': 'Особенности',
                'building.info.history': 'История',
                'building.info.functions': 'Функции',
                'building.info.data': 'Данные о здании',
                'building.info.year': 'Год постройки',
                'building.info.area': 'Площадь (㎡)',
                'building.info.floors': 'Этажи',
                'building.info.capacity': 'Вместимость',
                'building.info.defaultDescription': 'Это одно из важных зданий Нанкинского университета, несущее глубокое историческое и культурное наследие.',
                'building.info.defaultFeatures': 'Современный архитектурный дизайн,Концепция защиты окружающей среды и энергосбережения,Интеллектуальные объекты',
                
                // Здание Фэйимин
                'building.feiyimin.name': 'Здание Фэйимин',
                'building.feiyimin.subtitle': 'Колыбель СМИ',
                'building.feiyimin.description': 'Здание Фэйимин Нанкинского университета является основным учебно-исследовательским объектом для Школы программного обеспечения, Школы журналистики и коммуникации и других школ. Названо в честь известного журналиста г-на Фэй Иминя, объединяет преподавание, эксперименты и академический обмен, служит важной базой для подготовки талантов в области программного обеспечения и СМИ.',
                'building.feiyimin.features': 'Мультимедийная лаборатория,HD студия,Центр исследования цифровой коммуникации,Многофункциональный академический лекционный зал',
                'building.feiyimin.history': 'Здание Фэйимин было построено и введено в эксплуатацию в 2006 году, названо в честь известного журналиста и общественного деятеля г-на Фэй Иминя. В настоящее время здесь находится Школа журналистики и коммуникации Нанкинского университета, что свидетельствует о быстром развитии медиаобразования в университете.',
                'building.feiyimin.functions': 'Профессиональное преподавание,Медиа-эксперименты,Академические семинары,Университетско-предпринимательское сотрудничество и обмен',
                
                // Руководство по эксплуатации
                'guide.title': 'Руководство по эксплуатации',
                'guide.moveForward': 'Движение вперед',
                'guide.moveBackward': 'Движение назад',
                'guide.moveLeft': 'Движение влево',
                'guide.moveRight': 'Движение вправо',
                'guide.rotateLeft': 'Поворот камеры влево',
                'guide.rotateRight': 'Поворот камеры вправо',
                'guide.lookUp': 'Смотреть вверх',
                'guide.lookDown': 'Смотреть вниз',
                'guide.showModel': 'Показать модель',
                'guide.hideModel': 'Скрыть модель',
                
                // Названия погоды
                'weather.sunny': 'Солнечно',
                'weather.cloudy': 'Облачно',
                'weather.rainy': 'Дождь',
                'weather.snowy': 'Снег',
                
                // Подсказки
                'tooltip.guide': 'Руководство по эксплуатации',
                'tooltip.labels': 'Метки зданий',
                'tooltip.navigation': 'Навигация',
                'tooltip.music': 'Фоновая музыка',
                'tooltip.aiAssistant': 'ИИ-помощник',
                'tooltip.weather': 'Погодные эффекты',
                'tooltip.announcement': 'Объявления',
                'tooltip.language': 'Язык',
                'tooltip.enableSound': 'Включить звук',
                'tooltip.skipVideo': 'Пропустить видео',
                'tooltip.sunny': 'Солнечно',
                'tooltip.cloudy': 'Облачно',
                'tooltip.rainy': 'Дождливо',
                'tooltip.snowy': 'Снежно',
                
                // Плейсхолдеры
                'placeholder.searchStart': 'Поиск начального здания...',
                'placeholder.searchEnd': 'Поиск конечного здания...',
                'placeholder.coordX': 'Координата X',
                'placeholder.coordY': 'Координата Y',
                'placeholder.coordZ': 'Координата Z',
                'placeholder.aiInput': 'Введите ваш вопрос о Нанкинском университете...',
                
                // Общее
                'common.close': 'Закрыть',
                'common.confirm': 'Подтвердить',
                'common.cancel': 'Отмена',
                'common.skip': 'Пропустить видео',
            },
            ko: {
                // 내비게이션 시스템
                'navigation.title': '내비게이션 설정',
                'navigation.start': '출발지 선택',
                'navigation.end': '도착지 선택',
                'navigation.customStart': '사용자 지정 출발지',
                'navigation.startNav': '내비게이션 시작',
                'navigation.cancel': '취소',
                'navigation.selectStartEnd': '출발지와 도착지를 선택하세요',
                'navigation.setCustomStart': '먼저 사용자 지정 출발지를 설정하세요',
                'navigation.noPath': '출발지에서 도착지까지 경로를 찾을 수 없습니다',
                'navigation.sameStartEnd': '출발지와 도착지는 같을 수 없습니다',
                'navigation.noResults': '일치하는 건물을 찾을 수 없습니다',
                
                // 건물 라벨
                'building.clickForDetails': '자세히 보기',
                'building.importantBuilding': '난징대학 중요 건물',
                
                // 건물 정보 패널
                'building.info.returnToView': '전경 보기로 돌아가기',
                'building.info.description': '설명',
                'building.info.introduction': '건물 소개',
                'building.info.features': '건물 특징',
                'building.info.history': '역사',
                'building.info.functions': '주요 기능',
                'building.info.data': '건물 데이터',
                'building.info.year': '건축 연도',
                'building.info.area': '건축 면적(㎡)',
                'building.info.floors': '층수',
                'building.info.capacity': '수용 인원',
                'building.info.defaultDescription': '이것은 난징대학의 중요한 건물 중 하나로, 깊은 역사와 문화적 유산을 담고 있습니다.',
                'building.info.defaultFeatures': '현대적 건축 디자인,환경 보호 및 에너지 절약 개념,지능형 시설',
                
                // 페이이민 빌딩
                'building.feiyimin.name': '페이이민 빌딩',
                'building.feiyimin.subtitle': '미디어 요람',
                'building.feiyimin.description': '난징대학 페이이민 빌딩은 소프트웨어 학원, 뉴스미디어 학원 등 학원의 핵심 교학 과학 연구 시설로, 유명한 언론인 페이이민 선생님의 이름을 따서 명명되었으며, 교학, 실험, 학술 교류를 통합하여 소프트웨어 인재 및 미디어 인재를 양성하는 중요한 기지입니다.',
                'building.feiyimin.features': '올미디어 실험실,HD 스튜디오,디지털 전파 연구 센터,다기능 학술 강당',
                'building.feiyimin.history': '페이이민 빌딩은 2006년에 완공되어 사용되기 시작했으며, 유명한 언론인이자 사회활동가인 페이이민 선생님을 기념하여 명명되었습니다. 현재 난징대학 뉴스미디어 학원의 소재지로, 난징대학 미디어 교육의 급속한 발전을 목격했습니다.',
                'building.feiyimin.functions': '전문 교학,미디어 실험,학술 세미나,학교-기업 협력 교류',
                
                // 작동 가이드
                'guide.title': '작동 가이드',
                'guide.moveForward': '앞으로 이동',
                'guide.moveBackward': '뒤로 이동',
                'guide.moveLeft': '왼쪽으로 이동',
                'guide.moveRight': '오른쪽으로 이동',
                'guide.rotateLeft': '시야 왼쪽 회전',
                'guide.rotateRight': '시야 오른쪽 회전',
                'guide.lookUp': '위로 보기',
                'guide.lookDown': '아래로 보기',
                'guide.showModel': '모델 표시',
                'guide.hideModel': '모델 숨기기',
                
                // 날씨 이름
                'weather.sunny': '맑음',
                'weather.cloudy': '흐림',
                'weather.rainy': '비',
                'weather.snowy': '눈',
                
                // 도구 설명
                'tooltip.guide': '작동 가이드',
                'tooltip.labels': '건물 라벨',
                'tooltip.navigation': '내비게이션',
                'tooltip.music': '배경 음악',
                'tooltip.aiAssistant': 'AI 어시스턴트',
                'tooltip.weather': '날씨 효과',
                'tooltip.announcement': '공지사항',
                'tooltip.language': '언어',
                'tooltip.enableSound': '소리 켜기',
                'tooltip.skipVideo': '비디오 건너뛰기',
                'tooltip.sunny': '맑음',
                'tooltip.cloudy': '흐림',
                'tooltip.rainy': '비',
                'tooltip.snowy': '눈',
                
                // 플레이스홀더
                'placeholder.searchStart': '출발지 건물 검색...',
                'placeholder.searchEnd': '도착지 건물 검색...',
                'placeholder.coordX': 'X 좌표',
                'placeholder.coordY': 'Y 좌표',
                'placeholder.coordZ': 'Z 좌표',
                'placeholder.aiInput': 'NJU에 대한 질문을 입력하세요...',
                
                // 공통
                'common.close': '닫기',
                'common.confirm': '확인',
                'common.cancel': '취소',
                'common.skip': '비디오 건너뛰기',
            }
        };
    }

    /**
     * 设置当前语言
     * @param {string} lang - 语言代码 ('zh', 'en', 'ru', 'ko')
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            // 触发语言变更事件
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            }
            return true;
        }
        console.warn(`Unsupported language: ${lang}`);
        return false;
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键
     * @param {object} params - 参数对象（可选）
     * @returns {string} 翻译后的文本
     */
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                           this.translations['zh']?.[key] || 
                           key;
        
        // 替换参数
        let result = translation;
        for (const [paramKey, paramValue] of Object.entries(params)) {
            result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
        }
        
        return result;
    }

    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 获取建筑物的翻译信息
     * @param {object} building - 建筑物对象
     * @returns {object} 包含翻译后的建筑物信息
     */
    getBuildingTranslation(building) {
        if (!building) return building;
        
        const translated = { ...building };
        
        // 如果是费彝民楼，使用翻译
        if (building.name === '费彝民楼') {
            const lang = this.currentLanguage;
            if (lang !== 'zh') {
                // 使用翻译
                translated.subtitle = this.t('building.feiyimin.subtitle');
                translated.description = this.t('building.feiyimin.description');
                const featuresStr = this.t('building.feiyimin.features');
                translated.features = featuresStr ? featuresStr.split(',') : building.features;
                // 翻译history
                if (building.history) {
                    translated.history = this.t('building.feiyimin.history');
                }
                // 翻译functions
                if (building.functions) {
                    const functionsStr = this.t('building.feiyimin.functions');
                    translated.functions = functionsStr ? functionsStr.split(',') : building.functions;
                }
            }
            // 中文使用原始数据
        }
        
        return translated;
    }

    /**
     * 获取支持的语言列表
     * @returns {Array} 语言列表
     */
    getSupportedLanguages() {
        return [
            { code: 'zh', name: '中文', nativeName: '中文' },
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ru', name: 'Русский', nativeName: 'Русский' },
            { code: 'ko', name: '한국어', nativeName: '한국어' }
        ];
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.i18n = new I18n();
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}

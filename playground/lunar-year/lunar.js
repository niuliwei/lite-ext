//modified from http://blog.csdn.net/sYwb/archive/2005/04/05/337172.aspx
//��ʾ��ǰ���ڵ�������  Edit By R.W. (2004��12��24�� ������)
/*
 ========ԭ��˵����===================
 http://search.csdn.net/Expert/topic/974/974567.xml?temp=.8316614
 ���ȣ����湫��ũ��֮���ת����Ϣ:������һ����Ϊ��㣬
 �Ѵ���һ����������(����Ҫ����)��ũ����Ϣ����������
 Ҫ����һ�����Ϣ��ֻҪ������Ϣ�͹���:
 1)ũ��ÿ���µĴ�С;2)�����Ƿ������£������Լ����µĴ�С��

 ��һ��������������Щ��Ϣ���㹻�ˡ�
 ����ķ�����:��һλ����ʾһ���µĴ�С�����¼�Ϊ1��С�¼�Ϊ0��
 �������õ�12λ(������)��13λ(������)�����ø���λ����ʾ���µ��·ݣ�û�����¼�Ϊ0��

 ��-----��----:
 2000�����Ϣ������0xc96�����ɶ����ƾ���110010010110B��
 ��ʾ�ĺ�����:1��2��5��8��10��11�´������·�С��
 2001���ũ����Ϣ������0x1a95(��Ϊ���£�������13λ)��
 ����ľ���1��2��4��5��8��10��12�´�
 �����·�С(0x1a95=1101010010101B)��
 4�µĺ�����һ��0��ʾ������4��С�����ŵ��Ǹ�1��ʾ5�´�

 �����Ϳ�����һ��������������Щ��Ϣ��������������CalendarDate[]��������Щ��Ϣ��

 �������㷨:
 1�����㴦����ʱ�䵽��ʼ�����³�һ��������
 2������ʼ��ݿ�ʼ����ȥÿһ�µ�������һֱ��ʣ�������û����һ����Ϊֹ��
 ��ʱ��CalendarDate[]���±굽�˶��٣����Ǽ�ȥ�˶����꣬
 ����ʼ��ݼ�������±�Ϳ��Եõ�ũ����ݣ�Ȼ�󿴼�ȥ�˼����¡�
 ������겻���»������»��ں��棬�Ϳ���ֱ�ӵõ�ũ���·ݣ���������·�������һ���£�
 ������¾������£���������µĺ��棬��Ҫ��ȥ1���ܵõ��·�����ʣ�����������ũ���գ�
 ũ��ʱ��(����ʱ+1)/2�Ϳ��Լ򵥵ĵõ��ˡ�

 */
var getLunarDay = function () {
    var BASE_DATE = new Date(2001, 0, 1),
        BASE_YEAR = 2001,
        BASE_TG = 3,
        BASE_DZ = 7,
        BASE_SX = 7,
        DAY_MILLI = 3600 * 24 * 1000,
        SPRING_2001_DIFF = 22,
        LEAP_YEAR = 0xFFF,
        SMALL_MONTH_DAYS = 29,
        BIG_MONTH_DAYS = 30,
        LEAP_MONTH = 0x10000,
        CANLENDAR_DATA = new Array(100),
        MONTH_START_DAY = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        TG_STRING = "���ұ����켺�����ɹ�",
        TG_CYCLE = TG_STRING.length,
        DZ_STRING = "�ӳ���î������δ�����纥",
        DZ_CYCLE = DZ_STRING.length,
        NUM_STRING = "��һ�����������߰˾�ʮ",
        MONTH_STRING = "�������������߰˾�ʮ����",
        WEEK_STRING = "��һ����������",
        SX = "��ţ������������Ｆ����",
        LUNAR_DAY_LESS_THEN_10 = "��",
        LUNAR_DAY_10 = "ʮ",
        LUNAR_DAY_20 = "إ",
        LUNAR_DAY_20_EXACT = "��ʮ",
        LUNAR_DAY_30 = "��ʮ",
        WEEK = "��",
        SXCycle = SX.length,
        CANLENDAR_DATA = [
            //0xA4B,0x5164B,0x6A5,0x6D4,0x415B5,0x2B6,0x957,0x2092F,0x497,0x60C96,    // 1921-1930
            //0xD4A,0xEA5,0x50DA9,0x5AD,0x2B6,0x3126E, 0x92E,0x7192D,0xC95,0xD4A,     // 1931-1940
            //0x61B4A,0xB55,0x56A,0x4155B, 0x25D,0x92D,0x2192B,0xA95,0x71695,0x6CA,   // 1941-1950
            //0xB55,0x50AB5,0x4DA,0xA5B,0x30A57,0x52B,0x8152A,0xE95,0x6AA,0x615AA,    // 1951-1960
            //0xAB5,0x4B6,0x414AE,0xA57,0x526,0x31D26,0xD95,0x70B55,0x56A,0x96D,      // 1961-1970
            //0x5095D,0x4AD,0xA4D,0x41A4D,0xD25,0x81AA5, 0xB54,0xB6A,0x612DA,0x95B,   // 1971-1980
            //0x49B,0x41497,0xA4B,0xA164B, 0x6A5,0x6D4,0x615B4,0xAB6,0x957,0x5092F,   // 1981-1990
            //0x497,0x64B, 0x30D4A,0xEA5,0x80D65,0x5AC,0xAB6,0x5126D,0x92E,0xC96,     // 1991-2000
            0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, // 2001-2010
            0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95]; // 2011-2020
    //0:С��,1:����


    function getBit(m, n) {
        return (m >> n) & 1;
    }

    function numToCh(num) {
        num = num + "";
        var re = "";
        for (var i = 0; i < num.length; i++) {
            re += NUM_STRING.charAt(parseInt(num.charAt(i)));
        }
        return re;
    }

    //�õ� Date ��Ӧ��ũ����ʾ


    function e2c(theDate) {
        var total, m, n, k, cYear, cMonth, cDay, isEnd = false,
            total = (theDate - BASE_DATE) / DAY_MILLI - SPRING_2001_DIFF;
        for (m = 0; ; m++) {
            k = (CANLENDAR_DATA[m] < LEAP_YEAR) ? 11 : 12;
            for (n = k; n >= 0; n--) {
                if (total <= SMALL_MONTH_DAYS + getBit(CANLENDAR_DATA[m], n)) {
                    isEnd = true;
                    break;
                }
                total = total - SMALL_MONTH_DAYS - getBit(CANLENDAR_DATA[m], n);
            }
            if (isEnd) break;
        }
        cYear = BASE_YEAR + m;
        cMonth = k - n + 1;
        cDay = total;
        if (k == 12) {
            if (cMonth == Math.floor(CANLENDAR_DATA[m] / LEAP_MONTH) + 1) {
                cMonth = 1 - cMonth;
            }
            if (cMonth > Math.floor(CANLENDAR_DATA[m] / LEAP_MONTH) + 1) {
                cMonth--;
            }
        }
        var lunarDate = getcDate(cYear, cMonth, cDay);
        lunarDate.weekDay = WEEK + WEEK_STRING.charAt(theDate.getDay());
        return lunarDate;
    }

    //ũ�����ڵ����ı�ʾ


    function getcDate(cYear, cMonth, cDay) {
        var tmp = {};
        tmp.year = numToCh(cYear);
        tmp.tg = TG_STRING.charAt((cYear - BASE_YEAR - BASE_TG + TG_CYCLE) % TG_CYCLE); //���
        tmp.dz = DZ_STRING.charAt((cYear - BASE_YEAR - BASE_DZ + DZ_CYCLE) % DZ_CYCLE); //��֧
        tmp.sx = SX.charAt((cYear - BASE_YEAR - BASE_SX + SXCycle) % SXCycle);
        if (cMonth < 1) {
            tmp.leap = true;
            tmp.month = MONTH_STRING.charAt(-cMonth - 1);
        } else {
            tmp.month = MONTH_STRING.charAt(cMonth - 1);
        }
        tmp.day = (cDay < 11) ? LUNAR_DAY_LESS_THEN_10 : ((cDay < 20) ? LUNAR_DAY_10 : ((cDay < 30) ? LUNAR_DAY_20 : LUNAR_DAY_30));
        /*ئ*/
        if (cDay == 10) {
            tmp.day += LUNAR_DAY_10;
        } else if (cDay == 20) {
            tmp.day = LUNAR_DAY_20_EXACT
        }
        else if (cDay !== 30) {
            tmp.day += NUM_STRING.charAt((cDay) % 10);
        }
        return tmp;
    }

    /*
     ����ת��ũ��
     @param solarYear{Number} ������
     @param solarYear{Number} ������
     @param solarYear{Number} ������
     @return {object} ��Ӧ�ù������ڵ�����ũ����ʾ
     {
     tg:{String} ���
     dz:{String} ��֧
     sx:{String} ����
     leap:{Boolean} �Ƿ�����(��),
     weekDay:{String} �������ı�ʾ,
     year: {String} �����ı�ʾ,
     month:{String} �����ı�ʾ,
     day:{String} �����ı�ʾ,
     }
     ���磺
     getLunarDay(2001, 5, 23):
     {
     year : "������һ",
     tg : "��",
     dz : "��",
     sx : "��",
     leap : true,
     month : "��",
     day : "��һ",
     weekDay : "����"
     }
     */
    return function (solarYear, solarMonth, solarDay) {
        if (Object.prototype.toString.call(solarYear) === '[object Date]')
            return e2c(new Date(solarYear.getFullYear(), solarYear.getMonth(), solarYear.getDate()));
        if (solarYear < 2001 || solarYear > 2020) {
            return ""; //��ݲ���1921-2020��Χ���޷���á�
        } else {
            return e2c(new Date(solarYear, solarMonth - 1, solarDay));
        }
    }
}();
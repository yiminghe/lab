/**
 * lunar calendar for kissy
 * @author yiminghe@gmail.com(chengyu)
 */
//modified from http://blog.csdn.net/sYwb/archive/2005/04/05/337172.aspx
//显示当前日期的阴阳历
/*
 ========原理说明：===================
 http://search.csdn.net/Expert/topic/974/974567.xml?temp=.8316614
 首先，保存公历农历之间的转换信息:以任意一年作为起点，
 把从这一年起若干年(依需要而定)的农历信息保存起来。
 要保存一年的信息，只要两个信息就够了:
 1)农历每个月的大小;2)今年是否有闰月，闰几月以及闰月的大小。

 用一个整数来保存这些信息就足够了。
 具体的方法是:用一位来表示一个月的大小，大月记为1，小月记为0，
 这样就用掉12位(无闰月)或13位(有闰月)，再用高四位来表示闰月的月份，没有闰月记为0。

 ※-----例----:
 2000年的信息数据是0xc96，化成二进制就是110010010110B，
 表示的含义是:1、2、5、8、10、11月大，其余月份小。
 2001年的农历信息数据是0x1a95(因为闰月，所以有13位)，
 具体的就是1、2、4、5、8、10、12月大，
 其余月份小(0x1a95=1101010010101B)，
 4月的后面那一个0表示的是闰4月小，接着的那个1表示5月大。

 这样就可以用一个数组来保存这些信息。在这里用数组CalendarDate[]来保存这些信息。

 ※具体算法:
 1。计算处所求时间到起始年正月初一的天数。
 2。从起始年份开始，减去每一月的天数，一直到剩余的天数没有下一个多为止。
 此时，CalendarDate[]的下标到了多少，就是减去了多少年，
 用起始年份加上这个下标就可以得到农历年份，然后看减去了几个月。
 如果本年不闰月或者闰月还在后面，就可以直接得到农历月份，如果在闰月份数后面一个月，
 则这个月就是闰月，如果在闰月的后面，则要减去1才能得到月份数。剩余的天数就是农历日，
 农历时用(公历时+1)/2就可以简单的得到了。

 */

(function (T) {
  var BASE_DATE = new Date(2001, 0, 1),
    BASE_YEAR = 2001,
    BASE_TG = 3,
    BASE_DZ = 7,
    BASE_SX = 7,
    DAY_MILLI = 3600 * 24 * 1000,
    SPRING_2001_DIFF = 22,
    LEAP_YEAR = 0xfff,
    SMALL_MONTH_DAYS = 29,
    LEAP_MONTH = 0x10000,
    TG_STRING = '甲乙丙丁戊己庚辛壬癸',
    TG_CYCLE = TG_STRING.length,
    DZ_STRING = '子丑寅卯辰巳午未申酉戌亥',
    DZ_CYCLE = DZ_STRING.length,
    NUM_STRING = '零一二三四五六七八九十',
    MONTH_STRING = '正二三四五六七八九十冬腊',
    WEEK_STRING = '日一二三四五六',
    SX = '鼠牛虎兔龙蛇马羊猴鸡狗猪',
    LUNAR_DAY_LESS_THEN_10 = '初',
    LUNAR_DAY_10 = '十',
    LUNAR_DAY_20 = '廿',
    LUNAR_DAY_30 = '三十',
    LUNAR_DAY_20_EXACT = '二十',
    WEEK = '周',
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
      0x41a95,
      0xd4a,
      0xda5,
      0x20b55,
      0x56a,
      0x7155b,
      0x25d,
      0x92d,
      0x5192b,
      0xa95, // 2001-2010
      0xb4a,
      0x416aa,
      0xad5,
      0x90ab5,
      0x4ba,
      0xa5b,
      0x60a57,
      0x52b,
      0xa93,
      0x40e95,
    ]; // 2011-2020
  //0:小月,1:大月

  function getBit(m, n) {
    return (m >> n) & 1;
  }

  function numToCh(num) {
    num = num + '';
    var re = '';
    for (var i = 0; i < num.length; i++) {
      re += NUM_STRING.charAt(parseInt(num.charAt(i)));
    }
    return re;
  }

  //得到 Date 对应的农历表示

  function e2c(theDate) {
    var total,
      m,
      n,
      k,
      cYear,
      cMonth,
      cDay,
      isEnd = false;
    total = (theDate - BASE_DATE) / DAY_MILLI - SPRING_2001_DIFF;
    for (m = 0; ; m++) {
      k = CANLENDAR_DATA[m] < LEAP_YEAR ? 11 : 12;
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

  //农历日期的中文表示

  function getcDate(cYear, cMonth, cDay) {
    var tmp = {};
    tmp.year = numToCh(cYear);
    tmp.tg = TG_STRING.charAt(
      (cYear - BASE_YEAR - BASE_TG + TG_CYCLE) % TG_CYCLE,
    ); //年干
    tmp.dz = DZ_STRING.charAt(
      (cYear - BASE_YEAR - BASE_DZ + DZ_CYCLE) % DZ_CYCLE,
    ); //年支
    tmp.sx = SX.charAt((cYear - BASE_YEAR - BASE_SX + SXCycle) % SXCycle);
    if (cMonth < 1) {
      tmp.leap = true;
      tmp.month = MONTH_STRING.charAt(-cMonth - 1);
    } else {
      tmp.month = MONTH_STRING.charAt(cMonth - 1);
    }
    tmp.day =
      cDay < 11
        ? LUNAR_DAY_LESS_THEN_10
        : cDay < 20
        ? LUNAR_DAY_10
        : cDay < 30
        ? LUNAR_DAY_20
        : LUNAR_DAY_30;
    /*卅*/
    if (cDay == 10) {
      tmp.day += LUNAR_DAY_10;
    } else if (cDay == 20) {
      tmp.day = LUNAR_DAY_20_EXACT;
    } else if (cDay !== 30) {
      tmp.day += NUM_STRING.charAt(cDay % 10);
    }

    return tmp;
  }

  /*
     公历转换农历
     @param solarYear{Number} 公历年
     @param solarYear{Number} 公历年
     @param solarYear{Number} 公历年
     @return {object} 对应该公历日期的中文农历表示
     {
     tg:{String} 天干
     dz:{String} 地支
     sx:{String} 属相
     leap:{Boolean} 是否闰月(后),
     weekDay:{String} 星期中文表示,
     year: {String} 年中文表示,
     month:{String} 月中文表示,
     day:{String} 日中文表示,
     }
     例如：
     getLunarDay(2001, 5, 23):
     {
     year : "二零零一",
     tg : "辛",
     dz : "巳",
     sx : "蛇",
     leap : true,
     month : "四",
     day : "初一",
     weekDay : "周三"
     }
     */
  T.getLunarDay = function (solarYear, solarMonth, solarDay) {
    if (Object.prototype.toString.call(solarYear) === '[object Date]')
      return e2c(
        new Date(
          solarYear.getFullYear(),
          solarYear.getMonth(),
          solarYear.getDate(),
        ),
      );
    if (solarYear < 2001 || solarYear > 2020) {
      return ''; //年份不在1921-2020范围，无法获得。
    } else {
      return e2c(new Date(solarYear, solarMonth - 1, solarDay));
    }
  };
})(KISSY);

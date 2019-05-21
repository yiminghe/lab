
/*
    地图字典
*/
function MapConfig(GraphicUtils) {
  var MAPS = [
    //关数
    ["BBBBBBBBBBBBBBBBB***", "B******A*B**A***B***", "B*BBBBBB*B*B*BB*B***", "BA*******B*B*BB*B***", "B*BBBBBB*BA****AB***", "BA******AB*BBBB*B***", "B*BBBBBB**A*****B***", "BA******ABBBBB**B***", "B*************A*B***", "BBBBBBBBBBBBBBBBB***"],
    ["DDDDDDDDDDDDDDDDD***", "D*******A*******D***", "D*DDDDDD*DDDDDD*D***", "DA*****AAA*****AD***", "D*DDDDD*D*DDDDD*D***", "DA****D*D*D****AD***", "D*DDD*D*D*D*DDD*D***", "D***D*D*D*D*D***D***", "D****A*A*A*A**A*D***", "DDDDDDDDDDDDDDDDD***"],
    ["CCCCCCCCCCCCCCCCC***", "C*A*****A*****A*C***", "C**BBBBB*BBBBB**C***", "CAA*A***A***A*AAC***", "C**B*CCCCCCC*B**C***", "C**B*CCCCCCC*B**C***", "CAA*A***A***A*AAC***", "C**BBBBB*BBBBB**C***", "C*A*****A*****A*C***", "CCCCCCCCCCCCCCCCC***"],
    ["BBBBBBBBBBBBBBBBB***", "B**A****A****A**B***", "B*C*CCC***CCC*C*B***", "B*C*****B*****C*B***", "B*C**BBBBBBB**C*B***", "B*C*****B*****C*B***", "BA*A****B***A**AB***", "B*CCCCC*C*CCCCC*B***", "B******A*A******B***", "BBBBBBBBBBBBBBBBB***"],
    ["DDDDDDDDDDDDDDDDD***", "C***A*******A***C***", "C**B*********B**C***", "C**B*DDDDDDD*B**C***", "CA**A**A*A**A**AC***", "C*A****A*A****A*C***", "C*BBBBB*B*BBBBB*C***", "CA*****A*A*****AC***", "C**BBB*****BBB**C***", "DDDDDDDDDDDDDDDDD***"],
    ["BBBBBBBBBBBBBBBBB***", "B***A*A**C***B**B***", "B*B**B*B*C***B**B***", "B*B**B*B*C*****AB***", "B*B**B*B*C*BBBB*B***", "BA**A*AB*CA****AB***", "B*DDDD*B*C**BB**B***", "B*DDDD*B****BB**B***", "B*****A*A*A***A*B***", "BBBBBBBBBBBBBBBBB***"],
    ["CCCCCCCCCCCCCCCCC***", "C**E****A****E**C***", "C**E*EEE*EEE*E**C***", "C**EA**AAA**AE**C***", "C**E*EE***EE*E**C***", "CAA*AEE*E*EEA*AAC***", "C**E*EE*E*EE*E**C***", "C**EA**A*A**AE**C***", "C*A*AEE***EEA*A*C***", "CCCCCCCCCCCCCCCCC***"],
    ["CCCCCCCCCCCCCCCCC***", "D***A*A***A*A***D***", "D*BB*B*EEE*B*BB*D***", "D*BB*B*EEE*B*BB*D***", "DA**A*AA*AA*A**AD***", "D***BBB*D*BBB***D***", "D***BBB*D*BBB***D***", "D*CA***A*A***AC*D***", "D**A***BBB***A**D***", "CCCCCCCCCCCCCCCCC***"],
    ["BCCCCCCCCCCCCCCCC***", "B***A**A*****A**E***", "B*E****ACCCCCA**E***", "B*EEEEE*C*A*C*D*E***", "BA*A**E*C***C*D*E***", "BA*AB*E*C*B*C*D*E***", "B*E*B*****B*C*D*E***", "B*E*BBBBBBBA*A*AE***", "B**A*********A**E***", "DDDDDDDDDDDDDDDDE***"],
    ["CCCCCCCCCCCCCCCCC***", "C**A******A**A**C***", "CA**BBBBBBBBB**AC***", "C**A*********A**C***", "C*B**BBBBBBB**B*C***", "C*BA*********AB*C***", "C*B*BBBBBBBBB*B*C***", "C***************C***", "C**A****A****A**C***", "CCCCCCCCCCCCCCCCC***"],
    ["BBBBBBBBBBBBBBBBB***", "B*****A*A*A*****B***", "B*CCCC*C*C*CCCC*B***", "BA****AC*CA*A**AB***", "B*CCCC*C*C*C**C*B***", "B*CCCC*C*C*C**C*B***", "BA****AC*CA**A*AB***", "B*CCCC*C*C*CCCC*B***", "B*****A*A*A*****B***", "BBBBBBBBBBBBBBBBB***"],
    ["DDDDDDDDDDDDDDDDD***", "E****A**A*A*A*A*E***", "E*BBB**E*****B**E***", "EA*****E*****B**E***", "E*BBB**AAAEEA*A*E***", "EA*A*A*AAA******E***", "E*B**EE**E**BBB*E***", "E*B******E*****AE***", "E***A***A**A*A**E***", "BBBBBBBBBBBBBBBBB***"],
    ["BBBBBBBBBBBBBBBBB***", "D***A**A*A******B***", "D**B*B**B*BBBBB*B***", "D*BB*BB*BA**A**AB***", "DA**A**AB**B*B**B***", "DA**A**AB*BB*BB*B***", "D*BB*BB*BAA*A***B***", "D**B*B**B**BBB**B***", "D***A**A*A******B***", "CCCCCCCCCCCCCCCCC***"],
    ["CCCCCCCCCCCCCCCCC***", "C**A**A***A**A**C***", "C***B***B***B***C***", "CA**A***A***A**AC***", "C*BAAABAAABAAAB*C***", "CA**A*A*A*A*A**AC***", "C***BAAABAAAB***C***", "C*****C***C*****C***", "C**A*A*****A*A**C***", "CCCCCCCCCCCCCCCCC***"],
    ["BBBBBBBBBBBBBBBBB***", "B**A*A*A*A*A*A**B***", "B*E*E*E*E*E*E*E*B***", "BA*A*********A*AB***", "B*E*E*E*E*E*E*E*B***", "BA*A***A*A***A*AB***", "B*E*E*E*E*E*E*E*B***", "BA*A*A*A*A*A*A*AB***", "B**A***A****A***B***", "BBBBBBBBBBBBBBBBB***"]

  ];
  var mapGen = {
    'B': GraphicUtils.drawBrick.bind(GraphicUtils),
    'C': GraphicUtils.drawStroke.bind(GraphicUtils),
    'D': GraphicUtils.drawPlate.bind(GraphicUtils),
    '*'() {
    },
    'A'() {
    }
    //,'A':drawPlate
  };
  return {
    /**
     插入关卡
     @map:关
     **/
    insertMap(map) {
      MAPS[MAPS.length] = map;
    },
    /**
     @gen{Function} 对应关标志处理函数
     **/
    insertGens(gen) {
      mapGen = {
        ...mapGen,
        ...gen,
      }
    },
    getLevel(level) {
      return MAPS[level];
    },
    isMapEmpty(level, x, y) {
      var rows = MAPS[level];
      return rows[y][x] === "*" || rows[y][x] === "A";
    },
    isThinkPoint(level, x, y) {
      var rows = MAPS[level];
      return rows[y][x] === "A";
    },
    getLevels() {
      return MAPS.length;
    },
    /**
     选择制定关卡
     **/
    drawMap(level) {
      var cx = 0;
      var cy = 0;
      GraphicUtils.unDraw(cx, cy, 8 * 17);
      var rows = MAPS[level];
      for (cx = 0; cx < rows.length; cx++) {
        var row = rows[cx];
        for (cy = 0; cy < row.length; cy++) {
          var cell = row.charAt(cy);
          var p = mapGen[cell] || mapGen['B'];
          p(cy, cx);
        }
      }
    }
  };
}

export default MapConfig;

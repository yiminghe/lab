/**
 * Created by Shuilan on 14-9-11.
 */
KISSY.add(function (S) {
  //r : 斜边 Hypotenuse
  //a : 临边 Adjacent
  //o : 对边 Opposite
  //d : 角度

  return {
    /**
     * 对边
     * @param params
     * @returns {number}
     * @private
     */
    getOpposite: function (params) {
      if (params.r) {
        return (
          Math.round(params.r * Math.sin((params.d / 180) * Math.PI) * 100) /
          100
        );
      } else if (params.a) {
        return (
          Math.round(params.a * Math.tan((params.d / 180) * Math.PI) * 100) /
          100
        );
      }
      return 0;
    },

    /**
     * 临边
     * @param params
     * @returns {number}
     * @private
     */
    getAdjacent: function (params) {
      if (params.r) {
        return (
          Math.round(params.r * Math.cos((params.d / 180) * Math.PI) * 100) /
          100
        );
      } else if (params.o) {
        return (
          Math.round((params.o / Math.tan((params.d / 180) * Math.PI)) * 100) /
          100
        );
      }
      return 0;
    },

    /**
     * 斜边
     * @param params
     * @returns {number}
     * @private
     */
    getHypotenuse: function (params) {
      if (params.o) {
        return (
          Math.round((params.o / Math.sin((params.d / 180) * Math.PI)) * 100) /
          100
        );
      } else if (params.a) {
        return (
          Math.round((params.a / Math.cos((params.d / 180) * Math.PI)) * 100) /
          100
        );
      }
      return 0;
    },

    /**
     * 根据边计算角度
     * @param params
     * @returns {number}
     * @private
     */
    getDegree: function (params) {
      if (params.o && params.r) {
        return (
          Math.round(((Math.asin(params.o / params.r) * 180) / Math.PI) * 100) /
          100
        );
      }
      return 0;
    },
  };
});

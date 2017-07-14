// picture

const PICT_ICONS = {
  "1": "paperclip",
  "2": "heart",
  "3": "star",
  "4": "tag",
  "5": "taxi",
  "6": "smile-o",
  "7": "rocket",
  "8": "moon-o"
};

const ARROW_ICONS = {
  "^": "hand-o-up",
  "v": "hand-o-down",
  "<": "hand-o-left",
  ">": "hand-o-right"
};

class Picture {

  /**
   * ピクチャかどうかを判定
   * 
   * @param {string} val
   * @return {boolean} 
   */
  static isPicture(val) {
    return typeof PICT_ICONS[val] !== "undefined";
  }

  /**
   * アイコン表示のためのclassを返す
   * 
   * @param {string} val 
   * @param {boolean} large
   * @return {string}
   */
  static getIconClass(val, large=false) {
    let size = "";
    if (large) {
      size = "fa-3x";
    }
    if (PICT_ICONS[val]) {
      return `fa fa-${PICT_ICONS[val]} ${size}`;
    }
    if (ARROW_ICONS[val]) {
      return `fa fa-${ARROW_ICONS[val]} ${size}`;
    }
    return "";
  }

}

module.exports = Picture;


(function(tagger) {
  if (typeof define === 'function' && define.amd) {
    define(function(require, exports, module) { tagger(require('riot'), require, exports, module)})
  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    tagger(require('riot'), require, exports, module)
  } else {
    tagger(window.riot)
  }
})(function(riot, require, exports, module) {
riot.tag2('egypt', '<header> <h1>EGYPT <small>version: 0.0.2 (2017-07-28) <a href="https://github.com/Kazunori-Kimura/egypt-app"><i class="fa fa-github" aria-hidden="true"></i>ソースコード</a> </small> </h1> </header> <div id="controller"> <button class="btn btn-default" onclick="{reset}"> <i class="fa fa-repeat"></i> ギブアップ </button> </div> <game-board></game-board> <game-status></game-status>', 'egypt { width: 100vw; min-height: 100vh; display: grid; grid-template-rows: 80px 80px 1fr; grid-template-columns: 2fr 1fr; grid-template-areas: "header header" "board controller" "board status"; } egypt header,[data-is="egypt"] header{ grid-area: header; padding: 5px 20px; } egypt h1 small,[data-is="egypt"] h1 small{ font-size: 0.7em; font-weight: normal; color: #999; margin-left: 40px; } egypt #controller,[data-is="egypt"] #controller{ grid-area: controller; } egypt game-board,[data-is="egypt"] game-board{ grid-area: board; } egypt game-status,[data-is="egypt"] game-status{ grid-area: status; } @media screen and (orientation: portrait) { egypt { grid-template-columns: 1fr; grid-template-rows: 80px 80px 1fr 120px; grid-template-areas: "header" "controller" "board" "status"; } }', '', function(opts) {
    const Picture = require("../lib/picture");

    this.observer = opts.observer;

    const map = `00000000
0000v000
00000000
0>003000
00030000
00000000
00000000
00000000`;

    this.data = [];

    this.on("before-mount", () => {
      this.init();
    });

    this.on("mount", () => {
      this.observer.trigger("status-update", this.data);
    });

    this.init = function() {

      this.data = [];

      const lines = map.split("\n");
      lines.forEach((line) => {
        const arr = [];
        for (let i=0; i<line.length; i++) {
          arr.push(line.charAt(i));
        }
        this.data.push(arr);
      });
    }.bind(this)

    this.reset = function() {
      this.init();
      this.observer.trigger("load", this.data);
    }.bind(this)

    this.isPicture = function(value) {
      return Picture.isPicture(value);
    }.bind(this)

    this.icon = function(value, large=false) {
      return Picture.getIconClass(value, large);
    }.bind(this)

});

riot.tag2('game-board', '<div id="content"> <virtual each="{row, rowIndex in data}"> <div each="{item, colIndex in row}" class="{⁗panel⁗: true,           ⁗erase⁗: isErase(rowIndex, colIndex)}" onclick="{parent.clickPanel}" data-row-index="{rowIndex}" data-col-index="{colIndex}"> <span if="{item != ⁗0⁗}"> <i class="{parent.getIcon(item)}"></i> </span> </div> </virtual> </div>', 'game-board #content,[data-is="game-board"] #content{ margin-left: 20px; border: 1px solid #999; display: flex; flex-wrap: wrap; width: calc(100vh - 100px); height: calc(100vh - 100px); } @media screen and (orientation: portrait) { game-board #content,[data-is="game-board"] #content{ width: calc(100vh - 280px); height: calc(100vh - 280px); } } game-board .panel,[data-is="game-board"] .panel{ width: calc(100%/8 - 2px); height: calc(100%/8 - 2px); text-align: center; border: 1px solid #ccc; display: flex; justify-content: center; align-items: center; } @keyframes erase { 0% { background: #fff; } 50% { background: yellow; } 100% { background: #fff; } } game-board .erase,[data-is="game-board"] .erase{ animation: erase 0.5s ease 0s infinite; }', '', function(opts) {

    const DIRECTION = {
      "UP": 0,
      "DOWN": 1,
      "LEFT": 2,
      "RIGHT": 3
    };

    this.data = this.parent.data;
    this.observer = this.parent.observer;

    this.erasePanels = new Set();

    this.isControllable = true;

    this.clickPanel = function(e) {
      if (!this.isControllable) {
        return;
      }

      const target = e.currentTarget;
      console.log(target);

      switch(e.item.item) {
        case "^":
          this.moveColumn(target.dataset.colIndex, DIRECTION.UP);
          break;
        case "v":
          this.moveColumn(target.dataset.colIndex, DIRECTION.DOWN);
          break;
        case "<":
          this.moveRow(target.dataset.rowIndex, DIRECTION.LEFT);
          break;
        case ">":
          this.moveRow(target.dataset.rowIndex, DIRECTION.RIGHT);
          break;
        default:

          return;
      }

      this.verify();

      if (this.erasePanels.size > 0) {

        this.isControllable = false;

        setTimeout(this.erase, 1000);
      }
    }.bind(this)

    this.moveRow = function(index, direction) {
      const row = this.data[index];

      let item;
      switch(direction) {
        case DIRECTION.LEFT:

          item = row.shift();
          row.push(item);
          break;
        case DIRECTION.RIGHT:

          item = row.pop();
          row.unshift(item);
          break;
      }
    }.bind(this)

    this.moveColumn = function(index, direction) {

      const items = [];
      this.data.forEach((row) => {
        items.push(row[index]);
      });

      let item;
      switch(direction) {
        case DIRECTION.UP:

          item = items.shift();
          items.push(item);
          break;
        case DIRECTION.DOWN:

          item = items.pop();
          items.unshift(item);
          break;
        default:
          return;
      }

      for(let i=0; i<this.data.length; i++) {
        this.data[i][index] = items[i];
      }
    }.bind(this)

    this.verify = function() {
      this.erasePanels.clear();

      this.data.forEach((row, rowIndex) => {
        row.forEach((item, colIndex) => {
          if (!this.parent.isPicture(item)) {
            return;
          }

          if (rowIndex > 0) {
            const target = this.data[rowIndex-1][colIndex];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }

          if (rowIndex < this.data.length - 1) {
            const target = this.data[rowIndex+1][colIndex];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }

          if (colIndex > 0) {
            const target = this.data[rowIndex][colIndex-1];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }

          if (colIndex < row.length - 1) {
            const target = this.data[rowIndex][colIndex+1];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }
        });
      });
    }.bind(this)

    this.isErase = function(rowIndex, colIndex) {
      const key = `${rowIndex}:${colIndex}`;
      return this.erasePanels.has(key);
    }.bind(this)

    this.erase = function() {
      this.erasePanels.forEach((item) => {
        const position = this.parseIndex(item);
        if (position) {
          this.data[position.row][position.column] = "0";
        }
      });

      this.erasePanels.clear();

      this.observer.trigger("status-update", this.data);
    }.bind(this)

    this.parseIndex = function(key) {
      const arr = key.split(":");
      if (arr.length === 2) {
        const row = parseInt(arr[0]);
        const column = parseInt(arr[1]);
        return { row, column };
      }
      return null;
    }.bind(this)

    this.getIcon = function(key) {
      return this.parent.icon(key, true);
    }.bind(this)

    this.observer.on("load", (data) => {

      this.data = data;

      this.erasePanels.clear();

      this.observer.trigger("status-update", this.data);
    })

    this.observer.on("status-updated", () => {

      this.isControllable = true;

      this.update();
    });

});

riot.tag2('game-status', '<h2>Status</h2> <virtual each="{item in status}"> <p><i class="{parent.getIcon(item.key)}"></i> : {item.count}</p> </virtual>', '', '', function(opts) {
    this.observer = this.parent.observer;

    this.status = [];

    this.observer.on("status-update", (data) => {
      console.log("status-update");
      console.log(data);
      const stat = new Map();

      data.forEach((row) => {
        row.forEach((item) => {
          if (this.parent.isPicture(item)) {
            let count = 0;
            if (stat.has(item)) {
              count = stat.get(item);
            }
            count++;
            stat.set(item, count);
          }
        });
      });

      const ret = [];
      [...stat.keys()].sort().forEach((key) => {
        ret.push({ key, count: stat.get(key) });
      });

      this.status = ret;

      this.observer.trigger("status-updated");

      this.update();
    });

    this.getIcon = function(key) {
      return this.parent.icon(key);
    }.bind(this)
});
});
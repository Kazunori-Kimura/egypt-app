
(function(tagger) {
  if (typeof define === 'function' && define.amd) {
    define(function(require, exports, module) { tagger(require('riot'), require, exports, module)})
  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    tagger(require('riot'), require, exports, module)
  } else {
    tagger(window.riot)
  }
})(function(riot, require, exports, module) {
riot.tag2('egypt', '<header> <h1>EGYPT</h1> </header> <div id="controller"> <button class="btn btn-default" onclick="{reset}"> <i class="fa fa-repeat"></i> ギブアップ </button> </div> <game-board></game-board> <game-status></game-status> <footer>version: 0.0.1 (2017-07-14)</footer>', 'egypt { width: 100%; min-height: 100vh; display: grid; grid-template-rows: 80px 1fr 40px; grid-template-columns: 2fr 1fr; grid-template-areas: "header controller" "board status" "footer footer"; } egypt header,[data-is="egypt"] header{ grid-area: header; padding: 5px 20px; } egypt #controller,[data-is="egypt"] #controller{ grid-area: controller; display: flex; align-items: center; } egypt game-board,[data-is="egypt"] game-board{ grid-area: board; } egypt game-status,[data-is="egypt"] game-status{ grid-area: status; } egypt footer,[data-is="egypt"] footer{ grid-area: footer; padding: 5px 20px; } @media screen and (max-width: 800px) { egypt { grid-template-columns: 1fr; grid-template-rows: 60px 30px 1fr 60px 60px; grid-template-areas: "header" "controller" "board" "status" "footer"; } }', '', function(opts) {
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

riot.tag2('game-board', '<div id="wrapper"> <div id="content"> <virtual each="{row, rowIndex in data}"> <div each="{item, colIndex in row}" class="{⁗panel⁗: true,             ⁗erase⁗: isErase(rowIndex, colIndex)}" onclick="{parent.clickPanel}" data-row-index="{rowIndex}" data-col-index="{colIndex}"> <span if="{item != ⁗0⁗}"> <i class="{parent.getIcon(item)}"></i> </span> </div> </virtual> </div> </div>', 'game-board #wrapper,[data-is="game-board"] #wrapper{ position: relative; width: calc(100% - 20px); margin-left: 10px; } game-board #wrapper:before,[data-is="game-board"] #wrapper:before{ content: ""; display: block; padding-top: 100%; } game-board #content,[data-is="game-board"] #content{ position: absolute; top: 0; left: 0; bottom: 0; right: 0; border: 1px solid #999; display: flex; flex-wrap: wrap; } game-board .panel,[data-is="game-board"] .panel{ width: calc(100%/8 - 2px); height: calc(100%/8 - 2px); text-align: center; border: 1px solid #ccc; display: flex; justify-content: center; align-items: center; } @keyframes erase { 0% { background: #fff; } 50% { background: yellow; } 100% { background: #fff; } } game-board .erase,[data-is="game-board"] .erase{ animation: erase 0.5s ease 0s infinite; }', '', function(opts) {

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
"use strict";
const box3EventTypes = [
  "PlayerJoin",
  "Press",
  "EntityContact",
  "EntityCreate",
  "EntityDestroy",
  "EntitySeparate",
  "FluidEnter",
  "FluidLeave",
  "VoxelContact",
  "VoxelSeparate",
  "Chat",
  "Click",
  "PlayerLeave",
  "Release",
  "Tick",
];
let sjs = class {
  constructor(debug = true, autoClearConsole = true) {
    this._initAttr();
    this._initAttr = null;
    global.$ = this;
    if (autoClearConsole) {
      console.clear();
    }
    this.debug = debug;
    if (!debug) {
      console.log(
        `[SJS] 此地图关闭了调试模式. 如果你正在创作地图,请务必启用调试模式,否则就得不到警告,提示和错误.`
      );
    } else {
      console.log(
        `[SJS] 此地图开启了调试模式. 如果你正准备发布地图,请务必启用关闭调试模式,否则运行时会降低性能.`
      );
    }
    for (let type of box3EventTypes) {
      world["on" + type]((arg) => {
        for (let i of this.eventFunctionList) {
          if (i.type == type) {
            i.func(arg);
          }
        }
      });
    }
  }

  _initAttr() {
    this.eventFunctionList = [];
    this.Admin = class {
      constructor(adminNameList, functions = { chatDebug: false }) {
        this.adminNameList = adminNameList;
        if (functions.chatDebug) {
          $.on(
            "Chat",
            ({ entity, message }) => {
              if (
                this.adminNameList.indexOf(entity.player.name) != -1 &&
                message[0] == "$"
              ) {
                try {
                  world.say("~> " + eval(message.slice(1)));
                } catch (e) {
                  world.say("[!]" + e);
                }
              }
            },
            "用于chatDebug功能(来自sjs.Admin)"
          );
        }
      }
    };
    this.EventFunction = class {
      constructor(type, func, tok) {
        this.type = type;
        this.func = func;
        this.token = tok;
      }
    };
    this._runtime = {
      warn: (t) => {
        if (!this.debug) {
          return;
        }
        let e = new Error(t);
        e.name = "[SJS] 警告";
        console.warn(this._runtime.stackReplace(e.stack) + "\n");
      },
      error: (t, stop = false) => {
        if (!this.debug) {
          return;
        }
        let e = new Error(t);
        e.name = "[SJS] " + (stop ? "致命" : "") + "错误";
        let s = this._runtime.stackReplace(e.stack) + "\n";
        console.error(s);
        if (stop) {
          throw "程序停止";
        } else {
        }
      },
      log: (t, stack) => {
        if (!this.debug) {
          return;
        }
        console.log("[SJS]: " + t + "\n");
        if (stack) {
          let e = new Error(t);
          e.name = "位置追溯";
          console.warn(this._runtime.stackReplace(e.stack) + "\n");
        }
      },
      stackReplace: (s) => {
        s = s.split("\n");
        for (let i of s) {
          if (
            i.indexOf("<anonymous>") != -1 ||
            i.indexOf("<isolated-vm>") != -1
          ) {
            s.splice(s.indexOf(i));
          }
        }
        return s.join("\n");
      },
    };
  }

  on(type, func, desc = undefined) {
    if (box3EventTypes.indexOf(type) == -1) {
      this._runtime.error('注册了不存在或者不支持的事件("' + type + '")', true);
      return;
    }
    if (typeof func != "function") {
      this._runtime.error("事件处理函数必须是一个可调用的函数", true);
      return;
    }
    var tok = this.eventFunctionList.length;
    this.eventFunctionList.push(new this.EventFunction(type, func, tok));
    this._runtime.log(
      `已注册事件:"${
        desc ? desc : "<未指定描述信息>"
      }"\n类型:${type} 事件令牌:${tok}`
    );
    if (this.eventFunctionList.length >= 100) {
      this._runtime.warn(
        "注册的事件过多(>=100个),可能会影响事件操作的性能,请适当合并事件处理函数."
      );
    }
    return tok
  }
  clearEvent(tok) {
    for (let i of this.eventFunctionList) {
      if (i.token == tok) {
        this._runtime.log(`已清除事件处理函数:${tok}(事件令牌)`);
        this.eventFunctionList.splice(this.eventFunctionList.indexOf(i));
      }
    }
  }
};
module.exports = sjs;

"use strict"; // * 使用严格语法,模块的标准
class sjs {
  // 定义sjs类
  constructor() {
    global.$ = this;
    // 构造器函数
    this.initAttr(); //? 因为Box3暂时不支持ES6写法,所以只能通过函数设置属性
    try {
      // 尝试
      const Config = require("./config.js"); // 导入配置文件(config.js)
      if (typeof Config != "object") {
        throw 0;
      }
      this.config = {
        // 设置配置对象
        adminList: ["shyfcka"], // 管理员名单
        debug: true,
        ...Config, //* 扩展语法,从Config覆盖默认设置
      };
    } catch (e) {
      // 如果出错
      if (e == 0) {
        this._runtime.error(
          "配置文件需要导出一个配置对象(Object),例子:\n\nmodule.exports={debug:true}\n\n",
          true
        );
      } else {
        this._runtime.error("无法读取配置文件,请在项目中新建config.js", true);
      } // 输出错误信息并且停止程序
    }
  }
  on(eventType, func, desc = "") {
    // 事件绑定函数
    if (!this._eventList[eventType]) {
      // 如果绑定的事件类型不存在
      this._runtime.error(`错误的事件名称:"${eventType}"`, true); //* 抛出错误
      return;
    }
    let e = new this.Event(func, desc, eventType);
    this._eventList[eventType].push(e); // 添加进事件列表\
    return e;
  }
  initAttr() {
    // 属性定义函数
    this._eventList = {
      "player.join": [], //* 玩家加入
      "player.leave": [], //* 玩家离开
      "entity.contact": [], //* 实体相撞
      "entity.create": [], //* 实体创建
      "entity.destroy": [], //* 实体销毁
      "entity.separate": [], //* 碰撞结束
      tick: [], //* 时钟
      die: [], //* 死亡
      respawn: [], //* 重生
      takeDamage: [], //* 受伤
      chat: [], //* 聊天
      click: [], //* 点击
      press: [], //* 按下按钮
      release: [], //* 放开按钮
      "voxel.contact": [], //* 方块碰撞
      "voxel.separate": [], //* 方块停止碰撞
      "voxel.fluidEnter": [], //* 进入流体
      "voxel.fluidLeave": [], //* 离开流体
    }; // 私有,事件数据
    //? 覆盖原有事件
    (() => {
      let _ = (n, f) => {
        //? 临时函数
        this._eventList[n].forEach((ef) => {
          f(ef.func);
        });
      };
      world.onPlayerJoin((arg) => {
        _("player.join", (f) => {
          f(arg);
        });
      });
      world.onPlayerLeave((arg) => {
        _("player.leave", (f) => {
          f(arg);
        });
      });
      world.onEntityContact((arg) => {
        _("entity.contact", (f) => {
          f(arg);
        });
      });
      world.onEntitySeparate((arg) => {
        _("entity.separate", (f) => {
          f(arg);
        });
      });
      world.onEntityCreate((arg) => {
        _("entity.create", (f) => {
          f(arg);
        });
      });
      world.onEntityDestroy((arg) => {
        _("entity.destroy", (f) => {
          f(arg);
        });
      });
      world.onTick((arg) => {
        _("tick", (f) => {
          f(arg);
        });
      });
      world.onDie((arg) => {
        _("die", (f) => {
          f(arg);
        });
      });
      world.onTakeDamage((arg) => {
        _("takeDamage", (f) => {
          f(arg);
        });
      });
      world.onChat((arg) => {
        _("chat", (f) => {
          f(arg);
        });
      });
      world.onClick((arg) => {
        _("click", (f) => {
          f(arg);
        });
      });
      world.onPress((arg) => {
        _("press", (f) => {
          f(arg);
        });
      });
      world.onRelease((arg) => {
        _("release", (f) => {
          f(arg);
        });
      });
      world.onRespawn((arg) => {
        _("respawn", (f) => {
          f(arg);
        });
      });
      world.onVoxelContact((arg) => {
        _("voxel.contact", (f) => {
          f(arg);
        });
      });
      world.onVoxelSeparate((arg) => {
        _("voxel.separate", (f) => {
          f(arg);
        });
      });
      world.onFluidEnter((arg) => {
        _("voxel.fluidEnter", (f) => {
          f(arg);
        });
      });
      world.onFluidLeave((arg) => {
        _("voxel.fluidLeave", (f) => {
          f(arg);
        });
      });
    })();
    this.Event = class {
      constructor(func, desc, _type) {
        this.func = func;
        this.desc = desc;
        this._type = _type; // 设置属性
      }
      remove() {
        // 取消事件
        var index = $._eventList[this._type].indexOf(this); // 获取自己的index
        $._eventList[this._type].slice(index); // 删除
      }
    };
    this._runtime = {
      // 运行时内部
      error: (message, stop) => {
        // 错误函数
        if (!stop && !this.config.debug) {
          return;
        }
        let e = new Error(); // 创建新的错误对象
        e.message = message; // 设置错误消息
        e.name = "[SJS错误]"; // 设置错误名
        let strL = e.stack.toString().split("\n");
        for (let i of strL) {
          if (
            i.indexOf("<isolated-vm>") != -1 ||
            i.indexOf("<anonymous>") != -1
          ) {
            strL.splice(strL.indexOf(i));
          }
        }
        let str = strL.join("\n");
        console.error(str); // 输出堆栈信息
        if (stop) {
          // 如果是致命错误
          throw "致命错误,程序退出"; //抛出错误,程序就会中断
        }
      },
      warn: (tex) => {
        if (!this.config.debug) {
          return;
        }
        // 警告
        console.warn(`[SJS警告]: ${tex}`); // 使用黄色文本输出警告信息
      },
    };
    this.Tool = class {
      // 实用工具类
      static get playerNumber() {
        // 静态getter, 获取玩家数量
        return world.querySelectorAll("player").length;
      }
      static get playerList() {
        // 静态getter, 获取玩家列表
        return world.querySelectorAll("player");
      }
      static get entityList() {
        // 静态getter, 获取实体列表
        return world.querySelectorAll("*");
      }
      static forEach(target, func) {
        // 静态方法, 遍历

        if (typeof target == "string") {
          // 如果传入字符串,就会把字符串当做搜索字符
          world.querySelectorAll(target).forEach(func); // 以搜索字符遍历
        } else if (typeof target == "object" && target.length) {
          //* 判断是数组
          target.forEach(func); // 直接遍历
        }
      }
      static clearWorld(clearBlock = false) {
        // 静态工具方法, 清空世界所有方块, 月亮 ,实体
        world.querySelectorAll("*").forEach((e) => {
          // 遍历所有实体
          e.destroy(); // 尝试销毁实体
          e.meshInvisible = true; // 删除实体外形
          if (e.isPlayer) {
            // 如果是玩家
            e.player.invisible = true; // 玩家隐身
          }
        });
        world.maxFog = 0; // 关闭雾
        world.lightMode = "natural"; // 调整天空模式
        world.lunarPhase = 0.5; //* 关闭月亮(月全食)
        world.sunPhase = 0.75; // 太阳位移
        if (clearBlock) {
          // 如果启用清空方块
          for (let x = 0; x < 127; x++) {
            // 遍历x轴
            for (let z = 0; z < 127; z++) {
              // 遍历z轴
              for (let y = 0; y < 127; y++) {
                // 遍历y轴
                voxels.setVoxel(x, y, z, 0); // 清除方块
              }
            }
          }
        }
      }
      static clearChat() {
        // 清空聊天
        world.say("\n".repeat(500)); //* 系统消息输出500个换行,以达到清空的效果
      }
    };
  }
}
module.exports = new sjs(); // 导出实例化的SJS类
sjs = undefined;

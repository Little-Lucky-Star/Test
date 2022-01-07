auto.waitFor();

// 工作流数组, 按顺序执行工作流
var workflow = getWorkflow();

// 工作流对象, 所有工作流处理都在里面
var workflowObject = [];

// 计算两次操作之间坐标距离的全局变量, 保存上一次操作的坐标
var lastOperation = null;

// 屏幕截图的全局变量, 保存截图
var screenshot = null;

// 屏幕中心点
var screenCenterPosition = getScreenCenter();

// 获取函数的名称


// 让log能够显示当前在哪个函数中
// var _log = log;
// function log(params) {

// }

// 得到工作流字符串
function getWorkflowString() {
    return http.get("little-lucky-star.github.io/Test/1.txt").body.string();
}

// 判断当参数错误或不存在时 //
function paraErr(params, status, explain) {

    // 条件状态可以忽略
    typeof status === "boolean" ? null : status = true;

    // 
    if (params && status) {
        console.error(explain);
        return false;
    } else {
        return true;
    }
}

// 根据两次操作之间的距离赋予不同大小的随机时间
function distanceRandomTime(widget) {

    // 犯懒, 再说吧
    if (lastOperation) {
        // 抽奖! 嘿嘿嘿, 抽到特等奖奖励等待3秒
        if (random(0, 10) === 5) {
            toastLog("抽到特等奖, 奖品为等待三秒");
            sleep(3368);
        }

        var x, y;
        x = lastOperation.x > widget.x ? lastOperation.x - widget.x : widget.x - lastOperation.x
        y = lastOperation.y > widget.y ? lastOperation.y - widget.y : widget.y - lastOperation.y
        var time = x > y ? x : y;
        log("抽到的随机时间为: ", time);
        if (time > 1700) {
            sleep(random(416, 1894));
        } else if (time > 1000) {
            sleep(random(237, 1567));
        } else if (time > 500) {
            sleep(random(142, 1125));
        } else {
            sleep(random(108, 863));
        }
    } else {
        var randomTime = random(465, 1624);
        log("随机等待的时间为:", randomTime);
        sleep(randomTime);
    }
}

// 点击时的随机偏移
function randomOffsetWhenClicked(widgetOrX, y, offset) {

    // 当能够获取到控件时
    var widget = widgetOrX;

}

// 滑动时的随机偏移
function randomOffsetWhenSliding(x, y) {

}

// 获取截图
function getScreenShot(update) {

    // 如果不存在截图或需要新的截图
    if (update || !screenshot) {

        // 自动按下允许截图权限按钮
        threads.start(function () {

            // 此处findOne(5000)是为了限制查找时间，如果留空，找不到就会一直找
            var beginBtn = classNameContains("Button").textContains("立即开始").findOne(5000);
            beginBtn && beginBtn.click();
        });

        if (!requestScreenCapture()) {
            toast("请求截图失败");
            exit();
        }

        screenshot = captureScreen();
    }

    // 返回截图
    return screenshot;
}

// 在屏幕截图中对比小图片的位置
function getPositionInScreenshot(image) {

    if (image instanceof Image) {

        // 对比图片
        var result = images.matchTemplate(getScreenShot(), image, {
            threshold: 0.7,
            max: 1
        });

        // 获取目标的位置
        var position = result.matches[0].point;
        position = position.toString().replace(/(\{|\})/gm, "").split(", ").map(Number);

        return {
            x: position[0],
            y: position[1]
        };
    }
}

// 获取一个元素的中心位置
function getWidgetCenterPosition(widget) {
    return {
        x: widget.bounds().centerX(),
        y: widget.bounds().centerY()
    };
}

// 点击不能点击的按钮
function psck(widget, long) {
    log("点击不能点击的按钮");
    if (widget) {
        var position = getWidgetCenterPosition(widget);
        if (long) {
            longClick(position.x, position.y);
        } else {
            click(position.x, position.y);
        }
    } else {
        log("psck没有找到要点击的坐标");
    }
}

// 去点击按钮
function toClick(widget, long) {

    if (widget.x && widget.y) {
        long ? longClick(widget.x, widget.y) : click(widget.x, widget.y);
    } else if (long) {
        widget.longClickable() ? widget.longClick() : psck(widget, long);
    } else {
        widget.clickable() ? widget.click() : psck(widget, long);
    }
}

// 当目标是个控件
function getWidget(textStr) {

    // 控件过滤结果变量
    var widget = null;

    // 如果是id
    if (/\:id/.test(textStr)) {
        log("是id");

        widget = id(textStr).findOne(1000);
    }

    // 如果是desc
    else if (textStr.charAt(0) === ">") {
        log("是desc");

        widget = desc(textStr.slice(1, textStr.length)).findOnce();
    }

    // 如果是包含文本
    else if (textStr.charAt(0) === ' ' || textStr.charAt(textStr.length - 1) === ' ') {

        // 如果是包含文本
        if (textStr.charAt(0) === ' ' && textStr.charAt(textStr.length - 1) === ' ') {
            log("包含文本");
            widget = textContains(textStr.trim()).findOnce();
        }
        // 如果是以文本结尾
        else if (textStr.charAt(0) === ' ') {
            log("以文本结尾");
            widget = textEndsWith(textStr.trim()).findOnce();
        }

        // 如果是以文本开头
        else if (textStr.charAt(textStr.length - 1) === ' ') {
            log("以文本开头");
            widget = textStartsWith(textStr.trim()).findOnce();
        }

        // 都不是的话
        else {
            log("包含文本出错");
        }
    }

    // 纯文本按钮
    else {
        log("纯文本按钮");
        widget = text(textStr).findOnce();
    }

    // 返回控件
    if (widget) {
        return widget;
    } else {
        toastLog("找不到" + textStr + "控件");
        return null;
    }

}

// 当目标是个图片
function getImage(image) {
    log("需要点击的是图片");

    var position = getPositionInScreenshot(image);
    if (position) {
        log("找到了对比到的图片");
        // 点击目标
        return position;
    } else {
        log("没有在屏幕中找到图片");
        return null;
    }
}

// 寻找目标
function find(target) {

    var result = null;

    // 如果是文本或者id或desc
    if (typeof (target) === "string") {
        result = getWidget(target);
    }
    // 如果是图片
    else if (target instanceof Image) {
        result = getImage(target);
    }
    // 找不到输入的是什么东西, 检查是不是传错了
    else {
        log("touch找不到输入的是什么东西, 检查是不是传错了", target);
        result = null;
    }
    log("找到了这个->", result);
    return result;
}

// 点击方法
function touch(target, long) {

    var target = find(target);
    target && toClick(target, long);
}

// 获取到屏幕中心
function getScreenCenter() {
    return {
        x: device.width / 2,
        y: device.height / 2
    }
};

/******************************************************************************
 * 
 * 
 * 
 *                  工作流处理部分
 * 
 * 
 * 
 ******************************************************************************/

// 获取到工作流数组
function getWorkflow() {

    // 获取工作流字符串, 并进行处理
    var workflowString = getWorkflowString().split("\n");

    var aLine = "";
    var str = "";
    for (let i = 0; i < workflowString.length; i++) {
        aLine = workflowString[i];
        if (aLine) {
            if (!(/(\[|\])/gm.test(aLine))) {
                str += '"' + aLine + '", ';
            } else {
                str += aLine;
            }
        }
    }
    var result = str.replace(", ]", "]");
    // 当字符串中包含反斜杠时\, 会因为转义出现问题, 待解决
    var workflow = JSON.parse(result);
    return workflow;
}

// 工作对象开始工作
function run() {

    // 随机等待
    distanceRandomTime();
    // 如果要执行的action是个字符串, 则将其代表的函数执行
    if (typeof this.action === "string") {
        // var funStr = "";
        // for (let i = 0; i < this.args.length; i++) {
        //     funStr += this.args[i];
        //     funStr += ", ";
        // }

        // if (funStr) {
        //     log("对比成功, 这里是对比run时action字符串是否含有, 的", /\, $/.test(funStr))
        //     funStr = funStr.replace(/\, $/, "");
        //     funStr = this.action + '("' + funStr + '")';
        //     log("最终的action字符串是:", funStr);
        //     eval(funStr);
        // }
    } else {
        // log("看看this是什么: ", this);
        this.action.apply(this, this.args);
        // var exec = 
        // eval(this.args.valueOf());
        this.ok = true;
    }
}

// 启动app
function launchApp(appName) {
    log("启动了" + appName);
    app.launchApp(appName);
}


// 函数与其对应的别称
var functionMap = {
    "c": touch,
    "lc": touch,
    "l": launchApp
}

// 将单个工作字符串的格式转为[名称][使用的函数][参数等][...]
function workStringSplit(workString) {
    return workString.split(';');
}

// 判断当前工作对象应该使用哪个函数
function getWorkObjectAction(workStringArr) {
    // log("工作字符串数组workSringArr是:", workStringArr);
    var alias = workStringArr[1];
    var action = functionMap[alias];
    // log("对比别称的到的函数是:", action);
    action ? null : action = eval(alias);
    return action;
}

// 创建单个工作对象
// 将每种不同的工作对应不同的完成方法, 并创建出工作对象
function createWorkObject(workflow) {

    var workStingArr = workStringSplit(workflow);
    var object = {

        // 名称
        name: workStingArr[0],

        run: run,
        // 工作完成方式
        _action: getWorkObjectAction(workStingArr),

        set action(test) {
            log("action set:", test);
            // this._action = test;
            // log(this);
        },
        get action() {
            log("test get");
            // log(this);
            return this._action;
        },
        // 检查是否成功完成
        check: undefined,
        // 完成状态
        ok: undefined,
        // 参数缓存, 在工作进行时传入fn
        args: [workStingArr[0]]
    };

    for (let i = 2; i < workStingArr.length; i++) {
        object.args.push(workStingArr[i]);
    }

    return object;
}


// 根据工作流数组创建工作流对象
function createWorkflowObject(workflow, workflowObject) {

    // 使用循环创建出工作流对应的工作流对象
    workflow.forEach((element, i) => {

        // 当元素是个数组时, 表示是个子工作流, 使用递归将里面的工作流也创建相应的对象
        if (element instanceof Array) {

            // 工作流对象相应的也要创建子工作流对象
            workflowObject[i] = [];
            createWorkflowObject(element, workflowObject[i]);

        } else {

            // 创建单个工作对象
            workflowObject[i] = createWorkObject(element);
        }
    });
}

// 开始工作
function toWork(workflow, workflowObject) {

    for (let i = 0; i < workflow.length; i++) {

        var runObj = workflowObject[i];
        var nextRunObj = workflowObject[i + 1];
        // log("整个工作流对象为:", workflowObject);
        log("开始运行!, 当前运行的工作对象为:", runObj.name);
        runObj.run();
        if (!runObj.ok) {
            log("ok为否, 等待一秒重新开始");
            i--;
            sleep(1000);
            continue;
        }
        if (nextRunObj) {
            if (!find(nextRunObj.name)) {
                log("验证失败, 等待下一个控件出现");
                i--;
                sleep(3000);
                continue;
            }
        }
    }
}

//===================================测试=======================================
// 
// function inStringTouch() {
//     touch(this.toString());
// }

// function inStringLongTouch() {
//     touch(this.toString(), true);
// }

// 将点击方法放到字符串对象中, 这样就能使用"test".c()调用了
// String.prototype.c = inStringTouch;
// String.prototype.lc = inStringLongTouch;
//=============================================================================

/**********************************************************************
 * 
 * 
 *      脚本开始啦!
 * 
 *
 **********************************************************************/


// 读取本地测试
// function getWorkflow() {

//     var aLine = "";
//     var str = "";
//     do {
//         aLine = test.readline();
//         if (aLine) {
//             if (!(/(\[|\])/gm.test(aLine))) {
//                 str += '"' + aLine + '", ';
//             } else {
//                 str += aLine;
//             }
//         }
//     } while (aLine);
//     var result = str.replace(", ]", "]");
//     var workflow = JSON.parse(result);
//     return workflow;
// }

! function main() {

    createWorkflowObject(workflow, workflowObject);
    // log("整个工作流对象是:", workflowObject);

    toWork(workflow, workflowObject);
}();

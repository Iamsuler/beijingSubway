<template>
  <div class="home">
    <div class="subwaymap">
      <img src="/static/images/turn.png" id="turn_icon" style="display:none;" />
      <img src="/static/images/turnreal.png" id="turnreal_icon" style="display:none;"
      />
      <img src="/static/images/pictag.png" id="pictag_icon" style="display:none;" />
      <img src="/static/images/block.png" id="block_icon" style="display:none;" />
      <img src="/static/images/start.png" id="start_icon" style="display:none;" />
      <img src="/static/images/end.png" id="end_icon" style="display:none;" />
      <img src="/static/images/tam.png" id="tam_icon" style="display:none;" />
      <img src="/static/images/zhizuo.jpg" id="zhizuo_icon" style="display:none;" />
      <img src="/static/images/north.png" id="north_icon" style="display:none;" />
      <img src="/static/images/airport.png" id="airport_icon" style="display:none;" />
      <img src="/static/images/arrow.png" id="arrow_icon" style="display:none;" />
      <img src="/static/images/arrow_2.png" id="arrow2_icon" style="display:none;" />
      <div id="subway_map" @mousemove="handleMousemove" @click="chooseStation" class="subway-map" style="background-color: white;"></div>
      <div class="mapimgs" id="container"></div>
    </div>
    <div id="linesDiv">
      <div id="lineList">
          <ul id="lines">
            <li v-for="line in lineMenu" :key="line.lnub" @click="focusline(line.lineName, line.lineCode)">{{line.lineName}}</li>
          </ul>
      </div>
    </div>
    <div id="station-hover" v-show="isHoverStation" :style="{left: stationInfo.leftX + 'px', top: stationInfo.topY + 'px'}">
        <div class="station-hover-wrap">
            <h3>{{stationInfo.name}}</h3>
            <ul class="list">
                <li>扶梯数量：{{stationInfo.futi}}</li>
                <li>直梯数量：{{stationInfo.zhiti}}</li>
            </ul>
        </div>
    </div>

    <div class="condition" :class="{'active': isSlideAll}" v-if="isAllStation" @click="slidePanel(0)">
        <div class="condition-title">
            <i class="icon icon-overview"></i>
            <span>整体运行状态</span>
            <i class="icon icon-darr"></i>
        </div>
        <div class="condition-body">
            <ul class="condition-count">
                <li>报警线路：<span class="error">{{lineWarning.warningCount}}个</span></li>
                <li>正常线路：<span>{{lineWarning.normalCount}}个</span></li>
            </ul>
            <ul class="condition-line">
                <li v-for="(line, index) in lineWarning.lines" :key="index">
                  <i :style="{backgroundColor: line.lineColor}"></i>
                  {{line.lineName}}：
                  <span v-if="line.status == -1" class="error">报警</span>
                  <span v-else>正常</span>
                </li>
            </ul>
        </div>
    </div>
    <div class="condition line-condition" :class="{'active': isSlideCur}" v-else @click="slidePanel(1)">
        <div class="condition-title">
            <i class="icon icon-lines"></i>
            <span>{{curLineName}}运行状态</span>
            <i class="icon icon-darr"></i>
        </div>
        <div class="condition-body">
            <ul class="condition-count">
                <li>报警站点：<span class="error">{{curLineCondition.warningCount}}个</span></li>
                <li>正常站点：<span>{{curLineCondition.normalCount}}个</span></li>
            </ul>
            <ul class="condition-line">
                <li v-for="(item, index) in curLineCondition.stations" :key="index">
                  {{item.stationName}}：
                  <span v-if="item.status == -1" class="error" key="wariningStaton">报警</span>
                  <span v-else key="normalStation">正常</span>
                </li>
            </ul>
        </div>
    </div>
  </div>
</template>

<script>
import SVG from "svg.js";
import svgPanZoom from "svg-pan-zoom";
import hammer from "hammerjs";
import typeahead from "typeahead";
import fullscreen from "fullscreen";
require("@/libs/subwaymap.js");

export default {
  name: "home",
  data() {
    return {
        stationInfo: {
            name: '',
            futi: 0,
            zhiti: 0,
            leftX: 0,
            topY: 0
        },
        isHoverStation: false,

        isAllStation: true,
        curLineName: '',

        isSlideAll: true,
        isSlideCur: true,
        // 记录点击空白处的次数
        clickInSpaceIndex: 0,

        curLineCondition: {
          warningCount: 0,
          normalCount: 0,
          stations: []
        },

        stationOverview: [],
        lineMenu: [],
        lineWarning: {
            lines: [],
            warningCount: 0,
            normalCount: 0
        },
        errorStationList: [],

        timer: null,

        notInSystemMsg: '该线路暂未接入系统，敬请期待...'
    };
  },
  created() {
    this.init();
    this.getWarningOverview();
    this.getStationOverview();
  },
  methods: {
    init() {
      var vueThis = this
      $.fn.toggleSvgClass = function(className) {
          return this.each(function() {
              var attr = $(this).attr('class')
              if (attr) {
                  if (attr.indexOf(className) < 0) {
                      attr = attr + ' ' + className
                  } else {
                      attr = attr.replace(' ' + className, '')
                  }

                  $(this).attr('class', attr)
              }
          })
      };

      (function($) {
        var el = null;

        var plugin = {
            defaults: {
                debug: false,
                grid: false
            },

            options: {
                x: 0,
                y: 0,
                blockdatas: null,
                realmaskline: null,
                ispan: false,
                width: 2000,
                height: 1500,
                maskwidth: 2200,
                maskheight: 1500
            },

            stage: null,
            lineLayer: null,
            realLayer: null,
            panzoom: null,

            identity: function(type) {
                if (type === undefined) type = "name";

                switch (type.toLowerCase()) {
                    case "version":
                    return "2.0.0";
                    break;
                    default:
                    return "subwayMap Plugin";
                    break;
                }
            },

            _debug: function(s) {
                if (this.options.debug) this._log(s);
            },

            _log: function() {
                if (window.console && window.console.log)
                    window.console.log(
                    "[subwayMap] " + Array.prototype.join.call(arguments, " ")
                );
            },

            _init: function(sel) {
                el = sel;

                this.options.width = window.innerWidth;
                this.options.height = window.innerHeight;

                this.options.maskwidth = 2500;
                this.options.maskheight = 1500;

                this.stage = SVG("subway_map").size(
                    this._parseNumber(this.options.width),
                    this._parseNumber(this.options.height)
                );

                $("svg").attr("id", "subwaymap_svg");

                var g = this.stage.group();
                g.addClass("svg-pan-zoom_viewport");

                this.lineLayer = g.group();
                this.errorLayer = g.group();

                var pthis = this;
                // setTimeout(function(){pthis._getRealDatas(pthis)}, 1000)
            },

            _parseNumber: function(val) {
                return parseFloat(val);
            },

            _offsetNumber: function(val) {
                return val;
            },

            //SingleLine
            _redraw: function() {
                this._drawTags();
                this._drawLines();
                this._resetDraw();
            },

            _resetDraw: function() {
                var pthis = this;

                var svgopts = {
                    viewportSelector: ".svg-pan-zoom_viewport",
                    zoomEnabled: true,
                    panEnabled: true,
                    controlIconsEnabled: false,
                    fit: false,
                    center: false,
                    contain: false,
                    minZoom: 0.3,
                    maxZoom: 5,
                    onUpdatedCTM: function() {
                    pthis.options.forceHideStationInfo();
                    },
                    onPan: function() {
                    if (SVG.select(".mask").length() > 0) pthis.options.ispan = true;
                    },
                    customEventsHandler: {
                    haltEventListeners: [
                        "touchstart",
                        "touchend",
                        "touchmove",
                        "touchleave",
                        "touchcancel"
                    ],
                    init: function(svgopts) {
                        var instance = svgopts.instance,
                        initialScale = 1,
                        pannedX = 0,
                        pannedY = 0;
                        // Init Hammer
                        // Listen only for pointer and touch events
                        (this.hammer = Hammer(svgopts.svgElement, {
                        inputClass: Hammer.SUPPORT_POINTER_EVENTS
                            ? Hammer.PointerEventInput
                            : Hammer.TouchInput
                        })),
                        // Enable pinch
                        this.hammer.get("pinch").set({
                            enable: true
                        }),
                        // Handle double tap
                        this.hammer.on("doubletap", function(ev) {
                            //instance.zoomIn()
                        }),
                        // Handle pan
                        this.hammer.on("panstart panmove", function(ev) {
                            // On pan start reset panned variables
                            if (ev.type === "panstart") {
                            pannedX = 0;
                            pannedY = 0;
                            }

                            // Pan only the difference
                            instance.panBy({
                            x: ev.deltaX - pannedX,
                            y: ev.deltaY - pannedY
                            });
                            pannedX = ev.deltaX;
                            pannedY = ev.deltaY;
                        }),
                        // Handle pinch
                        this.hammer.on("pinchstart pinchmove", function(ev) {
                            // On pinch start remember initial zoom
                            if (ev.type === "pinchstart") {
                            initialScale = instance.getZoom();
                            instance.zoom(initialScale * ev.scale);
                            }

                            instance.zoom(initialScale * ev.scale);
                        }),
                        // Prevent moving the page on some devices when panning over SVG
                        svgopts.svgElement.addEventListener("touchmove", function(e) {
                            e.preventDefault();
                        });
                    },
                    destroy: function() {
                        this.hammer.destroy();
                    }
                    }
                };
                this.panzoom = svgPanZoom("#subwaymap_svg", svgopts);
            },

            _initpos: function() {
                this.panzoom.pan({
                    x: -950 + window.innerWidth / 2,
                    y: -770 + window.innerHeight / 2
                });
            },

            _drawTags: function() {
                var tamimg = this.stage.image("/static/images/tam.png");
                tamimg
                    .size(this._parseNumber(85), this._parseNumber(26))
                    .move(
                    this._offsetNumber(this._parseNumber(908)),
                    this._offsetNumber(this._parseNumber(758))
                    );

                var northimg = this.stage.image("/static/images/north.png");
                northimg
                    .size(this._parseNumber(50), this._parseNumber(100))
                    .move(
                    this._offsetNumber(this._parseNumber(1710)),
                    this._offsetNumber(this._parseNumber(250))
                    );

                var airportimg = this.stage.image("/static/images/airport.png");
                airportimg
                    .size(this._parseNumber(40), this._parseNumber(40))
                    .move(
                    this._offsetNumber(this._parseNumber(1510)),
                    this._offsetNumber(this._parseNumber(355))
                    );

                this.lineLayer.add(tamimg);
                // this.lineLayer.add(zhizuo)
                this.lineLayer.add(northimg);
                this.lineLayer.add(airportimg);
            },

            _drawLines: function() {
                var pthis = this;
                $(this.options.xml)
                    .find("l")
                    .each(function(i) {
                    pthis._drawSubwayLine(
                        $(this),
                        0,
                        $(this).find("p").length - 1,
                        true,
                        true,
                        false,
                        false
                    );
                });
            },

            _drawSubwayLine: function(linexml,startdn,enddn,dir,isline,ismask,isreal) {
                if (dir) {
                    if (linexml.attr("loop") == "true" && startdn > enddn) {
                      enddn += linexml.find("p").length;
                    }
                } else {
                    if (linexml.attr("loop") == "true" && startdn < enddn) {
                      startdn += linexml.find("p").length;
                    }

                    var t = startdn;
                    startdn = enddn;
                    enddn = t;
                    //dir = true
                }

                if (isline) {
                    var lns = linexml.attr("slb").split(",");
                    var lps = linexml.attr("lp").split(";");
                    for (var p = 0; p < lns.length; p++) {
                      var name = "";
                      if (lns[p].charAt(0) <= 57) name = "地铁" + lns[p] + "号线";
                      else {
                          if (lns[p] == "机场") {
                            name = lns[p] + "线";
                          } else if (lns[p] == "西郊") {
                            name = lns[p] + "线";
                          } else name = "地铁" + lns[p] + "线";
                      }
                      this._drawLineName(
                          name,
                          lps[p],
                          linexml.attr("lc").replace("0x", "#"),
                          ismask
                      );
                    }
                }

                for (var i = startdn; i < enddn; i++) {
                    this._drawStations(linexml, i, i + 1, dir, isline, ismask, isreal);
                }
                if (isline && linexml.attr("loop") == "true")
                    this._drawStations(
                    linexml,
                    enddn,
                    startdn,
                    dir,
                    isline,
                    ismask,
                    isreal
                    );

                if (isreal) {
                    var arrows = SVG.select(".arrow");
                    for (var i = arrows.length() - 1; i >= 0; i--) arrows.get(i).front();
                }

                for (var i = startdn; i < enddn; i++)
                    this._drawStation(linexml, i, ismask);
                this._drawStation(linexml, enddn, ismask);
            },

            _drawLineName: function(name, rc, lc, ismask) {
                var rs = rc.split(",");

                var rect = this.stage.rect(
                    this._parseNumber(rs[2]),
                    this._parseNumber(rs[3])
                );
                rect
                    .fill(lc)
                    .move(
                    this._offsetNumber(this._parseNumber(rs[0])),
                    this._offsetNumber(this._parseNumber(rs[1]))
                    );
                if (ismask) rect.addClass("mask");

                this.lineLayer.add(rect);

                var text = this.stage.text(name);
                text
                    .move(
                    this._offsetNumber(this._parseNumber(rs[0])) +
                        this._parseNumber(rs[2]) / 2,
                    this._offsetNumber(this._parseNumber(rs[1]))
                    )
                    .font({
                    fill: "white",
                    family: "微软雅黑",
                    size: 12
                    });
                text.attr({
                    "text-anchor": "middle"
                });
                text.y(
                    this._offsetNumber(this._parseNumber(rs[1])) +
                    (this._parseNumber(rs[3]) - text.bbox().height) / 2
                );
                if (ismask) text.addClass("mask");

                this.lineLayer.add(text);
            },

            _drawStations: function( linexml, startdn, enddn, dir, isline, ismask, isreal) {
                var ps = linexml.find("p");

                var rsp = null;
                var rep = null;
                if (isreal) {
                    var n = startdn % ps.length;
                    rsp = ps.eq(n);
                    while (rsp.attr("st") == "false") rsp = ps.eq(--n);

                    n = enddn % ps.length;
                    rep = ps.eq(n);
                    while (rep.attr("st") == "false") rep = ps.eq(++n);
                }

                this._drawStationLine(
                    ps.eq(startdn % ps.length),
                    ps.eq(enddn % ps.length),
                    rsp,
                    rep,
                    linexml.attr("lc").replace("0x", "#"),
                    dir,
                    isline,
                    ismask,
                    isreal
                );
            },

            _drawErrorIcon: function(mask) {
                // this.errorLayer.empty()

                var img = this.stage.image("/static/images/icon_error.png");
                img.size(this._parseNumber(14), this._parseNumber(14))
                    .move(
                    this._offsetNumber(this._parseNumber(922 - 7)),
                    this._offsetNumber(this._parseNumber(790 - 7))
                    );
                if (mask) {
                    img.opacity(0.5)
                }
                img.attr({
                    sdata: "天安门西",
                    acc: "150995216"
                });
                img.addClass("svg-error");


                // img.animate()

                this.errorLayer.add(img);
            },
            _drawStation: function(linexml, dn, ismask) {
                var ps = linexml.find("p");
                var ai = dn % ps.length;
                var cp = ps.eq(ai);
                var lc = "#000000";

                if (cp.attr("st") == "true") {
                    if (
                    !(
                        this._parseNumber(cp.attr("rx")) == 0 &&
                        this._parseNumber(cp.attr("ry")) == 0
                    )
                    ) {
                    if (cp.attr("iu") == "true")
                        lc = "#fff"; //暂缓开通
                    else lc = "#555";

                    var text = this.stage.text(cp.attr("lb"));
                    text
                        .move(
                        this._offsetNumber(this._parseNumber(cp.attr("x"))) +
                            this._parseNumber(cp.attr("rx")),
                        this._offsetNumber(this._parseNumber(cp.attr("y"))) +
                            this._parseNumber(cp.attr("ry")) +
                            5
                        )
                        .font({
                        fill: lc,
                        family: "微软雅黑",
                        size: 12
                        });
                    if (ismask) text.addClass("mask");

                    this.lineLayer.add(text);

                    if (cp.attr("iu") == "false") {
                        text = this.stage.text("(暂缓开通)");
                        text.move(
                            this._offsetNumber(this._parseNumber(cp.attr("x"))) +
                            this._parseNumber(cp.attr("rx")),
                            this._offsetNumber(this._parseNumber(cp.attr("y"))) +
                            this._parseNumber(cp.attr("ry")) +
                            this._parseNumber(18)
                        )
                        .font({
                            fill: lc,
                            family: "微软雅黑",
                            size: 12
                        });
                        if (ismask) text.addClass("mask");

                        this.lineLayer.add(text);
                    }
                    }

                    var isex = cp.attr("ex");
                    // var isError = null;
                    // var stationName = cp.attr("lb");

                    // for (let index = 0; index < plugin.options.errorList.length; index++) {
                    //     const lb = plugin.options.errorList[index].lb;

                    //     if (lb === stationName) {
                    //         isError = true
                            
                    //         // 删除已匹配车站，减少循环次数
                    //         // plugin.options.errorList.splice(index, 1)

                    //         break;
                    //     }
                        
                    // }


                    if (isex == "true") {
                        var src = '/static/images/turn.png';
                        var img = this.stage.image(src);
                        img.size(this._parseNumber(14), this._parseNumber(14)).move(
                            this._offsetNumber(this._parseNumber(cp.attr("x") - 7)),
                            this._offsetNumber(
                                this._parseNumber(
                                cp.attr("y") - 7 + (cp.attr("dy") != undefined ? this._parseNumber(cp.attr("dy")) : 0)
                                )
                            )
                            );
                        img.attr({
                            sdata: cp.attr("lb")
                        });
                        if (ismask) img.addClass("mask");

                        this.lineLayer.add(img);
                    } else {
                        var circle = this.stage.circle(this._parseNumber(8));
                        circle
                            .fill("white")
                            .stroke({
                            color: "white",
                            width: this._parseNumber(1)
                            })
                            .move(
                            this._offsetNumber(this._parseNumber(cp.attr("x")) - 4),
                            this._offsetNumber(this._parseNumber(cp.attr("y")) - 4)
                            );
                        circle.attr({
                            sdata: cp.attr("lb")
                        });
                        if (ismask) circle.addClass("mask");

                        this.lineLayer.add(circle);
                    }

                    var code = cp.attr("acc");
                    var imgError = this.stage.image('/static/images/transparent.png');
                    imgError.size(this._parseNumber(14), this._parseNumber(14)).move(
                        this._offsetNumber(this._parseNumber(cp.attr("x") - 7)),
                        this._offsetNumber(
                            this._parseNumber(
                            cp.attr("y") - 7 + (cp.attr("dy") != undefined ? this._parseNumber(cp.attr("dy")) : 0)
                            )
                        )
                    );
                    imgError.attr({
                        sdata: cp.attr("lb"),
                        code: code
                    });
                    if (cp.attr("iu") == "false") {
                        imgError.attr({
                            disable: '1'
                        })
                    }
                    if (ismask) imgError.addClass("mask");
                    imgError.addClass("error-station");

                    this.lineLayer.add(imgError);
                }
            },

            _drawStationLine: function(sp, ep, rsp, rep, lc, dir, isline, ismask, isreal) {
                var _lc = "";
                if (isreal) {
                    var colors = this._getRealColors(rsp, rep);
                    if (dir == true) {
                    lc = colors["ulc"];
                    _lc = colors["_ulc"];
                    } else {
                    lc = colors["dlc"];
                    _lc = colors["_dlc"];
                    }
                }

                if (sp.attr("arc") != undefined) {
                    var aps = sp.attr("arc").split(":");

                    var line = this.stage.path(
                    "M" +
                        this._offsetNumber(this._parseNumber(sp.attr("x"))) +
                        " " +
                        this._offsetNumber(this._parseNumber(sp.attr("y"))) +
                        " Q" +
                        this._offsetNumber(this._parseNumber(aps[0])) +
                        " " +
                        this._offsetNumber(this._parseNumber(aps[1])) +
                        " " +
                        this._offsetNumber(this._parseNumber(ep.attr("x"))) +
                        " " +
                        this._offsetNumber(this._parseNumber(ep.attr("y")))
                    );
                    line.fill("none").stroke({
                    color: lc,
                    width: this._parseNumber(5),
                    linecap: "round",
                    linejoin: "round"
                    });

                    if (ismask) line.addClass("mask");

                    this.lineLayer.add(line);
                } else {
                    var line = this.stage.line(
                    this._offsetNumber(this._parseNumber(sp.attr("x"))),
                    this._offsetNumber(this._parseNumber(sp.attr("y"))),
                    this._offsetNumber(this._parseNumber(ep.attr("x"))),
                    this._offsetNumber(this._parseNumber(ep.attr("y")))
                    );
                    line.stroke({
                    color: lc,
                    width: this._parseNumber(5),
                    linecap: "round",
                    linejoin: "round"
                    });

                    if (ismask) line.addClass("mask");

                    this.lineLayer.add(line);
                }

                //if (isreal) {
                if (isreal && _lc != "green") {
                    if (sp.attr("st") == "true") {
                    var img = null;
                    if (sp.attr("ai") != undefined) {
                        if (sp.attr("ai") == "2")
                        img = this.stage.image("/static/images/arrow_2.png");
                    } else {
                        img = this.stage.image('/static/images/arrow.png');
                    }
                    img.size(this._parseNumber(14), this._parseNumber(5));
                    img.center(
                        this._offsetNumber(
                        sp.attr("ax") != undefined ? this._parseNumber(sp.attr("ax")) : 0
                        ),
                        this._offsetNumber(
                        sp.attr("ay") != undefined ? this._parseNumber(sp.attr("ay")) : 0
                        )
                    );
                    if (sp.attr("aa") != undefined)
                        img.rotate(
                        this._parseNumber(sp.attr("aa")) + (dir == true ? 0 : 180)
                        );

                    img.addClass("arrow");
                    if (ismask) img.addClass("mask");

                    this.lineLayer.add(img);
                    }
                }
            },

            _mapMask: function(exresult) {
                if (typeof exresult == "string") exresult = eval("(" + exresult + ")");

                if (exresult.length > 0) {
                    var rect = this.stage.rect(
                    this._parseNumber(this.options.maskwidth),
                    this._parseNumber(this.options.maskheight)
                    );
                    rect
                    .fill("white")
                    .opacity(0.85)
                    .move(-250, 0);
                    rect.addClass("mask");

                    var pthis = this;
                    rect.click(function() {
                    if (pthis.options.ispan == false) pthis.options.clearSearch();
                    pthis.options.ispan = false;
                    });

                    this.lineLayer.add(rect);

                    for (var i = 0; i < exresult.length; i++) {
                    for (var p = 1; p < exresult[i].length; p++) {
                        var dir = true;
                        if (parseInt(exresult[i][p - 1][3]) != 0) {
                        if (
                            parseInt(exresult[i][p - 1][3]) > parseInt(exresult[i][p][3])
                        ) {
                            if (
                            parseInt(exresult[i][p - 1][3]) -
                                parseInt(exresult[i][p][3]) <=
                            4
                            )
                            //可能有占位点
                            dir = false;
                        }
                        } else {
                        if (parseInt(exresult[i][p][3]) > 3)
                            //可能有占位点
                            dir = false;
                        }
                        this._showLight(
                        exresult[i][0][0],
                        parseInt(exresult[i][p - 1][3]),
                        parseInt(exresult[i][p][3]),
                        dir,
                        false,
                        false
                        );
                    }
                    }

                    var ls = $(this.options.xml).find("l");
                    var sps = ls.eq(this._getLineIndex(exresult[0][0][0])).find("p");
                    var eps = ls
                    .eq(
                        this._getLineIndex(
                        exresult[exresult.length - 1][
                            exresult[exresult.length - 1].length - 1
                        ][0]
                        )
                    )
                    .find("p");

                    var sp = sps.eq(parseInt(exresult[0][0][3]));
                    var ep = eps.eq(
                    parseInt(
                        exresult[exresult.length - 1][
                        exresult[exresult.length - 1].length - 1
                        ][3]
                    )
                    );

                    var startimg = this.stage.image("/static/images/start.png");
                    startimg
                    .size(this._parseNumber(20), this._parseNumber(31))
                    .move(
                        this._offsetNumber(this._parseNumber(sp.attr("x") - 10)),
                        this._offsetNumber(this._parseNumber(sp.attr("y") - 30))
                    );
                    startimg.addClass("mask");

                    var endimg = this.stage.image("/static/images/end.png");
                    endimg
                    .size(this._parseNumber(20), this._parseNumber(31))
                    .move(
                        this._offsetNumber(this._parseNumber(ep.attr("x") - 10)),
                        this._offsetNumber(this._parseNumber(ep.attr("y") - 30))
                    );
                    endimg.addClass("mask");

                    this.lineLayer.add(startimg);
                    this.lineLayer.add(endimg);

                    var pw = Math.abs(
                    this._parseNumber(sp.attr("x")) - this._parseNumber(ep.attr("x"))
                    );
                    var ph = Math.abs(
                    this._parseNumber(sp.attr("y")) - this._parseNumber(ep.attr("y"))
                    );
                    var ps = Math.min(window.innerWidth / pw, window.innerHeight / ph);
                    if (ps - 0.4 <= 0.3) this.panzoom.zoom(0.3);
                    else if (ps - 0.4 < 1) this.panzoom.zoom(ps - 0.4);
                    else this.panzoom.zoom(1);

                    var pan = this.panzoom.getPan();
                    var zoom = this.panzoom.getZoom();
                    this._animatePan({
                      sx: pan.x,
                      sy: pan.y,
                      tx: -( this._parseNumber(sp.attr("x")) + this._parseNumber(ep.attr("x")) ) / 2 * zoom + window.innerWidth / 2,
                      ty: -( this._parseNumber(sp.attr("y")) + this._parseNumber(ep.attr("y")) ) / 2 * zoom + window.innerHeight / 2
                    });
                }
            },

            _mapRealMask: function(exresult) {
                if (typeof exresult == "string") exresult = eval("(" + exresult + ")");

                if (exresult.length > 0) {
                    var rect = this.stage.rect(
                    this._parseNumber(this.options.maskwidth),
                    this._parseNumber(this.options.maskheight)
                    );
                    rect
                    .fill("white")
                    .opacity(0.85)
                    .move(-250, 0);
                    rect.addClass("mask");

                    var pthis = this;
                    rect.click(function() {
                    if (pthis.options.ispan == false) pthis.options.clearSearch();
                    pthis.options.ispan = false;
                    });

                    this.lineLayer.add(rect);

                    for (var i = 0; i < exresult.length; i++) {
                    for (var p = 1; p < exresult[i].length; p++) {
                        var dir = true;
                        if (parseInt(exresult[i][p - 1][3]) != 0) {
                        if (
                            parseInt(exresult[i][p - 1][3]) > parseInt(exresult[i][p][3])
                        ) {
                            if (
                            parseInt(exresult[i][p - 1][3]) -
                                parseInt(exresult[i][p][3]) <
                            4
                            )
                            //可能有占位点
                            dir = false;
                        }
                        } else {
                        if (parseInt(exresult[i][p][3]) > 3)
                            //可能有占位点
                            dir = false;
                        }
                        this._showLight(
                        exresult[i][0][0],
                        parseInt(exresult[i][p - 1][3]),
                        parseInt(exresult[i][p][3]),
                        dir,
                        false,
                        true
                        );
                    }
                    }

                    var ls = $(this.options.xml).find("l");
                    var sps = ls.eq(this._getLineIndex(exresult[0][0][0])).find("p");
                    var eps = ls
                    .eq(
                        this._getLineIndex(
                        exresult[exresult.length - 1][
                            exresult[exresult.length - 1].length - 1
                        ][0]
                        )
                    )
                    .find("p");

                    var sp = sps.eq(parseInt(exresult[0][0][3]));
                    var ep = eps.eq(
                    parseInt(
                        exresult[exresult.length - 1][
                        exresult[exresult.length - 1].length - 1
                        ][3]
                    )
                    );

                    var startimg = this.stage.image("/static/images/start.png");
                    startimg
                    .size(this._parseNumber(20), this._parseNumber(31))
                    .move(
                        this._offsetNumber(this._parseNumber(sp.attr("x") - 10)),
                        this._offsetNumber(this._parseNumber(sp.attr("y") - 30))
                    );
                    startimg.addClass("mask");

                    var endimg = this.stage.image("/static/images/end.png");
                    endimg
                    .size(this._parseNumber(20), this._parseNumber(31))
                    .move(
                        this._offsetNumber(this._parseNumber(ep.attr("x") - 10)),
                        this._offsetNumber(this._parseNumber(ep.attr("y") - 30))
                    );
                    endimg.addClass("mask");

                    this.lineLayer.add(startimg);
                    this.lineLayer.add(endimg);

                    //srlx = (this._offsetNumber(this._parseNumber(sp.attr('x')-10))+this._offsetNumber(this._parseNumber(ep.attr('x')-10)))/2/ratio-$(window).width()/2
                    //srly = (this._offsetNumber(this._parseNumber(sp.attr('y')-34))+this._offsetNumber(this._parseNumber(ep.attr('y')-34)))/2/ratio-$(window).height()/3
                }
            },

            _removeMapMask: function() {
                var nodes = SVG.select(".mask");
                for (var i = nodes.length() - 1; i >= 0; i--) nodes.get(i).remove();

                nodes.clear();
            },

            _showLight: function(linenub, startn, endn, dir, isline, isreal) {
                var ls = $(this.options.xml).find("l");
                var line = ls.eq(this._getLineIndex(linenub));
                this._drawSubwayLine(line, startn, endn, dir, isline, true, isreal);
            },

            _highlightLine: function(line) {

                var startn = 0;
                var endn = 0;
                var lineid = 0;
                var ls = $(this.options.xml).find("l");
                for (var l = 0; l < ls.length; l++) {
                    if (line == ls.eq(l).attr("lb")) {
                    endn = ls.eq(l).find("p").length - 1;
                    lineid = ls.eq(l).attr("lcode");
                    //move to line center
                    var pan = this.panzoom.getPan();
                    var zoom = this.panzoom.getZoom();
                    this._animatePan({
                        sx: pan.x,
                        sy: pan.y,
                        tx: -this._parseNumber(ls.eq(l).attr("lbx")) * zoom + window.innerWidth / 2,
                        ty: -this._parseNumber(ls.eq(l).attr("lby")) * zoom + window.innerHeight / 2
                    });

                    break;
                    }
                }

                var rect = this.stage.rect(
                    this._parseNumber(this.options.maskwidth),
                    this._parseNumber(this.options.maskheight)
                );
                rect
                    .fill("black")
                    .opacity(0.85)
                    .move(-250, 0);
                rect.addClass("mask");
                var pthis = this;
                rect.click(function() {
                  pthis.options.clearSearch();
                });
                this.lineLayer.add(rect);
                this._showLight(lineid, startn, endn, true, true, false);
            },

            _getLineIndex: function(linenub) {
                var ls = $(this.options.xml).find("l");
                for (var l = 0; l < ls.length; l++) {
                    if (parseInt(ls.eq(l).attr("lcode")) == parseInt(linenub)) return l;
                }
            },

            _animatePan: function(amount) {
                // {sx: 1, sy: 2, tx: 3, ty: 4}
                var animationTime = 300; // ms
                var animationStepTime = 15; // one frame per 30 ms
                var animationSteps = animationTime / animationStepTime;
                var animationStep = 0;
                var intervalID = null;
                var stepX = (amount.tx - amount.sx) / animationSteps;
                var stepY = (amount.ty - amount.sy) / animationSteps;

                var pthis = this;
                intervalID = setInterval(function() {
                    if (animationStep++ < animationSteps) {
                    pthis.panzoom.panBy({
                        x: stepX,
                        y: stepY
                    });
                    } else {
                    clearInterval(intervalID);
                    }
                }, animationStepTime);
            },

            _animateZoom: function(zoom) {
                var animationTime = 50; // ms
                var animationStepTime = 15; // one frame per 30 ms
                var animationSteps = animationTime / animationStepTime;
                var animationStep = 0;
                var intervalID = null;
                var step = zoom / animationSteps;

                var svg = document.querySelector("#subwaymap_svg");
                var inversedScreenCTM = svg.getScreenCTM().inverse();
                var point = svg.createSVGPoint();
                point.x = window.innerWidth / 2;
                point.y = window.innerHeight / 2;
                var relativePoint = point.matrixTransform(inversedScreenCTM);

                var pthis = this;
                intervalID = setInterval(function() {
                    if (animationStep++ < animationSteps) {
                    pthis.panzoom.zoomAtPointBy(1 + step, point);
                    } else {
                    clearInterval(intervalID);
                    }
                }, animationStepTime);
            },

            _setFromTo: function(ft, station) {
                var img = null;
                if (ft == "from") img = this.stage.image("/static/images/start.png");
                else img = this.stage.image("/static/images/end.png");

                var stations = $(this.options.xml).find("p");
                for (var i = 0; i < stations.length; i++) {
                    var s = stations.eq(i);
                    if (s.attr("lb") == station) {
                    img
                        .size(this._parseNumber(20), this._parseNumber(31))
                        .move(
                        this._offsetNumber(this._parseNumber(s.attr("x") - 10)),
                        this._offsetNumber(this._parseNumber(s.attr("y") - 30))
                        );
                    img.addClass("mask");
                    this.lineLayer.add(img);

                    break;
                    }
                }
            },

            _zoomMap: function(io) {
                var zoom = this.panzoom.getZoom();

                if (io == "in") {
                    this._animateZoom(0.2);
                } else {
                    this._animateZoom(-0.2);
                }
            },

            _drawRealTags: function() {
                var tamimg = this.stage.image("/static/images/tam.png");
                tamimg
                    .size(this._parseNumber(85), this._parseNumber(26))
                    .move(
                    this._offsetNumber(this._parseNumber(908)),
                    this._offsetNumber(this._parseNumber(758))
                    );

                var northimg = this.stage.image("/static/images/north.png");
                northimg
                    .size(this._parseNumber(50), this._parseNumber(100))
                    .move(
                    this._offsetNumber(this._parseNumber(1710)),
                    this._offsetNumber(this._parseNumber(250))
                    );

                var airportimg = this.stage.image("/static/images/airport.png");
                airportimg
                    .size(this._parseNumber(40), this._parseNumber(40))
                    .move(
                    this._offsetNumber(this._parseNumber(1510)),
                    this._offsetNumber(this._parseNumber(355))
                    );

            // add the shape to the layer
            // this.realLayer.add(tamimg)
            // this.realLayer.add(zhizuo)
            // this.realLayer.add(northimg)
            // this.realLayer.add(airportimg)
            }
        };

        var methods = {
            init: function(options) {
                plugin.options = $.extend({}, plugin.defaults, options);

                $.ajax({
                    url: "/static/data/interchange.xml",
                    dataType: "xml",
                    type: "GET",
                    timeout: 5000,
                    error: function(xml) {
                        plugin.options.exml = null;
                        console.log("加载XML文件出错！");
                    },
                    success: function(xml) {
                        plugin.options.exml = xml;
                    }
                });

                $.ajax({
                    url: "/static/data/stations.xml",
                    dataType: "xml",
                    type: "GET",
                    timeout: 5000,
                    error: function(xml) {
                        plugin.options.sxml = null;
                        console.log("加载XML文件出错！");
                    },
                    success: function(xml) {
                        plugin.options.sxml = xml;
                    }
                });

                // var svgInterval = null;

                $.ajax({
                    url: "/static/data/beijing.xml",
                    dataType: "xml",
                    type: "GET",
                    timeout: 5000,
                    error: function(xml) {
                    plugin.options.xml = null;
                        console.log("加载XML文件出错！");
                    },
                    success: function(xml) {
                      plugin.options.xml = xml;
                      plugin._redraw();
                      plugin._initpos();

                      vueThis.svgLoaded();
                    }
                });

                return this.each(function(index) {
                    plugin.options = $.meta
                    ? $.extend(plugin.options, $(this).data())
                    : plugin.options;
                    plugin._debug("BEGIN: " + plugin.identity() + " for element " + index);
                    plugin._init($(this));
                    plugin._debug("END: " + plugin.identity() + " for element " + index);
                });
            },

            redraw: function(options) {
                plugin._mapMask(options.exresult);
            },

            showRealResult: function(options) {
                plugin._removeMapMask();
                plugin._mapRealMask(options.exresult);
            },

            hideRealResult: function(options) {
                plugin._removeMapMask();
                plugin._mapMask(options.exresult);
            },

            showRealTime: function(options) {
                plugin._drawRealTime();
            },

            hideRealTime: function(options) {
                plugin._hideRealTime();
            },

            getRealStationInfo: function(params) {
                var acc = params["acc"];
                return plugin._getRealStationColorByAcc(acc);
            },

            getStations: function() {
                var stations = [];

                if (plugin.options.xml == null || plugin.options.sxml == null)
                    return stations;

                $(plugin.options.xml)
                    .find("l")
                    .each(function(i) {
                    var ps = $(this).find("p");
                    for (var i = 0; i < ps.length; i++) {
                        var s = $.trim(ps.eq(i).attr("lb"));
                        if (s != "" && stations.indexOf(s) == -1) stations.push(s);
                    }
                    });

                return stations;
            },

            getStationInfo: function(params) {
                var infos = [];
                var station = params["station"];
                var stations = $(plugin.options.sxml).find("s");
                for (var i = 0; i < stations.length; i++) {
                    var s = stations.eq(i);
                    if (s.attr("name") == station) {
                    infos.push(s.attr("firstend"));
                    }
                }

                return infos;
            },

            getStationAcc: function(params) {
                var station = $.trim(params["station"]);
                var lines = $(plugin.options.xml).find("l");
                for (var l = 0; l < lines.length; l++) {
                    var ps = lines.eq(l).find("p");
                    for (var i = 0; i < ps.length; i++) {
                    if ($.trim(ps.eq(i).attr("lb")) == station) {
                        return ps.eq(i).attr("acc");
                    }
                    }
                }

                return "";
            },

            getLineId: function(params) {
                var station = $.trim(params["station"]);
                var lines = $(plugin.options.xml).find("l");
                for (var l = 0; l < lines.length; l++) {
                    var ps = lines.eq(l).find("p");
                    for (var i = 0; i < ps.length; i++) {
                    if ($.trim(ps.eq(i).attr("lb")) == station) {
                        return lines.eq(l).attr("lnub");
                    }
                    }
                }

                return "";
            },

            getLines: function() {
                var lines = [];

                $(plugin.options.xml).find("l").each(function() {

                    var $this = $(this);
                    lines.push({
                        lnub: $this.attr("lnub"),
                        lineName: $this.attr("lb"),
                        color: $this.attr("lc").replace("0x", "#"),
                        lineCode: $this.attr('lcode')
                    });
                });

                return lines;
            },

            getLineStations: function(params) {
                var line = params["line"];
                var stations = [];

                if (plugin.options.xml == null || plugin.options.sxml == null)
                    return stations;

                var lines = $(plugin.options.xml).find("l");
                for (var i = 0; i < lines.length; i++) {
                    if (lines.eq(i).attr("lnub") == line) {
                    var ps = lines.eq(i).find("p");
                    for (var j = 0; j < ps.length; j++) {
                        var s = $.trim(ps.eq(j).attr("lb"));
                        if (
                        s != "" &&
                        ps.eq(j).attr("iu") == "true" &&
                        stations.indexOf(s) == -1
                        )
                        stations.push(s);
                    }
                    break;
                    }
                }

                return stations;
            },

            getLineColor: function(params) {
                var line = params["line"];
                var lines = $(plugin.options.xml).find("l");
                for (var i = 0; i < lines.length; i++) {
                    if (
                    lines
                        .eq(i)
                        .attr("lb")
                        .replace("(东)", "")
                        .replace("(西)", "") == line
                    ) {
                    return lines
                        .eq(i)
                        .attr("lc")
                        .replace("0x", "#");
                    }
                }

                return "#008E9C";
            },

            getLineColorById: function(params) {
                var line = params["line"];
                var lines = $(plugin.options.xml).find("l");
                for (var i = 0; i < lines.length; i++) {
                    if (lines.eq(i).attr("lnub") == line) {
                    return lines
                        .eq(i)
                        .attr("lc")
                        .replace("0x", "#");
                    }
                }

                return "#008E9C";
            },

            getLineNameById: function(params) {
                var line = params["line"];
                var lines = $(plugin.options.xml).find("l");
                for (var i = 0; i < lines.length; i++) {
                    if (lines.eq(i).attr("lcode") == line) {
                    return lines.eq(i).attr("lb");
                    }
                }

                return "";
            },

            getExchangeTime: function(params) {
                var fl = params["fl"];
                var tl = params["tl"];
                var s = params["s"];
                var exs = $(plugin.options.exml).find("ex");
                for (var e = 0; e < exs.length; e++) {
                    var ex = exs.eq(e);
                    if (ex.attr("fl") == fl && ex.attr("s") == s && ex.attr("tl") == tl) {
                    return parseInt(ex.attr("t"));
                    }
                }

                return 0;
            },

            removeMapMask: function() {
                plugin._removeMapMask();
            },

            highlightLine: function(params) {
                var line = params["line"];
                plugin._highlightLine(line);
            },

            setFromTo: function(params) {
                var ft = params["ft"];
                var station = params["station"];
                plugin._setFromTo(ft, station);
            },

            zoomMap: function(params) {
                var io = params["io"];
                plugin._zoomMap(io);
            },

            fullScreen: function(params) {
                var oo = params["oo"];
                plugin._fullScreen(oo);
            }
        };

        $.fn.subwayMap = function(method) {
            // 方法调用逻辑
            if (methods[method]) {
                return methods[method].apply(
                    this,
                    Array.prototype.slice.call(arguments, 1)
                );
                
            } else if (typeof method === "object" || !method) {
                return methods.init.apply(this, arguments);
                
            } else {
                $.error("Method " + method + " does not exist on jQuery.tooltip");
            }
        };
      })(jQuery);

        var overStationHover = false;
        var overStationDot = false;
        var overStationPop = false;
        var overRealLine = false;
        var checkXml = null;
        var lastDelayTime = null;

        var findLineUrl = "";
        var getPriceUrl = "";
        var searchLineUrl = "";
        var getRealUrl = "";
        var getBlockUrl = "";
        var getDelayUrl = "";

      $(function() {
        //FastClick.attach(document.body);
        $(".subway-map").subwayMap({
            debug: false,
            getRealUrl: getRealUrl,
            getBlockUrl: getBlockUrl,
            showStationInfo: function(station, acc, block, sx, sy, scale) {
                overStationDot = true;
                setTimeout(function() {
                    showStationHover(station, acc, block, sx, sy, scale);
                }, 300);
            },
            hideStationInfo: function() {
                overStationDot = false;
                if (overStationHover == false) setTimeout("hideStationHover()", 300);
            },
            forceHideStationInfo: function() {
                forceHideStationHover();
                forceHideStationPop();
            },
            showLineRealInfo: function(lineinfo, sx, sy) {
                overRealLine = true;
                setTimeout(function() {
                    showLineHover(lineinfo, sx, sy);
                }, 300);
            },
            hideLineRealInfo: function() {
                overRealLine = false;
                $("#lineRealHover").hide();
            },
            selectStation: function(station, sx, sy) {
                forceHideStationHover();

                alert("您选择了" + station);
            },
            clearSearch: function () {
                $(".subway-map").subwayMap("removeMapMask", {});
            }
        });

        checkXml = setInterval(checkXmlLoaded, 1000);

        $("#stationHover").bind("mouseover", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            overStationHover = true;
        });

        $("#stationHover").bind("mouseout", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (evt.relatedTarget != undefined) {
            if ($(evt.relatedTarget).hasClass("station-hover-info")) return;
            }

            overStationHover = false;
            setTimeout("hideStationHover()", 300);
        });

        $("#stationPicHover").bind("mouseover", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            overStationHover = true;
        });

        $("#stationPicHover").bind("mouseout", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (evt.relatedTarget != undefined) {
            if ($(evt.relatedTarget).hasClass("station-hover-info")) return;
            }

            overStationHover = false;
            setTimeout("hideStationHover()", 300);
        });

        $("#stationPop").bind("mouseout", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (evt.relatedTarget != undefined) {
            if ($(evt.relatedTarget).hasClass("station-pop")) return;
            }

            overStationPop = false;
            setTimeout("hideStationPop()", 300);
        });

        $("#detailinfo").click(function() {
            $("#resultInfos")
                .find("ul")
                .slideToggle("fast");
                if ($("#detailinfo").text() == "关闭详情-") {
                $("#detailinfo").text("展开详情+");
                } else {
                $("#detailinfo").text("关闭详情-");
                }
            });
        });

        function showStationHover(station, acc, block, sx, sy, scale) {
            if (overStationDot == false) return;

            var oldStation = $("#stationHoverName").text();
            $("#stationHoverName").text(station);
            $("#stationHoverInfos").empty();
            if (block != null) {
                var bts = block.split("|");
                var btstr = "";
                for (var i = 0; i < bts.length; i++) btstr += bts[i] + "&nbsp;&nbsp;";
                $("#stationHoverInfos").append(
                "<div style='color: red; margin-left: 10px;' class='station-hover-info'>限流时间：<br/>" +
                    btstr +
                    "</div>"
                );
            }
            var infos = $(".subway-map").subwayMap("getStationInfo", {
                station: station
            });
            if (infos.length > 0) {
                var info = "";
                for (var i = 0; i < infos.length; i++) {
                var arr = infos[i].split("||||||");
                var name = infos[i].split("::::::")[0];
                var color = $(".subway-map").subwayMap("getLineColor", {
                    line: name
                });
                info +=
                    "<div style='margin: 5px; margin-top: 0px; padding: 10px 0px;' class='station-hover-info'><div style='border-bottom: 1px solid " +
                    color +
                    ";' class='station-hover-info'><span style='padding: 4px; background-color: " +
                    color +
                    "; color: white;' class='station-hover-info'>" +
                    name +
                    "</span></div>";
                for (var a = 0; a < arr.length; a++) {
                    var fes = arr[a].split("::::::");
                    info +=
                    "<div style='margin-top: 10px;' class='station-hover-info'>" +
                    fes[1] +
                    "</div>";
                    for (var f = 2; f < fes.length; f++)
                    info +=
                        "<div style='font-size: 12px;' class='station-hover-info'>" +
                        fes[f].replace(/、/g, " ") +
                        "</div>";
                }
                info += "</div>";
                }
                info =
                "<div style='color: black;' class='station-hover-info'>" +
                info +
                "</div>";
                $("#stationHoverInfos").append(info);

                if ($("#stationHover").css("display") == "none" || oldStation != station) {
                $("#stationHoverInfos").scrollTop(0);
                $("#stationHover").show();
                //overStationHover = true;
                $("#stationHover").css("left", sx);
                $("#stationHover").css(
                    "top",
                    sy - $("#stationHover").height() - 3 * scale
                );
                $("#stationHoverInfos").css("overflow-y", "scroll");
                }
            }

            if (acc != null) {
                //realtime
                infos = $(".subway-map").subwayMap("getRealStationInfo", {
                acc: acc
                });
                if (infos["pic"] != "") {
                if (
                    $("#stationPicHover").css("display") == "none" ||
                    oldStation != station
                ) {
                    $("#stationPicHover").show();
                    $("#stationPicHover").css("left", sx - 165);
                    $("#stationPicHover").css("top", sy - 130 - 3 * scale);
                    $("#stationHoverPic").attr("src", "subwaymap/realpic/" + infos["pic"]);
                }
                }
            }
        }

        function showStationInfo(station) {
            $("#station").blur();
            $("#stationname")
                .find("span")
                .text(station);
            $("#stationinfos").empty();
            $("#stationinfos").css("max-height", window.innerHeight - 345);

            var infos = $(".subway-map").subwayMap("getStationInfo", {
                station: station
            });
            if (infos.length > 0) {
                var info = "";
                for (var i = 0; i < infos.length; i++) {
                var arr = infos[i].split("||||||");
                var name = infos[i].split("::::::")[0];
                info +=
                    "<div style='margin: 10px; margin-top: 0px; padding: 10px 0px; border-top: 1px solid white;'><div><span style='padding: 5px; background-color: white; color: #3798cb;'>" +
                    name +
                    "<span></div>";
                for (var a = 0; a < arr.length; a++) {
                    var fes = arr[a].split("::::::");
                    info += "<div style='margin-top: 10px;'>" + fes[1] + "</div>";
                    for (var f = 2; f < fes.length; f++)
                    info +=
                        "<div style='font-size: 12px;'>" +
                        fes[f].replace(/、/g, " ") +
                        "</div>";
                }
                info += "</div>";
                }
                info = "<div style='color: white;'>" + info + "</div>";
                $("#stationinfos").append(info);
            }

            $("#stationinfo").show();
        }

        function hideStationHover() {
            if (overStationHover == false && overStationDot == false) {
                $("#stationHover").hide();
                $("#stationPicHover").hide();
            }
        }

        function forceHideStationHover() {
            overStationHover = false;
            overStationDot = false;
            $("#stationHover").hide();
        }

        function hideStationPop() {
            if (overStationPop == false) $("#stationPop").hide();
        }

        function forceHideStationPop() {
            $("#stationPop").hide();
        }

        function checkXmlLoaded() {
            var stations = [];
                stations = $(".subway-map").subwayMap("getStations");
            if (stations.length > 0) {
                clearInterval(checkXml);

                $("#station").bind("input propertychange", function(ev) {
                var nowStationName = $("#stationname")
                    .find("span")
                    .text();
                if (nowStationName == "") return;

                if ($.trim($("#station").val()) != nowStationName) {
                    $("#stationinfo").hide();
                    $("#stationname")
                    .find("span")
                    .text("");
                    $("#stationinfos").empty();
                }
                });

                var lines = $(".subway-map").subwayMap("getLines")


                vueThis.lineMenu = lines
            }
        }

        var substringMatcher = function(strs) {
            return function findMatches(q, cb) {
                var matches, substringRegex;
                // an array that will be populated with substring matches
                matches = [];
                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, "i");
                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
                });

                cb(matches);
            };
        };


        function focusLine(line) {
            $(".subway-map").subwayMap("highlightLine", {
                line: line
            });
        }


        function Lnameex(line) {
            return $(".subway-map").subwayMap("getLineNameById", {
                line: line
            });
        }

        function checkcolor(line) {
            return $(".subway-map").subwayMap("getLineColorById", {
                line: line
            });
        }


        function zoomMap(io) {
            $(".subway-map").subwayMap("zoomMap", {
                io: io
            });
        }

        function fullScreen() {
            if ($.fullscreen.isFullScreen() == false) {
                $("body").fullscreen();
            } else {
                $.fullscreen.exit();
            }
        }


        function onResize() {
            $("#subwaymap_svg").css("width", window.innerWidth);
            $("#subwaymap_svg").css("height", window.innerHeight);
        }

        $(function() {
            onResize();

            $(document).bind("fscreenchange", function(e, state, elem) {
                if ($.fullscreen.isFullScreen()) {
                    $("#navbar").hide();
                    $("#navbottom").hide();
                    $("#stationForm").css("top", 20);
                    $("#searchForm").css("top", 20);
                    $("#realSwitch").css("top", 20);
                    $("#zoomBtns").css("bottom", 10);

                    $("#fullicon").attr("src", "images/fulloff.png");
                    } else {
                    $("#navbar").show();
                    $("#navbottom").show();
                    $("#stationForm").css("top", 120);
                    $("#searchForm").css("top", 120);
                    $("#realSwitch").css("top", 120);
                    $("#zoomBtns").css("bottom", 40);

                    $("#fullicon").attr("src", "images/fullon.png");
                }
            });

            $(window).bind("resize", function() {
                onResize();
            });
      });
    },
    getStationOverview () {
        let data = {
            serialNumber: this.$global().serialNumber
        }
        this.$post('/subway/station_overview', data).then(res => {
            if (res.code === 'success') {
                this.stationOverview = res.data.stations
            } else {
                alert(res.message)
            }
        })
    },
    getWarningOverview () {
        let data = {
            serialNumber: this.$global().serialNumber
        }
        this.$post('/subway/warning_overview', data).then(res => {
            if (res.code === 'success') {
                this.lineWarning = res.data
                res.data.lines.forEach(item => {
                    console.log(item.lineName, item.lineCode)
                 })
                //sessionStorage.setItem('lineList', JSON.stringify(res.data.lines));

            } else {
                alert(res.message)
            }
        })    
    },
    setErrorStation () {
      var lines = this.errorStationList
      var $errorStation = $('.error-station')

      $errorStation.each( function() {
        $(this).attr('href', '/static/images/transparent.png')
      })

      $errorStation.each(function() {
        var sdata = $(this).attr('sdata')
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          if (sdata === line.lb) {
            $(this).attr('href', '/static/images/icon_error.gif')

            break;
          }
        }
        
      })

    },
    svgLoaded () {
      var that = this
      this.timer = setInterval(function () {
        let data = {
            serialNumber: that.$global().serialNumber
        }
        that.$post('/subway/waring_stations', data).then(res => {
            if (res.code === 'success') {
                that.errorStationList = res.data.stations
              
                that.setErrorStation()
        } else {
          alert(res.message)
        }
        })

      }, 120000)
      
    },
    isLineInSystem (lineCode) {
        let lineList = this.lineWarning.lines
        let inSystem = false
        for (var i = 0, len = lineList.length; i < len; i++) {
            if (lineCode == lineList[i].lineCode) {
                inSystem = true;
                break;
            }
        }
        return inSystem;
    },
    focusline (line, code) {
        let inSystem = this.isLineInSystem(code)
        if (!inSystem) {
            alert(this.notInSystemMsg)
            return false;
        }

        if (this.curLineName !== line) {
          
          $(".subway-map").subwayMap("highlightLine", {
              line: line
          });

          let data = {
            serialNumber: this.$global().serialNumber,
            data: {
                lineCode: code
            }
        }
        this.$post('/subway/wraning_line', data).then(res => {
            if (res.code === 'success') {
              this.curLineCondition = res.data
        } else {
          alert(res.message)
        }
        })


          this.setErrorStation()

          this.curLineName = line
          this.isAllStation = false
        }
    },
    handleMousemove (evnet) {
        let $event = $(event.target)
        let nodeName = $event[0].nodeName

        let sdata = ''

        if (nodeName === 'circle'  || nodeName === 'image') {
            sdata = $event.attr('sdata')
            let num = $event.attr('code');
            let code = this.getCode(num);
            let isInSystem = this.isLineInSystem(code.lineCode);


            if (!isInSystem) {
                return false;
            }
            let isDisabled = $event.attr('disable')
            if (isDisabled) {
                return false;
            }

            if (sdata) {
                !this.isHoverStation && this.setStationInfo(sdata, evnet.clientX, evnet.clientY)

                this.isHoverStation = true
            } else {
                this.isHoverStation = false
            }
        } else {
            this.isHoverStation = false
        }
    },
    getCode (num) {        
        let reg = /\w{2}/g;
        let code = Number(num).toString(16);
        code = code.length == 8 ? code : '0' + code
        let arr = code.match(reg);
        let lineCode = parseInt(arr[2], 16);
        let stationCode = parseInt(arr[3], 16);
        stationCode = lineCode + '' + stationCode;

        lineCode = lineCode < 10 ? '0' + lineCode : lineCode;
        stationCode = stationCode < 1000 ? '0' + stationCode : stationCode;

        console.log(lineCode, stationCode)
        return {
            lineCode: lineCode,
            stationCode: stationCode
        }
    },
    chooseStation (evnet) {
        let $event = $(event.target)
        let nodeName = $event[0].nodeName

        let num = ''


        if (nodeName === 'circle'  || nodeName === 'image') {
            num = $event.attr('code')
            if (num) {
                let code = this.getCode(num);
                let stationName = $event.attr('sdata');
                let isDisabled = $event.attr('disable')

                let isInSystem = this.isLineInSystem(code.lineCode)

                if (!isInSystem) {
                    alert(this.notInSystemMsg)
                    return false;
                }

                if (isDisabled) {
                    alert('该站点暂未开通使用！')
                    return false;
                }

                this.$router.push({
                    path: '/StationDetail',
                    query: {
                        lineCode: code.lineCode,
                        stationCode: code.stationCode,
                        stationName: stationName
                    }
                })
            }
        } else if (!this.isAllStation && nodeName === 'rect') {
            this.isAllStation = true
            this.curLineName = ''
        }


    },
    setStationInfo (name, x, y) {
      let stations = this.stationOverview,
          ftCount = 0,
          ztCount = 0;

      for (let index = 0; index < stations.length; index++) {
        const element = stations[index];

        if (element.name === name) {
          ftCount = element.ftCount
          ztCount = element.ztCount
          break;
        }
        
      }

      this.stationInfo = {
          name: name,
          futi: ftCount,
          zhiti: ztCount,
          leftX: x,
          topY: y
      }
        
    },
    slidePanel (index) {
        if (index === 0) {
            this.isSlideAll = !this.isSlideAll
        } else if (index === 1) {
            this.isSlideCur = !this.isSlideCur
        }
    }
  },
  destroyed () {
    clearInterval(this.timer)
  },
  beforeRouteEnter (to, from, next) {
      if (from.path === '/') {
        next();
      } else {
          next(vm => {
              vm.$router.go(0)
          })
      }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#subway_map {
  background-color: #000!important;
}
#linesDiv {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #2b3247;
  color: #fff;
}
#lineswrap {
  display: flex;
    > .lines-title {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 100px;
        background-color: #0a6bcc;
    }
}
#lines {
  display: flex;
  flex-wrap: wrap;

  >li {
    height: 44px;
    line-height: 44px;
    padding: 0 15px;
    cursor: pointer;
  }
}

#station-hover {
    width: 2px;
    height: 2px;
    position: absolute;
    z-index: 100;
    left: 0px;
    top: 0px;

    >.station-hover-wrap {
        position: absolute;
        left: 3px;
        bottom: 6px;
        width: 120px;
        padding: 15px;
        text-align: left;
        border: 2px solid rgba(43,50,71,0.30);
        color: #333;
        background-color: #fff;

        >h3 {
            font-size: 18px;
            line-height: 25px;
            margin-bottom: 5px;
        }

        >ul {
            font-size: 14px;
            line-height: 20px;
        }
    }
}

.icon-overview {
  background-image: url(../assets/icon_overview.png);
}
.icon-darr {
  background-image: url(../assets/icon_darr.png);
}
.icon-lines {
    background-image: url(../assets/icon_lines.png);
}

.condition {
  position: fixed;
  right: 20px;
  top: 64px;
  width: 480px;
  max-height: 32px;
  border-radius: 3px;
  box-shadow: 0 0 2px 0;
  overflow: hidden;
  transition: all 0.5s linear;

  .error {
    color: #f00;
  }

  > .condition-title {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    line-height: 32px;
    background-color: #2b3247;
    color: #fff;
    text-align: center;
    cursor: pointer;

    > .icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      background-size: 16px 16px;
      background-repeat: no-repeat;
      margin: 0 5px;
    }

    > .icon-darr {
        transform: rotate(180deg);
        transition: transform 0.3s linear;
    }
  }

    .condition-body {
        background-color: #fff;
        padding: 0 20px 16px;
        font-size: 14px;
        color: #333;
    }

  &.active {
    max-height: 1000px;
      > .condition-title {
        > .icon-darr {
            transform: rotate(0);
        }
      }

  }
}

.condition-count {
  display: flex;
  padding: 15px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;

    > li {
        width: 50%;
        height: 25px;
        line-height: 25px;

        > span {
            font-size: 18px;
        }
    }
}

.condition-line {
  display: flex;
  flex-wrap: wrap;

    > li {
      display: flex;
      align-items: center;
        width: 50%;
        height: 20px;
        line-height: 20px;
        margin-bottom: 4px;

        >i {
            width: 8px;
            height: 8px;
            background-color: #f00;
            margin-right: 4px;
        }
    }
}

.line-condition {
  .condition-line {
    >li {
      >i {
        display: none;
      }
    }
  }
}

@media screen and (max-width: 1000px) {
    #linesDiv {
        display: none;
    }
    .condition {
        display: none;
    }
}
</style>

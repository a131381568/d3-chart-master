<template>
  <div class="card">
    <h2 class="card-title">{{ chartTitle }}</h2>
    <h4 class="card-description">{{ chartDescription }}</h4>
    <div class="svgboard-container">
      <svg
        id="svgboard"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMinYMin meet"
        width="100%"
        height="200"
      >
        <!-- 提示話框 -->
        <foreignObject
          v-show="benefitTipState"
          :class="['top-tip-text-box', { 'tip-is-ellipsis': tipIsEllipsis }]"
          :x="chartX1"
          y="-48"
        >
          <div class="top-tip-text">
            已實現獲利 ${{ separator(benefitValue) }}
          </div>
        </foreignObject>
        <foreignObject
          v-show="lossTipState"
          :class="['top-tip-text-box', { 'tip-is-ellipsis': tipIsEllipsis }]"
          :x="chartX1"
          y="-48"
        >
          <div class="top-tip-text">
            已實現虧損 ${{ separator(maxNegative) }}
          </div>
        </foreignObject>
        <foreignObject
          v-show="costTipState"
          :class="['top-tip-text-box', { 'tip-is-ellipsis': tipIsEllipsis }]"
          :x="chartX2"
          y="-48"
        >
          <div class="top-tip-text">總交易成本 ${{ separator(costValue) }}</div>
        </foreignObject>
        <!-- 刻度 -->
        <foreignObject
          v-show="maxY > 23"
          class="scale-bar-text-box"
          x="0"
          y="0"
        >
          <div class="scale-bar-text">{{ outPutMaxVal }}</div>
        </foreignObject>
        <foreignObject class="scale-bar-text-box" x="0" :y="horizontalY - 10">
          <div class="scale-bar-text">0</div>
        </foreignObject>
        <foreignObject
          v-show="minY > 22"
          class="scale-bar-text-box"
          x="0"
          :y="height - 18"
        >
          <div class="scale-bar-text">{{ outPutMinVal }}</div>
        </foreignObject>
        <!-- 圖表 -->
        <g>
          <path
            :class="[
              'benefit',
              { 'chart-active': benefitTipState },
              { 'chart-freeze': costTipState || lossTipState },
            ]"
            @click.prevent="toggleTip('benefit')"
          ></path>
          <path
            :class="[
              'cost',
              { 'chart-active': costTipState },
              { 'chart-freeze': benefitTipState || lossTipState },
            ]"
            @click.prevent="toggleTip('cost')"
          ></path>
          <path
            :class="[
              'loss',
              { 'chart-active': lossTipState },
              { 'chart-freeze': benefitTipState || costTipState },
            ]"
            @click.prevent="toggleTip('loss')"
          ></path>
          <line class="horizontal-line"></line>
        </g>
        <!-- 虛線 -->
        <line
          v-show="benefitTipState"
          class="benefit-line tip-line"
          :x1="2 * leftScaleBar - rectWidth + rectWidth / 2"
          y1="-16"
          :x2="2 * leftScaleBar - rectWidth + rectWidth / 2"
          y2="0"
        />
        <line
          v-show="costTipState"
          class="cost-line tip-line"
          :x1="3 * leftScaleBar - rectWidth + rectWidth / 2"
          y1="-16"
          :x2="3 * leftScaleBar - rectWidth + rectWidth / 2"
          :y2="
            height -
            height * (costValue / totalH) +
            height * (maxNegative / totalH)
          "
        />
        <line
          v-show="lossTipState"
          class="loss-line tip-line"
          :x1="2 * leftScaleBar - rectWidth + rectWidth / 2"
          y1="-16"
          :x2="2 * leftScaleBar - rectWidth + rectWidth / 2"
          :y2="height * (benefitValue / totalH)"
        />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import * as d3 from "d3";
import { chartData, chartInfoList } from "../type/types";
const dataSet = ref<chartInfoList>([]);
const chartTitle = ref("");
const chartDescription = ref("");
const width = ref(125); // 畫布寬度
const height = ref(200); // 畫布高度
const costValue = ref(0); // 總交易成本
const benefitValue = ref(0); // 已實現獲利
const maxNegative = ref(0); // 最小負數
const rectStep = 90; // 長條圖的間距
const rectWidth = 35; // 長條圖的寬度
const rectRadius = 4; // 長條圖的圓角
const maxValue = ref(200); // 最大正數
const disPlayH = 200;
const totalH = ref(500);
const leftScaleBar = 90;
const horizontalY = ref(0);
const maxY = ref(0);
const minY = ref(10);
const chartX1 = ref(1 * leftScaleBar - rectWidth);
const chartX2 = ref(2 * leftScaleBar - rectWidth);
const benefitTipState = ref(false);
const costTipState = ref(false);
const lossTipState = ref(false);
const tipIsEllipsis = ref(false);

// 取得資料
const getData = () => {
  // 假資料
  const demoData: chartData = {
    title: "Maecenas elit quam",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id nisi placerat, placerat dui dictum.",
    benefitVal: 270537,
    costVal: 216801,
    lossVal: -33910,
  };
  // 輸入資料
  chartTitle.value = demoData.title;
  chartDescription.value = demoData.description;
  dataSet.value = [
    {
      type: "benefit",
      value: demoData.benefitVal,
    },
    {
      type: "cost",
      value: demoData.costVal,
    },
    {
      type: "loss",
      value: demoData.lossVal,
    },
  ];
  // 已實現獲利,最小值,總交易成本, 比較後取得最大值
  maxValue.value =
    demoData.benefitVal > demoData.costVal
      ? demoData.benefitVal
      : demoData.costVal;
  maxNegative.value = demoData.lossVal;
  costValue.value = demoData.costVal;
  benefitValue.value = demoData.benefitVal;
  // 正負最大高度總合
  totalH.value = maxValue.value + Math.abs(maxNegative.value);
  height.value = disPlayH;
  width.value = 3 * rectStep - rectWidth;
  // 取得水平線 Y
  horizontalY.value =
    height.value - height.value * (Math.abs(maxNegative.value) / totalH.value);
};

// 計算刻度函式
const scaleOutPutVal = (val: number) => {
  if (val > 1000000000000 || val < -1000000000000) {
    // 兆
    const kNum = (val / 1000000000000).toFixed(0);
    return String(kNum) + "T";
  } else if (val > 1000000000 || val < -1000000000) {
    // 十億
    const kNum = (val / 1000000000).toFixed(0);
    return String(kNum) + "B";
  } else if (val > 1000000 || val < -1000000) {
    // 百萬
    const kNum = (val / 1000000).toFixed(0);
    return String(kNum) + "M";
  } else if (val > 100 || val < -100) {
    // 百, 千, 萬, 十萬
    let kNum = (val / 1000).toFixed(1);
    const toArr = String(kNum).split(".");
    if (toArr[toArr.length - 1] === "0") {
      kNum = (val / 1000).toFixed(0);
    }
    return String(kNum) + "K";
  } else if (val <= 100 || val >= -100) {
    // 十位
    return val;
  } else {
    // 兆
    const kNum = (val / 1000000000000).toFixed(0);
    return String(kNum) + "T";
  }
};

// 刻度最大值
const outPutMaxVal = computed(() => {
  return scaleOutPutVal(maxValue.value);
});

// 刻度最小值
const outPutMinVal = computed(() => {
  return scaleOutPutVal(maxNegative.value);
});

// 製作長條圖函式
const drawRect = (chartType: string, val: number) => {
  let order = 0;
  switch (chartType) {
    case "benefit":
      order = 1;
      break;
    case "cost":
      order = 2;
      break;
    case "loss":
      order = 1;
      break;
    default:
      break;
  }

  const w = rectWidth;
  // 使用 maxValue 作為畫面高度 100% 計算該筆資料佔畫面的百分比
  let h = height.value * (val / totalH.value);
  let x = order * rectStep - w + leftScaleBar;
  // 畫面高度 - 長條圖高度 = 繪製長條圖的起點
  let y = horizontalY.value - h;

  const r = rectRadius;
  let tl = rectRadius;
  let tr = rectRadius;
  let bl = 0;
  let br = 0;

  if (val < 0) {
    tl = 0;
    tr = 0;
    bl = rectRadius;
    br = rectRadius;
    h = height.value * (Math.abs(val) / totalH.value);
    y = height.value - height.value * (Math.abs(val) / totalH.value);
    x = order * rectStep - w + leftScaleBar;
    // 儲存最小的顯示高度
    if (h > minY.value) {
      minY.value = h;
    }
  } else {
    // 儲存最大的顯示高度
    if (h > maxY.value) {
      maxY.value = h;
    }
  }

  let retval;
  retval = "M" + (x + r) + "," + y;
  retval += "h" + (w - 2 * r);
  if (tr) {
    retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r;
  } else {
    retval += "h" + r;
    retval += "v" + r;
  }
  retval += "v" + (h - 2 * r);
  if (br) {
    retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r;
  } else {
    retval += "v" + r;
    retval += "h" + -r;
  }
  retval += "h" + (2 * r - w);
  if (bl) {
    retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r;
  } else {
    retval += "h" + -r;
    retval += "v" + -r;
  }
  retval += "v" + (2 * r - h);
  if (tl) {
    retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r;
  } else {
    retval += "v" + -r;
    retval += "h" + r;
  }
  retval += "z";
  return retval;
};

// 切換顯示資訊框
const toggleTip = (chartType: string) => {
  switch (chartType) {
    case "benefit":
      if (benefitTipState.value) {
        benefitTipState.value = false;
        costTipState.value = false;
        lossTipState.value = false;
      } else {
        if (benefitValue.value > 100000000000000000) {
          tipIsEllipsis.value = true;
        } else {
          tipIsEllipsis.value = false;
        }
        benefitTipState.value = true;
        costTipState.value = false;
        lossTipState.value = false;
      }
      break;
    case "cost":
      if (costTipState.value) {
        benefitTipState.value = false;
        costTipState.value = false;
        lossTipState.value = false;
      } else {
        if (costValue.value > 100000000000000000) {
          tipIsEllipsis.value = true;
        } else {
          tipIsEllipsis.value = false;
        }
        benefitTipState.value = false;
        costTipState.value = true;
        lossTipState.value = false;
      }
      break;
    case "loss":
      if (lossTipState.value) {
        benefitTipState.value = false;
        costTipState.value = false;
        lossTipState.value = false;
      } else {
        if (maxNegative.value < -100000000000000000) {
          tipIsEllipsis.value = true;
        } else {
          tipIsEllipsis.value = false;
        }
        benefitTipState.value = false;
        costTipState.value = false;
        lossTipState.value = true;
      }
      break;
    default:
      break;
  }
};

// 數字轉成含逗號字串
const separator = (numb: number) => {
  const str = numb.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
};

onMounted(() => {
  // 取得資料
  getData();

  // 繪製長條圖
  d3.select("#svgboard > g > .benefit").attr(
    "d",
    drawRect("benefit", benefitValue.value)
  );
  d3.select("#svgboard > g > .cost").attr(
    "d",
    drawRect("cost", costValue.value)
  );
  d3.select("#svgboard > g > .loss").attr(
    "d",
    drawRect("loss", maxNegative.value)
  );

  // 繪製水平線
  const drawLine = d3.select("#svgboard > g > line");
  drawLine
    .attr("x1", 0 + +leftScaleBar)
    .attr("y1", horizontalY.value)
    .attr("x2", width.value + leftScaleBar)
    .attr("y2", horizontalY.value);
});
</script>
<style>
.card {
  width: 30%;
}
.benefit {
  fill: #1977ff;
}
.loss {
  fill: #231fc0;
}
.cost {
  fill: #fa8903;
}
.svgboard-container {
  /* resize: horizontal; */
  overflow: visible;
  width: 100%;
  height: auto;
  margin: 0 auto;
  margin-top: 75px;
}
#svgboard {
  overflow: visible;
}
.scale-bar-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}
.scale-bar-text-box {
  width: 60px;
  height: 30px;
}
.top-tip-text-box {
  width: calc(100% + 40px);
  height: 32px;
}

.top-tip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  color: #fff;
  font-size: 13px;
  height: 32px;
  line-height: 32px;
  background: #444;
  border-radius: 4px;
  display: inline-block;
  padding: 0 10px;
}
.tip-is-ellipsis .top-tip-text {
  display: block;
}
.horizontal-line {
  stroke: #c3cbd3;
  stroke-width: 1px;
}
.tip-line {
  stroke: #919eaa;
  stroke-width: 1px;
  stroke-dasharray: 4px;
}
.benefit.chart-freeze {
  fill: #b3d6ff;
}
.cost.chart-freeze {
  fill: #fdddb3;
}
.loss.chart-freeze {
  fill: #bdbcec;
}
</style>

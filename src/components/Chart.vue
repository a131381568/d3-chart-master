<template>
  <div class="card">
    <h2 class="card-title">{{ chartTitle }}</h2>
    <h4 class="card-description">{{ chartDescription }}</h4>
    <div class="svgboard-container">
      <svg
        id="svgboard"
        viewBox="0 0 325 200"
        preserveAspectRatio="xMinYMin meet"
        width="100%"
        height="200"
      >
        <!-- 提示話框 -->
        <foreignObject
          :class="[
            'top-tip-text-box',
            { 'tip-is-ellipsis': tipIsEllipsis },
            { 'hide-item': benefitTipState || chartIsFreeze === 'benefit' },
          ]"
          x="0"
          y="-48"
        >
          <div class="top-tip-text benefit-top-tip-text">
            已實現獲利 ${{ separator(benefitValue) }}
          </div>
        </foreignObject>
        <foreignObject
          :class="[
            'top-tip-text-box',
            { 'tip-is-ellipsis': tipIsEllipsis },
            { 'hide-item': lossTipState || chartIsFreeze === 'loss' },
          ]"
          x="0"
          y="-48"
        >
          <div class="top-tip-text loss-top-tip-text">
            已實現虧損 ${{ separator(maxNegative) }}
          </div>
        </foreignObject>
        <foreignObject
          :class="[
            'top-tip-text-box',
            { 'tip-is-ellipsis': tipIsEllipsis },
            { 'hide-item': costTipState || chartIsFreeze === 'cost' },
          ]"
          :x="1 * rectStep"
          y="-48"
        >
          <div class="top-tip-text cost-top-tip-text">
            總交易成本 ${{ separator(costValue) }}
          </div>
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
              {
                'chart-freeze':
                  costTipState ||
                  lossTipState ||
                  (chartIsFreeze !== 'benefit' && chartIsFreeze.length > 0),
              },
            ]"
            @click.prevent="toggleTip('benefit')"
            @mouseover.prevent="showTip('benefit')"
            @mouseleave.prevent="hideTip('benefit')"
          ></path>
          <path
            :class="[
              'cost',
              {
                'chart-freeze':
                  benefitTipState ||
                  lossTipState ||
                  (chartIsFreeze !== 'cost' && chartIsFreeze.length > 0),
              },
            ]"
            @click.prevent="toggleTip('cost')"
            @mouseover.prevent="showTip('cost')"
            @mouseleave.prevent="hideTip('cost')"
          ></path>
          <path
            :class="[
              'loss',
              {
                'chart-freeze':
                  benefitTipState ||
                  costTipState ||
                  (chartIsFreeze !== 'loss' && chartIsFreeze.length > 0),
              },
            ]"
            @click.prevent="toggleTip('loss')"
            @mouseover.prevent="showTip('loss')"
            @mouseleave.prevent="hideTip('loss')"
          ></path>
          <line class="horizontal-line"></line>
        </g>
        <!-- 虛線 -->
        <line
          v-show="benefitTipState || chartIsFreeze === 'benefit'"
          class="benefit-line tip-line"
          :x1="2 * rectStep - rectWidth + rectWidth / 2"
          y1="-16"
          :x2="2 * rectStep - rectWidth + rectWidth / 2"
          y2="0"
        />
        <line
          v-show="costTipState || chartIsFreeze === 'cost'"
          class="cost-line tip-line"
          :x1="3 * rectStep - rectWidth + rectWidth / 2"
          y1="-16"
          :x2="3 * rectStep - rectWidth + rectWidth / 2"
          :y2="
            height -
            height * (costValue / totalH) +
            height * (maxNegative / totalH)
          "
        />
        <line
          v-show="lossTipState || chartIsFreeze === 'loss'"
          class="loss-line tip-line"
          :x1="2 * rectStep - rectWidth + rectWidth / 2"
          y1="-16"
          :x2="2 * rectStep - rectWidth + rectWidth / 2"
          :y2="height * (benefitValue / totalH)"
        />
        <!-- 標籤名稱 -->
      </svg>
      <div class="tag-list">
        <div class="tag-name" @click.prevent="toggleTip('benefit')">
          <span class="benefit-tag"></span>&nbsp;&nbsp;已實現獲利
        </div>
        <div class="tag-name" @click.prevent="toggleTip('loss')">
          <span class="loss-tag"></span>&nbsp;&nbsp;已實現虧損
        </div>
        <div class="tag-name" @click.prevent="toggleTip('cost')">
          <span class="cost-tag"></span>&nbsp;&nbsp;總交易成本
        </div>
      </div>
    </div>
  </div>
  <div v-show="false">
    <input v-model="benefitValue" type="number" />
    <input v-model="costValue" type="number" />
    <input v-model="maxNegative" type="number" />
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
// const benefitTipX = ref(0);
// const costTipX = ref(0);
// const lossTipX = ref(0);
const maxY = ref(0);
const minY = ref(10);
const benefitTipState = ref(false);
const costTipState = ref(false);
const lossTipState = ref(false);
const tipIsEllipsis = ref(false);
const chartIsFreeze = ref("");

// 取得當下資訊框端度
// const getTipWidth = () => {
//   setTimeout(() => {
//     const benefitDOM = document.querySelector(
//       ".benefit-top-tip-text"
//     ) as HTMLElement | null;
//     const costDOM = document.querySelector(
//       ".cost-top-tip-text"
//     ) as HTMLElement | null;
//     const lossDOM = document.querySelector(
//       ".loss-top-tip-text"
//     ) as HTMLElement | null;
//     if (benefitDOM !== null) {
//       benefitTipX.value = benefitDOM.offsetWidth;
//     }
//     if (costDOM !== null) {
//       costTipX.value = costDOM.offsetWidth;
//     }
//     if (lossDOM !== null) {
//       lossTipX.value = lossDOM.offsetWidth;
//     }
//   }, 500);
// };

// 取得資料
const getData = (benefitNum: number, costNum: number, lossNum: number) => {
  // 假資料
  const demoData: chartData = {
    title: "Phasellus sit amet",
    description:
      "Lorem ipsum dolor sit amet, curabitur adipiscing elit. Etiam sagittis porttitor nec vehicula.",
    benefitVal: benefitNum,
    costVal: costNum,
    lossVal: lossNum,
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

  if (chartType === "loss") {
    tl = 0;
    tr = 0;
    bl = rectRadius;
    br = rectRadius;
    h = height.value * (Math.abs(val) / totalH.value);
    y = height.value - height.value * (Math.abs(val) / totalH.value);
    x = order * rectStep - w + leftScaleBar;
    // 儲存最小的顯示高度
    // if (h > minY.value) {
    // console.log("儲存最小的顯示高度: ", h);
    minY.value = h;
    // }
  } else {
    // 儲存最大的顯示高度
    // if (h > maxY.value) {
    //   // console.log("儲存最大的顯示高度: ", h);
    //   maxY.value = h;
    // }
    if (benefitValue.value > costValue.value && chartType === "benefit") {
      maxY.value = h;
    }
    if (costValue.value > benefitValue.value && chartType === "cost") {
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
  if (chartIsFreeze.value === chartType) {
    chartIsFreeze.value = "";
    hideTip(chartType);
  } else {
    switch (chartType) {
      case "benefit":
        chartIsFreeze.value = "benefit";
        break;
      case "cost":
        chartIsFreeze.value = "cost";
        break;
      case "loss":
        chartIsFreeze.value = "loss";
        break;
      default:
        break;
    }
  }
};

// 顯示資訊框
const showTip = (chartType: string) => {
  // 顯示
  chartIsFreeze.value = "";
  benefitTipState.value = false;
  costTipState.value = false;
  lossTipState.value = false;
  switch (chartType) {
    case "benefit":
      if (benefitValue.value > 100000000000000000) {
        tipIsEllipsis.value = true;
      }
      benefitTipState.value = true;
      break;
    case "cost":
      if (costValue.value > 100000000000000000) {
        tipIsEllipsis.value = true;
      }
      costTipState.value = true;
      break;
    case "loss":
      if (maxNegative.value < -100000000000000000) {
        tipIsEllipsis.value = true;
      }
      lossTipState.value = true;
      break;
    default:
      break;
  }
};

// 隱藏資訊框
const hideTip = (chartType: string) => {
  if (chartIsFreeze.value !== chartType) {
    benefitTipState.value = false;
    costTipState.value = false;
    lossTipState.value = false;
    tipIsEllipsis.value = false;
  }
};

// 數字轉成含逗號字串
const separator = (numb: number) => {
  // const str = numb.toString().split(".");
  // str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // return str.join(".");
  return numb.toLocaleString("en-US");
};

// 繪製圖表
const drawChart = () => {
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
};
onMounted(() => {
  getData(270537, 216801, -33910);
  // drawChart();
});

// 監聽後更新
watch([benefitValue, costValue, maxNegative], async (newVal, oldVal) => {
  await getData(...newVal);
  await drawChart();
});
</script>
<style lang="scss">
// 定義共用變數
$benefitMain: #1977ff;
$costMain: #fa8903;
$lossMain: #231fc0;
$benefitSub: #b3d6ff;
$costSub: #fdddb3;
$lossSub: #bdbcec;
$grayLight: #e7eaf2;
$grayMiddle: #919eaa;
$grayDark: #444;
$white: #fff;
$titleTextSize: 18px;
$contentTextSize: 14px;
$tipTextSize: 13px;
// 巢狀樣式
.card {
  width: auto;
  max-width: 325px;
  margin: 0 auto;
  border: 1px solid $grayLight;
  padding: 20px;
  border-radius: 10px;
  .card-title {
    text-align: left;
    color: $grayDark;
    font-size: $titleTextSize;
    margin: 0;
  }
  .card-description {
    text-align: left;
    color: $grayMiddle;
    font-size: $contentTextSize;
    margin: 5px 0 0 0;
  }
  .svgboard-container {
    /* resize: horizontal; */
    overflow: visible;
    width: 100%;
    height: auto;
    margin: 0 auto;
    margin-top: 50px;
    #svgboard {
      overflow: visible;
      // 長條圖
      g {
        path {
          cursor: pointer;
        }
        .benefit {
          fill: $benefitMain;
          &.chart-freeze {
            fill: $benefitSub;
          }
        }
        .loss {
          fill: $lossMain;
          &.chart-freeze {
            fill: $lossSub;
          }
        }
        .cost {
          fill: $costMain;
          &.chart-freeze {
            fill: $costSub;
          }
        }
        .horizontal-line {
          stroke: #c3cbd3;
          stroke-width: 1px;
        }
      }
      // 刻度
      .scale-bar-text-box {
        width: 60px;
        height: 30px;
        .scale-bar-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: right;
        }
      }
      // 資訊框
      .top-tip-text-box {
        opacity: 0;
        /* width: calc(100% + 40px); */
        width: 100%;
        height: 32px;
        .top-tip-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
          color: $white;
          font-size: $tipTextSize;
          height: 32px;
          line-height: 32px;
          background: $grayDark;
          border-radius: 4px;
          display: inline-block;
          padding: 0 10px;
        }
        &.tip-is-ellipsis {
          .top-tip-text {
            display: block;
          }
        }
        &.hide-item {
          opacity: 1;
        }
      }
      // 虛線
      .tip-line {
        stroke: $grayMiddle;
        stroke-width: 1px;
        stroke-dasharray: 4px;
      }
    }
    // 名稱標籤
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      margin: 30px 0 10px 0;
      justify-content: center;
      .benefit-tag {
        background: $benefitMain;
      }
      .cost-tag {
        background: $costMain;
      }
      .loss-tag {
        background: $lossMain;
      }
      .tag-name {
        width: 160px;
        font-size: $contentTextSize;
        margin: 5px 0;
        color: $grayDark;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        & > span {
          width: 15px;
          height: 15px;
        }
      }
    }
  }
}
</style>

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
        <foreignObject v-show="maxY > 23" x="0" y="0" width="60" height="30">
          <div class="scale-bar-text">{{ outPutMaxVal }}</div>
        </foreignObject>
        <foreignObject x="0" :y="horizontalY - 10" width="60" height="30">
          <div class="scale-bar-text">0</div>
        </foreignObject>
        <foreignObject
          v-show="minY > 22"
          x="0"
          :y="height - 18"
          width="60"
          height="30"
        >
          <div class="scale-bar-text">{{ outPutMinVal }}</div>
        </foreignObject>
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
const maxNegative = ref(0); // 最小負數
const padding = 20;
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

// 取得資料
const getData = () => {
  // 假資料
  const demoData: chartData = {
    title: "Maecenas elit quam",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id nisi placerat, placerat dui dictum.",
    info: [
      {
        type: "benefit",
        value: 2705370,
      },
      {
        type: "cost",
        value: 2168010,
      },
      {
        type: "loss",
        value: -439100,
      },
    ],
  };
  // 輸入資料
  chartTitle.value = demoData.title;
  chartDescription.value = demoData.description;
  dataSet.value = demoData.info;
  const flatArr = demoData.info.map((item) => item.value);
  // 取得最大最小值
  maxValue.value = Math.max(...flatArr);
  maxNegative.value = Math.min(...flatArr);
  // 正負最大高度總合
  totalH.value = maxValue.value + Math.abs(maxNegative.value);
  height.value = disPlayH;
  width.value = (demoData.info.length - 1) * rectStep + rectStep - rectWidth;
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

onMounted(() => {
  getData();

  // 設置畫板
  const svgboard = d3.select("#svgboard").append("g");
  // .append("svg")
  // .attr("id", "svgboard")
  // .attr("viewBox", "0 0 200 200")
  // .attr("preserveAspectRatio", "xMinYMin meet")
  // .attr("width", "100%") //  width.value
  // .attr("height", height.value)
  //
  // .attr("transform", "translate(0,80)");

  // 繪製長條圖
  dataSet.value.forEach((item, index) => {
    svgboard
      .append("path")
      .attr("class", item.type)
      .attr("d", drawRect(index, item.value));
  });

  function drawRect(order, val) {
    const w = rectWidth;
    // 使用 maxValue 作為畫面高度 100% 計算該筆資料佔畫面的百分比
    let h = height.value * (val / totalH.value);
    let x = (order + 1) * rectStep - w + leftScaleBar;
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
      x = (0 + 1) * rectStep - w + leftScaleBar;
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
  }

  // 畫水平線
  const drawLine = svgboard.append("line");
  drawLine.attr("stroke-width", 1);
  drawLine.attr("stroke", "#ccc");
  drawLine.attr("x1", 0 + +leftScaleBar);
  drawLine.attr("y1", horizontalY.value);
  drawLine.attr("x2", width.value + leftScaleBar);
  drawLine.attr("y2", horizontalY.value);

  // 繪製刻度文字
  // const scaleBarText = svgboard
  //   .append("text")
  //   .attr("class", "scale-bar-text")
  //   .attr("text-anchor", "middle")
  //   .attr("x", leftScaleBar)
  //   .attr("y", 13)
  //   .text("12345678910");

  // 加上數字
  // const text = svgboard
  //   .selectAll("text")
  //   .data(dataSet.value)
  //   .enter()
  //   .append("text")
  //   .attr("fill", "#f00")
  //   .attr("font-size", "14px")
  //   .attr("text-anchor", "middle")
  //   .attr("x", (d, i) => {
  //     return padding + (i + 1) * rectStep;
  //   })
  //   .attr("y", (d) => {
  //     return height.value - padding - height.value * (d / maxValue.value);
  //   })
  //   .attr("dx", rectWidth / 2)
  //   .attr("dy", "1em")
  //   .text((d) => {
  //     return "已實現獲利 $ 222222" + String(d);
  //   });
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
</style>

<template>
  <div class="card">
    <h2 class="card-title">{{ chartTitle }}</h2>
    <h4 class="card-description">{{ chartDescription }}</h4>
    <div class="svgboard-container"></div>
  </div>
</template>
<script setup lang="ts">
import * as d3 from "d3";
import { chartData, chartInfoList } from "../type/types";

const dataSet = ref<chartInfoList>([]);
const chartTitle = ref("");
const chartDescription = ref("");
const width = ref(125); // 畫布寬度
const height = ref(400); // 畫布高度
const maxNegative = ref(0); // 最小負數
const padding = 20;
const rectStep = 90; // 長條圖的間距
const rectWidth = 35; // 長條圖的寬度
const rectRadius = 4; // 長條圖的圓角
const maxValue = ref(300); // 最大正數
const disPlayH = 500;
const scaleVar = ref(1);

// 取得資料
const getData = () => {
  const demoData: chartData = {
    title: "Maecenas elit quam",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id nisi placerat, placerat dui dictum.",
    info: [
      {
        type: "benefit",
        value: 800,
      },
      {
        type: "cost",
        value: 210,
      },
      {
        type: "loss",
        value: -80,
      },
    ],
  };
  chartTitle.value = demoData.title;
  chartDescription.value = demoData.description;
  dataSet.value = demoData.info;
  const flatArr = demoData.info.map((item) => item.value);
  maxValue.value = Math.max(...flatArr);
  maxNegative.value = Math.min(...flatArr);
  // 正負最大高度總合
  // const totalH = maxValue.value + Math.abs(maxNegative.value);
  height.value = maxValue.value + Math.abs(maxNegative.value);
  // height.value = disPlayH;
  // 修正比例
  // scaleVar.value = disPlayH / totalH;
  width.value = (demoData.info.length - 1) * rectStep + rectStep - rectWidth;
};

onMounted(() => {
  getData();

  // 設置畫板
  // .attr("preserveAspectRatio", "xMinYMin slice")
  const svgboard = d3
    .select(".svgboard-container")
    .append("svg")
    .attr("id", "svgboard")
    .attr("width", width.value)
    .attr("height", height.value)
    .append("g");

  // 繪製長條圖
  dataSet.value.forEach((item, index) => {
    svgboard
      .append("path")
      .attr("class", item.type)
      .attr("d", drawRect(index, item.value));
  });

  function drawRect(order, val) {
    // val = val * scaleVar.value;
    const w = rectWidth;
    // 使用 maxValue 作為畫面高度 100% 計算該筆資料佔畫面的百分比
    let h = maxValue.value * (val / height.value);
    // let h = val * scaleVar.value;
    let x = (order + 1) * rectStep - w;
    // 畫面高度 - 長條圖高度 = 繪製長條圖的起點
    let y = height.value - Math.abs(maxNegative.value) - h - padding;

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
      h = maxValue.value * (Math.abs(val) / height.value);
      // h = Math.abs(val) * scaleVar.value;
      y = height.value - Math.abs(val) - padding;
      x = (0 + 1) * rectStep - w;
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
  drawLine.attr("x1", 0);
  drawLine.attr("y1", height.value - padding - Math.abs(maxNegative.value));
  drawLine.attr("x2", width.value);
  drawLine.attr("y2", height.value - padding - Math.abs(maxNegative.value));

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
.benefit {
  fill: #1977ff;
}
.loss {
  fill: #231fc0;
}
.cost {
  fill: #fa8903;
}
</style>

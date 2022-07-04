# D3 Chart DEMO

DEMO 網址: https://dev.puraliena.com/

> 此長條圖建置邏輯都在`Chart.vue`，這個 component 裡面完成。

## 一、顯示狀態與互動

可以 Hover 顯示狀態，又可以 Click 凍結狀態，有先後順序的情況下，所以會延伸`第4點`的情況。

1. Default 顯示
  ![01-default](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/01-default.png)
    + 資料結構為
      ```javascript
      interface chartData {
        title: string
        description: string
        benefitVal: number
        costVal: number
        lossVal: number
      }
        ```

2. 長條圖 Hover 顯示
  ![02-hover](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/02-hover.gif)
3. 長條圖 Click 顯示
  ![03-click](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/03-click.gif)
4. 長條圖 Click 後, 去 Hover 其它長條圖
  ![04-hover-after-click](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/04-hover-after-click.gif)

## 二、數值問題

### A. 與設計稿的問題說明
因為整個圖表的比例是按照數值加總起來的，所以如果按照原本設計稿的數值輸入：
- `benefitVal = 270537`
- `costVal = 216801`
- `lossVal = -791`
- 實際顯示 :
![Mock-Data](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/10-mock-data.png)
  > 1.原本的-791會因為跟其他數值差異太大，導致比例壓到幾乎看不到。<br>2.因為長度過短，甚至幾乎沒有，會導致左邊的刻度很尷尬，所以設計成，長度過小或快要撞到，就會讓刻度消失。<br>3.左邊的 270.5K 是否要自動進位成 271K 的問題，因為考慮到下方負數也要統一標準，所以就沒有讓它自動進位了。
- 原設計稿比對 :
![Mockup](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/11-mock-up.png)


### B. 三長條圖皆正常顯示條件
數值之間比例不要差距過大，才能夠三個長條圖都能正常顯示。
+ `benefitVal = 270537`
+ `costVal = 216801`
+ `lossVal = -33910`
![01-default](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/01-default.png)

### C. 刻度單位
- 十位 / 個位 : 直接顯示數值
- 千 : K
- 百萬 : M
- 十億 : B
- 一兆 : T

### D. 極端案例說明
因為會有比例懸殊的問題，所以不管正數還是負數都要測。
假如，真的有天文數字進來這個組件，目前是用...的方式省略，才不會讓畫面壞掉。

#### 1. 正數極大
- 最大值
  + `benefitVal = 9705370000000000`
  + `costVal = 1168010000000000`
  + `lossVal = -3391000000000000`
![05-int-max](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/05-int-max.png)<br>
    > 萬兆為顯示的最大值

- 超過最大值, 產生省略
  + `benefitVal = 170537000000000000`
  + `costVal = 1168010000000000`
  + `lossVal = -339100000000000`
![06-int-max-ellipsis](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/06-int-max-ellipsis.png)<br>
    > 十萬兆開始會有省略號

#### 2. 正數極小
- 最小值
  + `benefitVal = 1`
  + `costVal = 10`
  + `lossVal = -3391000000000000`
![07-1-int-min](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/07-1-int-min.png)<br>![07-2-int-min](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/07-2-int-min.png)<br>![07-3-int-min](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/07-3-int-min.png)<br>
    > 比例小到一種程度就不會顯示刻度, 但可以藉由`點擊下方標籤`顯示資訊

#### 3. 負數極大
- 最大值
  + `benefitVal = 3705370000000000`
  + `costVal = 1168010000000000`
  + `lossVal = -9391000000000000`
![08-1-negative-int-max](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/08-2-negative-int-max-ellipsis.png)<br>
    > 負萬兆為顯示的最大值

- 超過最大值, 產生省略
  + `benefitVal = 37053700000000000`
  + `costVal = 11680100000000000`
  + `lossVal = -939100000000000000`
![08-2-negative-int-max-ellipsis](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/08-1-negative-int-max.png)<br>
    > 負十萬兆開始會有省略號

#### 4. 負數極小
- 最小值
  + `benefitVal = 3705370000000000`
  + `costVal = 1168010000000000`
  + `lossVal = -1`
![09-negative-int-min](https://raw.githubusercontent.com/a131381568/d3-chart-master/main/doc/09-negative-int-min.png)<br>
    > 比例小到一種程度就不會顯示刻度, 但可以藉由`點擊下方標籤`顯示資訊


# D3 Chart DEMO

DEMO 網址: https://dev.puraliena.com/

## 一、顯示狀態與互動

可以 Hover 顯示狀態，又可以 Click 凍結狀態，有先後順序的情況下，所以會延伸`第4點`的情況。

1. Default 顯示
  ![Default](https://###)
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
  ![Hover](https://###)
3. 長條圖 Click 顯示
  ![Click](https://###)
4. 長條圖 Click 後, , 去後 Hover 其它長條圖
  ![Hover-After-Click](https://###)

## 數值問題

- 正常三長條圖皆顯示
  + `benefitVal = 270537`
  + `costVal = 216801`
  + `lossVal = -33910`
  ![Default]()


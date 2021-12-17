## mp-list 列表组件

### 使用指南

在 app.json 或 index.json 中引入组件

es6

```json
"usingComponents": {
  "mp-list": "/componenet/list/index"
}
```

### 代码演示

#### 基础用法

在`json`中引入自己写的业务组件和list组件

```json
"component-info": "/components/info/index",
"component-list": "/componenet/list/index"
```

需要传入一个`getListFunc`的方法，如果数据需要格式化，需要在传入一个`formatFunc`方法

```html
<component-list
  generic:listitem="component-info"
  getListFunc="{{getListFunc}}"
  id="pairListComponent"
/>
```

```javascript
import { getPairList } from xxx
import { formatMatPairList } from './data.js'

Page({
  data: {
    getListFunc: getPairList, // 获取配对数据
    formatFunc: formatMatPairList, // 列表数据格式化
  },

   pairListComponent: null,

   /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.pairListComponent = this.selectComponent('#pairListComponent')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 下拉刷新
    this.pairListComponent.setPageDataToInit()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 触底加载更多数据
    this.pairListComponent.getMorePageData()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.pairListComponent = null
  },

});
```

#### 带分页的 List

可以通过`size`属性，指定分页数

```html
<component-list
  size="{{3}}"
  generic:listitem="component-info"
  getListFunc="{{getListFunc}}"
  id="pairListComponent" />
```

#### 带缺省页的 List

可以通过`slot=default`属性传入自定义缺省页内容

```html
<component-list
  size="{{3}}"
  generic:listitem="component-info"
  getListFunc="{{getListFunc}}"
  id="pairListComponent" />
  <!-- 传入自定义缺省页 -->
  <view slot="default" class="list-no-data">暂无内容</view>
</component-list>
```

#### 需要格式化数据的 list

如果需要对列表中的数据进行格式化，需要传入自定义`formatFunc`, 方法需要自定义，传入参数为返回列表中的数据项。

```javascript
import { getPairList } from xxx
import { formatDateTime } from xxx

const formatPairList = res => {
  // 格式化时间
  if (res.bothLikeTime) {
      res.bothLikeTime = formatDateTime(new Date(res.bothLikeTime)).substring(0, 16)
  }

  return res
}

Page({
  data: {
    getListFunc: getPairList, // 获取配对数据
    formatFunc: formatPairList, // 列表数据格式化
  },

   pairListComponent: null,
   ...
});
```

#### 带参数的 List

可以通过`params`属性，指定分页参数 `size`、`current` 以外其他参数，由于`params`的参数通常会是外部传入或者通过接口获取，列表需要参数准备完毕后再获取，此时需要传入`init="{{false}}"`。然后再component和数据加载完毕后再进行初始化

```` js
Page({
  data: {
    getListFunc: getPairList, // 获取配对数据
    formatFunc: formatMatPairList, // 列表数据格式化
    params: {  // 查询列需要传入分页以外的参数
      sourceId: -1,
      sourceType: 3, // 动态
      queryLevel: 1,
      showOwnStatus: 1,
      showDetailInfo: 0,
    },
  },

   onLoad: function(options) {
    if (!options.hasOwnProperty('id')) return

    const id = options.id

    this.id = id
    this.s = Number(options.s || 1)
    this.comment = options.comment || ''

    // 初始化参数
    this.setData({
      'params.sourceId': id,
    })
  },

  onReady: function() {
    this.commentListComponent = this.selectComponent('#commentListComponent')

    // 获取第一页数据
    this.commentListComponent.getPageData()
  })
})
````

```html
<component-list
  size="{{5}}"
  params="{{params}}"
  generic:listitem="cp-comment"
  getListFunc="{{getListFunc}}"
  formatFunc="{{formatComment}}"
  init="{{false}}"
  bind:replyClick="onReplyClick"
  id="commentListComponent" 
/>
```

#### 业务组件中的方法需要传递到list中

用户在业务组件中触发的事件需要在`list`中回调

`component-info/index.js`
````javascript
Component({
  ...
  /**
   * 点击回复
   */
  onReplyClick() {
    this.triggerEvent('replyClick', this.data.data, {
      bubbles: true,
      composed: true,
    })
  },
  ...
})
````

列表页面`pair-list/index.js`
```html
<component-list
  size="{{5}}"
  params="{{params}}"
  generic:listitem="cp-comment"
  getListFunc="{{getListFunc}}"
  formatFunc="{{formatComment}}"
  init="{{false}}"
  bind:replyClick="onReplyClick"
  id="commentListComponent"
/>
```

#### 刷新列表中某一项需要详细参数
如果后台接口是通过两个列表进行管理查询，`size`不同导致查询的结果不通，例如： 传入 `{size:5, current:1 }` 和`{size:1, current:5 }` 的结果不一样，那刷新跟进页就需要传入特殊参数

````
Page({
  data: {
    detailParams: {
      // 刷新参数
      momentId: null,
    },
  }

  ...
  /**
    * 状态点击
    * @param {Event} e
    */
  onItemClick(e) {
    const id = e.detail.item.id

    // 进入跟进页
    wx.navigateTo({
      url: `/pages/dynamic/my-dynamic/index?id=${id}&s=1`,
    })

    this.setData({
      'detailParams.momentId': id,
    })
  },

})
````


````html
<!-- 动态 -->
<component-list
  id="dynamicListComponent"
  size="{{5}}"
  generic:listitem="cp-dynamic"
  detailParams="{{detailParams}}"
  bind:click="onItemClick"
  getListFunc="{{getMomentSquareList}}"
  formatFunc="{{formatDynamicContent}}"
  bind:topClick="onDynamicClick"
  bind:likeAnimation="showLikeAnimation"
  bind:comment="showComment"
  bind:replyClick="onReplyClick"
/>
````

这样从跟进页返回列表后就能刷新之前点击的item的内容了！

### 业务组件可接受的参数
| 参数            | 说明                     | 类型       | 默认值 |
| --------------- | ----------------------- | ---------- | ------ |
| data            | 组件自动初始化             | `Object`  | `{}`    |
| index           | 当前组件再列表中的位置       | `Number`   | `0`   |

### API

| 参数            | 说明                     | 类型       | 默认值 |
| --------------- | ----------------------- | ---------- | ------ |
| init            | 组件自动初始化             | `Boolean`  | false |
| size            | 分页数                   | `Number`   | `[]`   |
| params          | 列表其他请求参数           | `Object`   |  -     |
| detailParams    | 查询详情参数              | `Object`   |  -     |
| getListFunc     | 获取列表方法              | `Function` |  -     |
| formatFunc      | 数据格式化方法            | `Function` |  -     |
| followUpRefresh | 进入跟进页后是否需要刷新    | `Boolean`  |  true  |

### Event

| 事件名      | 说明               | 参数                                                 |
| ---------- | ------------------ | ----------------------------------------------------|
| bind:click | 点击当前列表项触发 | event.detail: 选项对应的对象                         |
| bind:ready | 数据加载完毕触发   | event.detail: 接口返回的数据{ total: 2, records: []} |

### Slot

| 名称    | 说明   |
| ------- | ------ |
| default | 缺省页 |


### list 方法

| 名称    | 说明   |
| ------- | ------ |
| setPageDataToInit | 加载第一页 |
| getMorePageData | 加载更多 |


### TODO 待优化点

01 页面的下拉刷新和触底加载更多待抽象成公用的方法

| 参数              | 说明                                   | 类型       | 默认值             |
| ----------------- | -------------------------------------- | ---------- | ------------------ |
| onReady           | 生命周期函数--监听页面初次渲染完成     | `Function` | 获取 component     |
| onReachBottom     | 页面上拉触底事件的处理函数             | `Function` | 加载更多           |
| onPullDownRefresh | 页面相关事件处理函数--监听用户下拉动作 | `Function` | 设置数据为初始数据 |
| onUnload          | 生命周期函数--监听页面卸载             | `Function` | 释放掉 component   |

02 如果业务组件中有预览图片大图或者全屏观看视频的功能，观看后返回，会触发页面`onShow`方法，导致该项自动刷新（本来不需要刷新）

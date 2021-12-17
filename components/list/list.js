const pageListBehavior = require('../../mixins/list/index.js');

Component({
    options: {
        multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    },

    behaviors: [pageListBehavior()],

    /**
     * 组件的属性列表
     */
    properties: {
        init: {
            type: Boolean,
            value: true,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {},

    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {
            this.onPageShow();
        },
    },

    lifetimes: {
        attached: function () {
            if (!this.data.init) return;

            this.getPageData();
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {},
});
